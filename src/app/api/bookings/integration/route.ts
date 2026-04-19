import { NextResponse } from "next/server";
import { getProducts } from "@/lib/crm";

const SEDIFEX_BASE_URL = process.env.SEDIFEX_INTEGRATION_BASE_URL ?? "https://us-central1-sedifex-web.cloudfunctions.net";
const SEDIFEX_STORE_ID = process.env.SEDIFEX_WEBSITE_STORE_ID ?? process.env.NEXT_PUBLIC_SEDIFEX_STORE_ID ?? "37mJqg20MjOriggaIaOOuahDsgj1";
const SEDIFEX_BOOKING_TARGET_STORE_ID = process.env.SEDIFEX_BOOKING_TARGET_STORE_ID ?? "37mJqg20MjOriggaIaOOuahDsgj1";
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
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  serviceName?: string;
  bookingDate?: string;
  bookingTime?: string;
  branchLocationId?: string;
  branchLocationName?: string;
  eventLocation?: string;
  customerStayLocation?: string;
  paymentMethod?: string;
  paymentAmount?: number | string;
  depositAmount?: number | string;
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
  slotID?: string;
  slot_id?: string;
  quantity?: number;
  notes?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  bookingDate?: string;
  bookingTime?: string;
  branchLocationId?: string;
  branchLocationName?: string;
  eventLocation?: string;
  customerStayLocation?: string;
  paymentMethod?: string;
  paymentAmount?: number | string;
  depositAmount?: number | string;
  paymentReference?: string;
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
  storeId?: string;
};

const BOOKING_BRANCHES = [
  { name: "Glittering Med Spa Main", storeId: "37mJqg20MjOriggaIaOOuahDsgj1" },
  { name: "Glittering Spa Annex", storeId: "2EeDEIDS1FO814KVfaaUVdv66bM2" },
  { name: "Glittering Spa Spintex", storeId: "kT9QTWUkACMby6OwI2RO1bxG0WL2" },
] as const;

const BRANCH_BY_NAME = new Map(BOOKING_BRANCHES.map((branch) => [branch.name.toLowerCase(), branch]));
const BRANCH_BY_STORE_ID = new Map(BOOKING_BRANCHES.map((branch) => [branch.storeId, branch]));

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

function padTwo(value: number) {
  return String(value).padStart(2, "0");
}

function toIsoDate(year: number, month: number, day: number) {
  return `${year}-${padTwo(month)}-${padTwo(day)}`;
}

function normalizeBookingDateInput(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return "";

  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    return toIsoDate(Number(isoMatch[1]), Number(isoMatch[2]), Number(isoMatch[3]));
  }

  const slashYearFirstMatch = trimmed.match(/^(\d{4})[/.](\d{1,2})[/.](\d{1,2})$/);
  if (slashYearFirstMatch) {
    return toIsoDate(Number(slashYearFirstMatch[1]), Number(slashYearFirstMatch[2]), Number(slashYearFirstMatch[3]));
  }

  const contiguousMatch = trimmed.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (contiguousMatch) {
    return toIsoDate(Number(contiguousMatch[1]), Number(contiguousMatch[2]), Number(contiguousMatch[3]));
  }

  return "";
}

function isValidBookingDateFormat(date: string) {
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;

  const candidate = new Date(Date.UTC(year, month - 1, day));
  return (
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day
  );
}

function normalizeBookingTimeInput(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return "";

  const twentyFourHourMatch = trimmed.match(/^(\d{1,2}):(\d{1,2})$/);
  if (twentyFourHourMatch) {
    const hours = Number(twentyFourHourMatch[1]);
    const minutes = Number(twentyFourHourMatch[2]);
    if (Number.isInteger(hours) && Number.isInteger(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return `${padTwo(hours)}:${padTwo(minutes)}`;
    }
  }

  const meridiemMatch = trimmed.match(/^(\d{1,2})(?::(\d{1,2}))?\s*(am|pm)$/i);
  if (meridiemMatch) {
    const rawHours = Number(meridiemMatch[1]);
    const rawMinutes = meridiemMatch[2] ? Number(meridiemMatch[2]) : 0;
    if (Number.isInteger(rawHours) && Number.isInteger(rawMinutes) && rawHours >= 1 && rawHours <= 12 && rawMinutes >= 0 && rawMinutes <= 59) {
      const suffix = meridiemMatch[3].toLowerCase();
      const normalizedHours = suffix === "am" ? rawHours % 12 : (rawHours % 12) + 12;
      return `${padTwo(normalizedHours)}:${padTwo(rawMinutes)}`;
    }
  }

  const compactMatch = trimmed.match(/^(\d{2})(\d{2})$/);
  if (compactMatch) {
    const hours = Number(compactMatch[1]);
    const minutes = Number(compactMatch[2]);
    if (Number.isInteger(hours) && Number.isInteger(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return `${padTwo(hours)}:${padTwo(minutes)}`;
    }
  }

  return "";
}

function isValidBookingTimeFormat(time: string) {
  const match = time.match(/^(\d{2}):(\d{2})$/);
  if (!match) return false;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return Number.isInteger(hours) && Number.isInteger(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

function isPastBooking(date: string, time: string) {
  const dateMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const timeMatch = time.match(/^(\d{2}):(\d{2})$/);
  if (!dateMatch || !timeMatch) return true;

  const bookingDateTime = new Date(
    Date.UTC(
      Number(dateMatch[1]),
      Number(dateMatch[2]) - 1,
      Number(dateMatch[3]),
      Number(timeMatch[1]),
      Number(timeMatch[2]),
    ),
  );
  return bookingDateTime.getTime() < Date.now();
}

function buildSlotKey(serviceId: string, branch: string, date: string, time: string, therapistPreference: string) {
  return [branch, serviceId, date, time, therapistPreference || "any"].join("|").toLowerCase();
}

function normalizeServiceName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function readStringFrom(...values: unknown[]) {
  for (const value of values) {
    const next = readString(value);
    if (next) return next;
  }
  return "";
}

function resolveBranchStoreContext(input: { branchLocationName?: string; branchLocationId?: string }) {
  const branchByStoreId = input.branchLocationId ? BRANCH_BY_STORE_ID.get(input.branchLocationId.trim()) : null;
  if (branchByStoreId) return branchByStoreId;

  const normalizedBranchName = input.branchLocationName?.trim().toLowerCase() ?? "";
  if (normalizedBranchName) {
    const branchByName = BRANCH_BY_NAME.get(normalizedBranchName);
    if (branchByName) return branchByName;
  }

  return null;
}

async function loadAvailableServices(storeId = SEDIFEX_STORE_ID) {
  const products = await getProducts();
  const serviceMap = new Map<string, AvailableService>();
  const normalizedStoreId = storeId.trim();

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
  const services = await loadAvailableServices(context.storeId);
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
  const slotId = readStringFrom(payload.slotId, payload.slotID, payload.slot_id);
  const customerName = readStringFrom(payload.customer?.name, payload.customerName, attributes.customerName, attributes.customer_name);
  const customerPhone = readStringFrom(payload.customer?.phone, payload.customerPhone, attributes.customerPhone, attributes.customer_phone);
  const email = readStringFrom(payload.customer?.email, payload.customerEmail, attributes.customerEmail, attributes.email);
  const bookingDate = readStringFrom(payload.bookingDate, attributes.bookingDate, attributes.preferred_date);
  const bookingTime = readStringFrom(payload.bookingTime, attributes.bookingTime, attributes.preferred_time);
  const branchLocationId = readStringFrom(payload.branchLocationId, attributes.branchLocationId);
  const branchLocationName = readStringFrom(payload.branchLocationName, attributes.branchLocationName, attributes.preferred_branch);
  const eventLocation = readStringFrom(payload.eventLocation, attributes.eventLocation);
  const customerStayLocation = readStringFrom(payload.customerStayLocation, attributes.customerStayLocation);
  const paymentMethod = readStringFrom(payload.paymentMethod, attributes.paymentMethod, attributes.payment_method);
  const paymentReference = readStringFrom(payload.paymentReference, attributes.payment_reference);
  const preferredContactMethod = readString(attributes.preferred_contact_method);
  const sessionType = readString(attributes.session_type);
  const therapistPreference = readString(attributes.therapist_preference);
  const rawServiceName = readStringFrom(payload.serviceName, attributes.serviceName, (payload.attributes as Record<string, unknown> | undefined)?.service_name);
  const depositAmount =
    readNumber(payload.depositAmount) ??
    readNumber(payload.paymentAmount) ??
    readNumber(attributes.depositAmount) ??
    readNumber(attributes.deposit_amount) ??
    readNumber(attributes.paymentAmount) ??
    0;
  const duration = readNumber(attributes.duration);
  const noRefundPolicyAccepted = readBoolean(attributes.no_refund_policy_accepted) ?? false;
  const notes = readStringFrom(payload.notes, attributes.notes);
  const preferredBranch = branchLocationName;
  const branchContext = resolveBranchStoreContext({ branchLocationName, branchLocationId });
  const resolvedStoreId = branchContext?.storeId ?? SEDIFEX_STORE_ID;
  const resolvedBranchName = branchContext?.name ?? branchLocationName;

  const serviceId = await resolveServiceId({
    requestedServiceId: payload.serviceId,
    requestedServiceName: rawServiceName,
    preferredBranch,
    storeId: resolvedStoreId,
  });
  if (!serviceId) {
    return {
      error: "Service could not be resolved. Configure BOOKING_DEFAULT_SERVICE_ID or provide serviceId.",
    };
  }

  if (!bookingDate || !bookingTime) {
    return { error: "Booking date and time are required." };
  }

  const normalizedBookingDate = normalizeBookingDateInput(bookingDate);
  const normalizedBookingTime = normalizeBookingTimeInput(bookingTime);

  if (!normalizedBookingDate || !isValidBookingDateFormat(normalizedBookingDate)) {
    return { error: "Booking date must use YYYY-MM-DD format (example: 2026-04-29)." };
  }

  if (!normalizedBookingTime || !isValidBookingTimeFormat(normalizedBookingTime)) {
    return { error: "Booking time must use 24-hour HH:mm format (example: 19:00)." };
  }

  if (isPastBooking(normalizedBookingDate, normalizedBookingTime)) {
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

  if (preferredBranch && BOOKING_ALLOWED_SERVICES_BY_BRANCH) {
    const allowed = BOOKING_ALLOWED_SERVICES_BY_BRANCH[preferredBranch];
    if (Array.isArray(allowed) && allowed.length > 0 && !allowed.includes(serviceId)) {
      return { error: `Service ${serviceId} is not available at ${preferredBranch}.` };
    }
  }

  const slotKey = preferredBranch
    ? buildSlotKey(serviceId, preferredBranch, normalizedBookingDate, normalizedBookingTime, therapistPreference)
    : "";
  if (slotKey && BLOCKED_SLOT_KEYS.has(slotKey)) {
    return { error: "The selected slot is no longer available. Please choose another time." };
  }

  const normalizedAttributes: Record<string, unknown> = {
    customerName,
    customerPhone: customerPhone || undefined,
    customerEmail: email || undefined,
    serviceName: rawServiceName || undefined,
    bookingDate: normalizedBookingDate,
    bookingTime: normalizedBookingTime,
    branchLocationId: branchContext?.storeId ?? branchLocationId ?? undefined,
    branchLocationName: resolvedBranchName || undefined,
    eventLocation: eventLocation || undefined,
    customerStayLocation: customerStayLocation || undefined,
    paymentMethod: paymentMethod || undefined,
    depositAmount,
    paymentAmount: depositAmount,
    preferred_branch: preferredBranch,
    session_type: sessionType,
    duration: duration ?? undefined,
    therapist_preference: therapistPreference,
    preferred_contact_method: preferredContactMethod || undefined,
    deposit_amount: depositAmount,
    payment_method: paymentMethod || undefined,
    email: email || undefined,
    customer_name: customerName,
    customer_phone: customerPhone || undefined,
    notes: notes || undefined,
    payment_reference: paymentReference || undefined,
    no_refund_policy_accepted: true,
    preferred_date: normalizedBookingDate,
    preferred_time: normalizedBookingTime,
  };

  return {
    error: null,
    normalized: {
      ...payload,
      slotId: slotId || undefined,
      serviceId,
      quantity: payload.quantity && payload.quantity > 0 ? payload.quantity : 1,
      serviceName: rawServiceName || undefined,
      customerName,
      customerPhone: customerPhone || undefined,
      customerEmail: email || undefined,
      bookingDate: normalizedBookingDate,
      bookingTime: normalizedBookingTime,
      branchLocationId: branchContext?.storeId ?? branchLocationId ?? undefined,
      branchLocationName: resolvedBranchName || undefined,
      eventLocation: eventLocation || undefined,
      customerStayLocation: customerStayLocation || undefined,
      paymentMethod: paymentMethod || undefined,
      depositAmount,
      paymentAmount: depositAmount,
      notes: notes || undefined,
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
    const response = await fetch(
      `${SEDIFEX_BASE_URL}/v1IntegrationBookings?storeId=${encodeURIComponent(SEDIFEX_BOOKING_TARGET_STORE_ID)}`,
      {
      method: "POST",
      headers: buildSedifexHeaders(),
      body: JSON.stringify(normalized),
      cache: "no-store",
      }
    );

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
      const requestedStoreId = url.searchParams.get("storeId")?.trim() ?? "";
      const requestedBranchName = url.searchParams.get("branch")?.trim() ?? "";
      const branchContext = resolveBranchStoreContext({
        branchLocationName: requestedBranchName,
        branchLocationId: requestedStoreId,
      });
      const activeStoreId = branchContext?.storeId ?? requestedStoreId ?? SEDIFEX_STORE_ID;
      const services = await loadAvailableServices(activeStoreId);
      return NextResponse.json({
        services,
        storeId: activeStoreId,
        branches: BOOKING_BRANCHES,
      });
    }

    const status = url.searchParams.get("status")?.trim() ?? "";
    const serviceId = url.searchParams.get("serviceId")?.trim() ?? "";
    const params = new URLSearchParams({ storeId: SEDIFEX_STORE_ID });
    if (status) params.set("status", status);
    if (serviceId) params.set("serviceId", serviceId);

    const response = await fetch(`${SEDIFEX_BASE_URL}/v1IntegrationBookings?${params.toString()}`, {
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
