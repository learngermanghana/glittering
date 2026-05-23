import { NextResponse } from "next/server";

const DEFAULT_SEDIFEX_BASE_URL = "https://us-central1-sedifex-web.cloudfunctions.net";
const DEFAULT_SEDIFEX_SITE_BASE_URL = "https://www.sedifex.com";
const DEFAULT_STORE_ID = "37mJqg20MjOriggaIaOOuahDsgj1";

type TrainingCheckoutBody = {
  course?: string;
  coursePrice?: number;
  duration?: string;
  apprentice?: Record<string, string>;
  guarantor?: Record<string, string>;
  healthComplications?: string[];
  notes?: string;
};

type AnyRecord = Record<string, unknown>;

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getApiKey() {
  return process.env.SEDIFEX_CHECKOUT_API_KEY?.trim() || process.env.SEDIFEX_INTEGRATION_API_KEY?.trim() || process.env.SEDIFEX_BOOKING_API_KEY?.trim() || "";
}

function getStoreId() {
  return process.env.SEDIFEX_BOOKING_TARGET_STORE_ID?.trim() || process.env.NEXT_PUBLIC_SEDIFEX_STORE_ID?.trim() || DEFAULT_STORE_ID;
}

function getBaseUrl() {
  return (process.env.SEDIFEX_INTEGRATION_API_BASE_URL || process.env.SEDIFEX_API_BASE_URL || DEFAULT_SEDIFEX_BASE_URL).replace(/\/$/, "");
}

function getSedifexSiteBaseUrl() {
  return (process.env.SEDIFEX_SITE_BASE_URL || process.env.NEXT_PUBLIC_SEDIFEX_SITE_BASE_URL || DEFAULT_SEDIFEX_SITE_BASE_URL).replace(/\/$/, "");
}

function getStudentRegistrationIntakeUrl() {
  return process.env.SEDIFEX_STUDENT_REGISTRATION_INTAKE_URL?.trim() || `${getSedifexSiteBaseUrl()}/api/student-registration-intake`;
}

function getStudentRegistrationsUrl() {
  return process.env.SEDIFEX_INTEGRATION_STUDENT_REGISTRATIONS_URL?.trim() || `${getBaseUrl()}/v1IntegrationStudentRegistrations`;
}

function getCheckoutCreateUrl() {
  return process.env.SEDIFEX_INTEGRATION_CHECKOUT_CREATE_URL?.trim() || process.env.SEDIFEX_CHECKOUT_CREATE_URL?.trim() || `${getBaseUrl()}/integrationCheckoutCreate`;
}

function getAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://www.glitteringmedspa.com").replace(/\/$/, "");
}

function getReturnUrl() {
  return process.env.SEDIFEX_REGISTRATION_RETURN_URL || process.env.SEDIFEX_CHECKOUT_RETURN_URL || `${getAppUrl()}/checkout/success`;
}

function parseJsonSafely<T>(value: string): T | null {
  try {
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

function readRegistrationId(data: AnyRecord | null) {
  const registration = (data?.registration ?? {}) as AnyRecord;
  const nestedData = (data?.data ?? {}) as AnyRecord;
  const candidates = [
    data?.submissionId,
    data?.registrationId,
    data?.registration_id,
    data?.id,
    registration.registrationId,
    registration.id,
    nestedData.registrationId,
    nestedData.id,
  ];
  for (const candidate of candidates) if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  return "";
}

function readCheckoutUrl(data: AnyRecord | null) {
  const payment = (data?.payment ?? {}) as AnyRecord;
  const source = ((data?.data as AnyRecord | undefined) || (data?.checkout as AnyRecord | undefined) || data || {}) as AnyRecord;
  const value =
    payment.authorizationUrl ||
    payment.authorization_url ||
    payment.checkoutUrl ||
    payment.checkout_url ||
    source.checkoutUrl ||
    source.checkout_url ||
    source.authorizationUrl ||
    source.authorization_url;
  return typeof value === "string" ? value : "";
}

function readReference(data: AnyRecord | null) {
  const payment = (data?.payment ?? {}) as AnyRecord;
  const candidates = [data?.reference, data?.paymentReference, data?.payment_reference, payment.reference];
  for (const candidate of candidates) if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  return "";
}

function buildCustomer(apprentice: Record<string, string>) {
  return {
    name: readString(apprentice.full_name),
    email: readString(apprentice.email).toLowerCase(),
    phone: readString(apprentice.contact),
  };
}

function buildIntakePayload(input: {
  storeId: string;
  course: string;
  coursePrice: number;
  duration?: string;
  apprentice: Record<string, string>;
  guarantor: Record<string, string>;
  healthComplications: string[];
  notes?: string;
}) {
  const customer = buildCustomer(input.apprentice);
  return {
    storeId: input.storeId,
    pageId: "glittering-academy-registration",
    source: "glittering_academy_register_page",
    customer,
    data: {
      studentName: customer.name,
      email: customer.email,
      phone: customer.phone,
      course: input.course,
      program: input.course,
      preferredClassTime: readString(input.apprentice.preferred_class_time),
      branch: readString(input.apprentice.branch) || "Glittering Med Spa Academy",
      location: readString(input.apprentice.branch) || "Glittering Med Spa Academy",
      notes: readString(input.notes),
      duration: input.duration || "",
      apprentice: input.apprentice,
      guarantor: input.guarantor,
      healthComplications: input.healthComplications,
    },
    payment: {
      mode: "online",
      amount: input.coursePrice,
      currency: "GHS",
      callbackUrl: getReturnUrl(),
    },
  };
}

async function trySedifexStudentIntake(input: {
  storeId: string;
  course: string;
  coursePrice: number;
  duration?: string;
  apprentice: Record<string, string>;
  guarantor: Record<string, string>;
  healthComplications: string[];
  notes?: string;
}) {
  const response = await fetch(getStudentRegistrationIntakeUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(buildIntakePayload(input)),
    cache: "no-store",
  });

  const raw = await response.text();
  const parsed = parseJsonSafely<AnyRecord>(raw);
  const checkoutUrl = readCheckoutUrl(parsed);
  const registrationId = readRegistrationId(parsed);
  const reference = readReference(parsed);

  if (!response.ok || !checkoutUrl) {
    console.warn("Sedifex student intake did not return checkout", { status: response.status, body: raw });
    return null;
  }

  return { registrationId, clientOrderId: reference || registrationId, checkoutUrl, authorizationUrl: checkoutUrl, source: "student-registration-intake" };
}

async function fallbackIntegrationCheckout(input: {
  storeId: string;
  apiKey: string;
  course: string;
  coursePrice: number;
  duration?: string;
  apprentice: Record<string, string>;
  guarantor: Record<string, string>;
  healthComplications: string[];
  notes?: string;
}) {
  const customer = buildCustomer(input.apprentice);
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Sedifex-Contract-Version": process.env.SEDIFEX_CONTRACT_VERSION || "2026-04-13",
    Authorization: `Bearer ${input.apiKey}`,
    "x-api-key": input.apiKey,
  };

  const registrationPayload = {
    source: "website_training_registration",
    sourceChannel: "client_website",
    customer,
    data: {
      course: input.course,
      preferredClassTime: readString(input.apprentice.preferred_class_time),
      branch: readString(input.apprentice.branch) || "Glittering Training School",
      notes: readString(input.notes),
      apprentice: input.apprentice,
      guarantor: input.guarantor,
      healthComplications: input.healthComplications,
    },
    payment: {
      mode: "online_checkout",
      status: "checkout_created",
      amount: input.coursePrice,
      currency: "GHS",
    },
    amount: input.coursePrice,
    currency: "GHS",
    attributes: {
      source: "website_training_registration",
      courseDuration: input.duration,
    },
  };

  const registrationUrl = new URL(getStudentRegistrationsUrl());
  registrationUrl.searchParams.set("storeId", input.storeId);
  const registrationResponse = await fetch(registrationUrl, { method: "POST", headers, body: JSON.stringify(registrationPayload), cache: "no-store" });
  const registrationRaw = await registrationResponse.text();
  const registrationParsed = parseJsonSafely<AnyRecord>(registrationRaw);

  if (!registrationResponse.ok) {
    console.error("Training registration failed", { status: registrationResponse.status, body: registrationRaw });
    return NextResponse.json({ error: "We could not save the student registration right now." }, { status: 502 });
  }

  const registrationId = readRegistrationId(registrationParsed);
  const clientOrderId = registrationId ? `STUDENT-${registrationId}` : `STUDENT-${Date.now()}`;

  const checkoutPayload = {
    storeId: input.storeId,
    merchantId: input.storeId,
    clientOrderId,
    orderType: "student_registration",
    sourceChannel: "client_website",
    sourceLabel: "Training Registration",
    currency: "GHS",
    amount: input.coursePrice,
    customer,
    items: [{
      id: registrationId || input.course,
      item_id: registrationId || input.course,
      name: input.course,
      unitPrice: input.coursePrice,
      price: input.coursePrice,
      qty: 1,
      quantity: 1,
      type: "SERVICE",
      item_type: "service",
      serviceName: input.course,
    }],
    metadata: { registrationId, course: input.course, channel: "training-registration" },
    returnUrl: getReturnUrl(),
    cancelUrl: `${getAppUrl()}/checkout/success?status=cancelled&reference=${encodeURIComponent(clientOrderId)}`,
  };

  const checkoutResponse = await fetch(getCheckoutCreateUrl(), { method: "POST", headers, body: JSON.stringify(checkoutPayload), cache: "no-store" });
  const checkoutRaw = await checkoutResponse.text();
  const checkoutParsed = parseJsonSafely<AnyRecord>(checkoutRaw);
  const checkoutUrl = readCheckoutUrl(checkoutParsed);

  if (!checkoutResponse.ok || !checkoutUrl) {
    console.error("Training checkout failed", { status: checkoutResponse.status, body: checkoutRaw });
    return NextResponse.json({ error: "Registration saved, but payment checkout could not open.", registrationId }, { status: 502 });
  }

  return NextResponse.json({ ok: true, registrationId, clientOrderId, checkoutUrl, authorizationUrl: checkoutUrl, source: "integration-checkout-fallback" });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TrainingCheckoutBody;
    const storeId = getStoreId();
    const apiKey = getApiKey();
    const course = readString(body.course);
    const coursePrice = Number(body.coursePrice ?? 0);
    const apprentice = body.apprentice || {};
    const guarantor = body.guarantor || {};
    const customer = buildCustomer(apprentice);
    const healthComplications = Array.isArray(body.healthComplications) ? body.healthComplications : [];

    if (!course) return NextResponse.json({ error: "Please select a course." }, { status: 400 });
    if (!coursePrice || coursePrice <= 0) return NextResponse.json({ error: "Selected course needs a valid price." }, { status: 400 });
    if (!customer.name) return NextResponse.json({ error: "Full name is required." }, { status: 400 });
    if (!customer.phone && !customer.email) return NextResponse.json({ error: "Phone or email is required." }, { status: 400 });

    const intakeResult = await trySedifexStudentIntake({
      storeId,
      course,
      coursePrice,
      duration: body.duration,
      apprentice,
      guarantor,
      healthComplications,
      notes: body.notes,
    }).catch((error) => {
      console.warn("Sedifex student intake failed; trying fallback", error);
      return null;
    });

    if (intakeResult) return NextResponse.json({ ok: true, ...intakeResult });

    if (!apiKey) {
      return NextResponse.json({ error: "Sedifex student registration could not open and fallback API key is not configured." }, { status: 500 });
    }

    return await fallbackIntegrationCheckout({
      storeId,
      apiKey,
      course,
      coursePrice,
      duration: body.duration,
      apprentice,
      guarantor,
      healthComplications,
      notes: body.notes,
    });
  } catch (error) {
    console.error("Training registration checkout failed", error);
    return NextResponse.json({ error: "Unable to create training registration checkout." }, { status: 500 });
  }
}
