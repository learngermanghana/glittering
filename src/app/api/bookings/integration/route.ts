import { NextResponse } from "next/server";
import { getProducts } from "@/lib/crm";

const SEDIFEX_BASE_URL = process.env.SEDIFEX_INTEGRATION_BASE_URL ?? "https://us-central1-sedifex-web.cloudfunctions.net";
const SEDIFEX_STORE_ID = process.env.SEDIFEX_WEBSITE_STORE_ID ?? process.env.NEXT_PUBLIC_SEDIFEX_STORE_ID ?? "37mJqg20MjOriggaIaOOuahDsgj1";
const SEDIFEX_CONTRACT_VERSION = process.env.SEDIFEX_CONTRACT_VERSION ?? "2026-04-13";
const SEDIFEX_API_KEY = process.env.SEDIFEX_INTEGRATION_API_KEY;
const BOOKING_ALLOWED_SERVICES_BY_BRANCH = parseJsonSafely<Record<string, string[]>>(
  process.env.BOOKING_ALLOWED_SERVICES_BY_BRANCH ?? ""
);
const BOOKING_DEFAULT_SERVICE_ID = process.env.BOOKING_DEFAULT_SERVICE_ID ?? process.env.SEDIFEX_DEFAULT_SERVICE_ID ?? "";
const BLOCKED_SLOT_KEYS = new Set(
  (process.env.BOOKING_BLOCKED_SLOT_KEYS ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
);

type BookingAttributes = {
  preferred_branch?: string;
  session_type?: string;
  duration?: number;
  therapist_preference?: string;
  preferred_contact_method?: string;
  deposit_amount?: number;
  payment_method?: string;
  email?: string;
  customer_name?: string;
  customer_phone?: string;
  notes?: string;
  payment_screenshot_url?: string;
  payment_reference?: string;
  no_refund_policy_accepted?: boolean;
  preferred_date?: string;
  preferred_time?: string;
};

type BookingRequestBody = {
  serviceId?: string;
  serviceName?: string;
  slotId?: string;
  quantity?: number;
  notes?: string;
  attributes?: Record<string, unknown>;
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
  };
};

type ValidationResult = {
  error: string | null;
  normalized?: BookingRequestBody;
};

type AvailableService = {
  id: string;
  name: string;
  price?: number | null;
  storeId?: string;
};

type ServiceResolutionContext = {
  requestedServiceId?: string;
  requestedServiceName?: string;
  preferredBranch?: string;
};

function parseJsonSafely<T>(value: string): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function buildSedifexHeaders() {
  if (!SEDIFEX_API_KEY?.trim()) {
    throw new Error("Sedifex API key is missing. Configure SEDIFEX_INTEGRATION_API_KEY.");
  }

  return {
    "x-api-key": SEDIFEX_API_KEY.trim(),
    "X-Sedifex-Contract-Version": SEDIFEX_CONTRACT_VERSION,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readBoolean(value: unknown) {
  return typeof value === "boolean" ? value : null;
}

function readNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isPastBooking(date: string, time: string) {
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return true;

  const [hours, minutes] = time.split(":").map((part) => Number(part));
  if (!Number.isInteger(hours) || !Number.isInteger(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return true;
  }

  const bookingDateTime = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), hours, minutes));
  return bookingDateTime.getTime() < Date.now();
}

function buildSlotKey(serviceId: string, branch: string, date: string, time: string, therapistPreference: string) {
  return [branch, serviceId, date, time, therapistPreference || "any"].join("|").toLowerCase();
}

function normalizeServiceName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

async function loadAvailableServices() {
  const products = await getProducts();
  const serviceMap = new Map<string, AvailableService>();
  const normalizedStoreId = SEDIFEX_STORE_ID.trim();

  for (const product of products) {
    const id = readString(product.id);
    const name = readString(product.name);
    const itemType = readString(product.itemType).toLowerCase();
    const storeId = readString(product.storeId);
    if (!id || !name || itemType !== "service") continue;
    if (!storeId || storeId !== normalizedStoreId) continue;

    serviceMap.set(id, {
      id,
      name,
      price: readNumber(product.price),
      storeId,
    });
  }

  return Array.from(serviceMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

async function resolveServiceId(context: ServiceResolutionContext) {
  const requestedServiceId = context.requestedServiceId?.trim() ?? "";
  if (requestedServiceId) return requestedServiceId;

  const requestedServiceName = context.requestedServiceName?.trim() ?? "";
  const services = await loadAvailableServices();
  if (requestedServiceName) {
    const normalizedName = normalizeServiceName(requestedServiceName);
    const byName = services.find((service) => normalizeServiceName(service.name) === normalizedName);
    if (byName) return byName.id;
  }

  const defaultServiceId = BOOKING_DEFAULT_SERVICE_ID.trim();
  if (defaultServiceId) return defaultServiceId;

  const allowedByBranch = context.preferredBranch ? BOOKING_ALLOWED_SERVICES_BY_BRANCH?.[context.preferredBranch] : null;
  if (Array.isArray(allowedByBranch) && allowedByBranch.length > 0) {
    return allowedByBranch[0] ?? "";
  }

  return "";
}

async function validateAndNormalizePayload(payload: BookingRequestBody): Promise<ValidationResult> {
  const attributes = (payload.attributes ?? {}) as BookingAttributes;
  const preferredBranch = readString(attributes.preferred_branch);
  const rawServiceName =
    readString(payload.serviceName) || readString((payload.attributes as Record<string, unknown> | undefined)?.service_name);
  const serviceId = await resolveServiceId({
    requestedServiceId: payload.serviceId,
    requestedServiceName: rawServiceName,
    preferredBranch,
  });
  if (!serviceId) {
    return {
      error: "Service could not be resolved. Provide serviceId/serviceName or configure BOOKING_DEFAULT_SERVICE_ID.",
    };
  }

  const preferredDate = readString(attributes.preferred_date);
  const preferredTime = readString(attributes.preferred_time);
  const sessionType = readString(attributes.session_type);
  const therapistPreference = readString(attributes.therapist_preference);
  const preferredContactMethod = readString(attributes.preferred_contact_method);
  const paymentMethod = readString(attributes.payment_method);
  const paymentReference = readString(attributes.payment_reference);
  const notes = readString(attributes.notes);
  const email = readString(payload.customer?.email ?? attributes.email);
  const customerName = payload.customer?.name?.trim() ?? "";
  const customerPhone = payload.customer?.phone?.trim() ?? "";
  const duration = readNumber(attributes.duration);
  const depositAmount = readNumber(attributes.deposit_amount) ?? 0;
  const noRefundPolicyAccepted = readBoolean(attributes.no_refund_policy_accepted) ?? false;

  if (!preferredBranch) {
    return { error: "Preferred branch is required." };
  }

  if (!therapistPreference) {
    return { error: "Therapist preference is required." };
  }

  if (!preferredContactMethod) {
    return { error: "Preferred contact method is required." };
  }

  if (!preferredDate || !preferredTime) {
    return { error: "Preferred date and time are required." };
  }

  if (isPastBooking(preferredDate, preferredTime)) {
    return { error: "Booking date/time must be in the future." };
  }

  if (!noRefundPolicyAccepted) {
    return { error: "You must accept the no-refund policy before submitting." };
  }

  if (!customerName) {
    return { error: "Customer name is required." };
  }

  const hasContactMethod = Boolean(customerPhone || email);
  if (!hasContactMethod) {
    return { error: "Provide at least one contact method: phone or email." };
  }

  if (email && !isValidEmail(email)) {
    return { error: "Please provide a valid email address." };
  }

  if (depositAmount < 0) {
    return { error: "Deposit amount cannot be negative." };
  }

  if (depositAmount > 0 && !paymentMethod) {
    return { error: "Payment method is required when deposit amount is greater than 0." };
  }

  if (!paymentReference) {
    return { error: "Payment reference is required." };
  }

  if (BOOKING_ALLOWED_SERVICES_BY_BRANCH) {
    const allowed = BOOKING_ALLOWED_SERVICES_BY_BRANCH[preferredBranch];
    if (Array.isArray(allowed) && allowed.length > 0 && !allowed.includes(serviceId)) {
      return { error: `Service ${serviceId} is not available at ${preferredBranch}.` };
    }
  }

  const slotKey = buildSlotKey(serviceId, preferredBranch, preferredDate, preferredTime, therapistPreference);
  if (BLOCKED_SLOT_KEYS.has(slotKey)) {
    return { error: "The selected slot is no longer available. Please choose another time." };
  }

  const normalizedAttributes: BookingAttributes = {
    preferred_branch: preferredBranch,
    session_type: sessionType,
    duration: duration ?? undefined,
    therapist_preference: therapistPreference,
    preferred_contact_method: preferredContactMethod,
    deposit_amount: depositAmount,
    payment_method: paymentMethod || undefined,
    email: email || undefined,
    customer_name: customerName,
    customer_phone: customerPhone || undefined,
    notes: notes || undefined,
    payment_reference: paymentReference || undefined,
    no_refund_policy_accepted: true,
    preferred_date: preferredDate,
    preferred_time: preferredTime,
  };

  return {
    error: null,
    normalized: {
      ...payload,
      serviceId,
      quantity: payload.quantity && payload.quantity > 0 ? payload.quantity : 1,
      notes: payload.notes?.trim() || undefined,
      attributes: normalizedAttributes,
      customer: {
        name: customerName,
        phone: customerPhone || undefined,
        email: email || undefined,
      },
    },
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as BookingRequestBody;
  const { error, normalized } = await validateAndNormalizePayload(body);

  if (error || !normalized) {
    const services = await loadAvailableServices();
    return NextResponse.json({ error: error ?? "Invalid booking payload.", services }, { status: 400 });
  }

  try {
    const response = await fetch(`${SEDIFEX_BASE_URL}/v1IntegrationBookings?storeId=${encodeURIComponent(SEDIFEX_STORE_ID)}`, {
      method: "POST",
      headers: buildSedifexHeaders(),
      body: JSON.stringify(normalized),
      cache: "no-store",
    });

    const responseText = await response.text();
    const parsedResponse = parseJsonSafely<{ error?: string; message?: string }>(responseText);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: parsedResponse?.error ?? parsedResponse?.message ?? "Failed to create booking in Sedifex.",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      message: "Booking created in Sedifex.",
      booking: parsedResponse,
      forwardedPayload: normalized,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to connect to Sedifex.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    if (url.searchParams.get("view") === "services") {
      const services = await loadAvailableServices();
      return NextResponse.json({ services });
    }

    const response = await fetch(`${SEDIFEX_BASE_URL}/v1IntegrationBookings?storeId=${encodeURIComponent(SEDIFEX_STORE_ID)}`, {
      method: "GET",
      headers: buildSedifexHeaders(),
      cache: "no-store",
    });

    const responseText = await response.text();
    const parsedResponse = parseJsonSafely<{ error?: string; message?: string }>(responseText);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: parsedResponse?.error ?? parsedResponse?.message ?? "Failed to fetch Sedifex bookings.",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({ bookings: parsedResponse });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to fetch bookings from Sedifex.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
