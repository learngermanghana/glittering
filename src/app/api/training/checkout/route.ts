import { NextResponse } from "next/server";

const DEFAULT_SEDIFEX_BASE_URL = "https://us-central1-sedifex-web.cloudfunctions.net";
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

function getStudentRegistrationsUrl() {
  return process.env.SEDIFEX_INTEGRATION_STUDENT_REGISTRATIONS_URL?.trim() || `${getBaseUrl()}/v1IntegrationStudentRegistrations`;
}

function getCheckoutCreateUrl() {
  return process.env.SEDIFEX_INTEGRATION_CHECKOUT_CREATE_URL?.trim() || process.env.SEDIFEX_CHECKOUT_CREATE_URL?.trim() || `${getBaseUrl()}/integrationCheckoutCreate`;
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
  const candidates = [data?.registrationId, data?.registration_id, data?.id, registration.registrationId, registration.id, nestedData.registrationId, nestedData.id];
  for (const candidate of candidates) if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  return "";
}

function readCheckoutUrl(data: AnyRecord | null) {
  const source = ((data?.data as AnyRecord | undefined) || (data?.checkout as AnyRecord | undefined) || data || {}) as AnyRecord;
  const value = source.checkoutUrl || source.checkout_url || source.authorizationUrl || source.authorization_url;
  return typeof value === "string" ? value : "";
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
    const studentName = readString(apprentice.full_name);
    const studentEmail = readString(apprentice.email).toLowerCase();
    const studentPhone = readString(apprentice.contact);

    if (!apiKey) return NextResponse.json({ error: "Sedifex integration key is not configured." }, { status: 500 });
    if (!course) return NextResponse.json({ error: "Please select a course." }, { status: 400 });
    if (!coursePrice || coursePrice <= 0) return NextResponse.json({ error: "Selected course needs a valid price." }, { status: 400 });
    if (!studentName) return NextResponse.json({ error: "Full name is required." }, { status: 400 });
    if (!studentPhone && !studentEmail) return NextResponse.json({ error: "Phone or email is required." }, { status: 400 });

    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Sedifex-Contract-Version": process.env.SEDIFEX_CONTRACT_VERSION || "2026-04-13",
      Authorization: `Bearer ${apiKey}`,
      "x-api-key": apiKey,
    };

    const registrationPayload = {
      source: "website_training_registration",
      sourceChannel: "client_website",
      customer: { name: studentName, email: studentEmail, phone: studentPhone },
      data: {
        course,
        preferredClassTime: readString(apprentice.preferred_class_time),
        branch: readString(apprentice.branch) || "Glittering Training School",
        notes: readString(body.notes),
        apprentice,
        guarantor,
        healthComplications: Array.isArray(body.healthComplications) ? body.healthComplications : [],
      },
      payment: {
        mode: "online_checkout",
        status: "checkout_created",
        amount: coursePrice,
        currency: "GHS",
      },
      amount: coursePrice,
      currency: "GHS",
      attributes: {
        source: "website_training_registration",
        courseDuration: body.duration,
      },
    };

    const registrationUrl = new URL(getStudentRegistrationsUrl());
    registrationUrl.searchParams.set("storeId", storeId);
    const registrationResponse = await fetch(registrationUrl, { method: "POST", headers, body: JSON.stringify(registrationPayload), cache: "no-store" });
    const registrationRaw = await registrationResponse.text();
    const registrationParsed = parseJsonSafely<AnyRecord>(registrationRaw);

    if (!registrationResponse.ok) {
      console.error("Training registration failed", { status: registrationResponse.status, body: registrationRaw });
      return NextResponse.json({ error: "We could not save the student registration right now." }, { status: 502 });
    }

    const registrationId = readRegistrationId(registrationParsed);
    const clientOrderId = registrationId ? `STUDENT-${registrationId}` : `STUDENT-${Date.now()}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.glitteringmedspa.com";

    const checkoutPayload = {
      storeId,
      merchantId: storeId,
      clientOrderId,
      orderType: "student_registration",
      sourceChannel: "client_website",
      sourceLabel: "Training Registration",
      currency: "GHS",
      amount: coursePrice,
      customer: { name: studentName, email: studentEmail, phone: studentPhone },
      items: [{ id: registrationId || course, item_id: registrationId || course, name: course, unitPrice: coursePrice, price: coursePrice, qty: 1, quantity: 1, type: "SERVICE", item_type: "service", serviceName: course }],
      metadata: { registrationId, course, channel: "training-registration" },
      returnUrl: process.env.SEDIFEX_CHECKOUT_RETURN_URL || `${appUrl}/payment/return`,
      cancelUrl: `${appUrl}/payment/return?status=cancelled&reference=${encodeURIComponent(clientOrderId)}`,
    };

    const checkoutResponse = await fetch(getCheckoutCreateUrl(), { method: "POST", headers, body: JSON.stringify(checkoutPayload), cache: "no-store" });
    const checkoutRaw = await checkoutResponse.text();
    const checkoutParsed = parseJsonSafely<AnyRecord>(checkoutRaw);
    const checkoutUrl = readCheckoutUrl(checkoutParsed);

    if (!checkoutResponse.ok || !checkoutUrl) {
      console.error("Training checkout failed", { status: checkoutResponse.status, body: checkoutRaw });
      return NextResponse.json({ error: "Registration saved, but payment checkout could not open.", registrationId }, { status: 502 });
    }

    return NextResponse.json({ ok: true, registrationId, clientOrderId, checkoutUrl, authorizationUrl: checkoutUrl });
  } catch (error) {
    console.error("Training registration checkout failed", error);
    return NextResponse.json({ error: "Unable to create training registration checkout." }, { status: 500 });
  }
}
