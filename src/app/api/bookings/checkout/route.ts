import { NextResponse } from "next/server";

const MASTER_BOOKING_STORE_ID = "37mJqg20MjOriggaIaOOuahDsgj1";
const BASE_URL =
  process.env.SEDIFEX_INTEGRATION_API_BASE_URL ??
  process.env.SEDIFEX_INTEGRATION_BASE_URL ??
  "https://us-central1-sedifex-web.cloudfunctions.net";
const TARGET_STORE_ID = process.env.SEDIFEX_BOOKING_TARGET_STORE_ID?.trim() || MASTER_BOOKING_STORE_ID;
const MASTER_SERVICE_ID = process.env.SEDIFEX_MASTER_BOOKING_SERVICE_ID?.trim() ?? "";
const CONTRACT_VERSION = process.env.SEDIFEX_CONTRACT_VERSION ?? "2026-04-13";
const API_KEY = process.env.SEDIFEX_INTEGRATION_API_KEY?.trim() ?? "";
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://www.glitteringmedspa.com").replace(/\/$/, "");

type Body = {
  serviceId?: string;
  serviceName?: string;
  servicePrice?: number | string | null;
  bookingDate?: string;
  bookingTime?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  branchLocationId?: string;
  branchLocationName?: string;
  preferredContactMethod?: string;
  notes?: string;
  noRefundPolicyAccepted?: boolean;
  attributes?: Record<string, unknown>;
  customer?: { name?: string; phone?: string; email?: string };
};

type JsonObject = Record<string, unknown>;

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readFirstString(...values: unknown[]) {
  for (const value of values) {
    const next = readString(value);
    if (next) return next;
  }
  return "";
}

function readNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const next = Number(value);
    if (Number.isFinite(next)) return next;
  }
  return null;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
}

function isValidTime(value: string) {
  const match = value.match(/^(\d{2}):(\d{2})$/);
  if (!match) return false;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

function isPastBooking(date: string, time: string) {
  const value = new Date(`${date}T${time}:00`).getTime();
  return Number.isNaN(value) || value < Date.now();
}

function headers() {
  if (!API_KEY) throw new Error("Configure SEDIFEX_INTEGRATION_API_KEY.");
  return {
    "x-api-key": API_KEY,
    "X-Sedifex-Contract-Version": CONTRACT_VERSION,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

async function parseResponse(response: Response, fallback: string) {
  const text = await response.text();
  let data: JsonObject = {};
  try {
    data = text ? (JSON.parse(text) as JsonObject) : {};
  } catch {
    if (!response.ok) throw new Error(text || fallback);
  }
  if (!response.ok) {
    const message = readFirstString(data.error, data.message, text, fallback);
    throw new Error(message || fallback);
  }
  return data;
}

function readNestedString(data: JsonObject, key: string) {
  const nested = data.data as JsonObject | undefined;
  return readFirstString(data[key], nested?.[key]);
}

function readBookingId(data: JsonObject) {
  const booking = data.booking as JsonObject | undefined;
  const nested = data.data as JsonObject | undefined;
  return readFirstString(data.bookingId, data.booking_id, data.id, booking?.bookingId, booking?.booking_id, booking?.id, nested?.bookingId, nested?.booking_id, nested?.id);
}

function readCheckoutUrl(data: JsonObject) {
  return readFirstString(
    data.checkoutUrl,
    data.checkout_url,
    data.authorizationUrl,
    data.authorization_url,
    readNestedString(data, "checkoutUrl"),
    readNestedString(data, "checkout_url"),
    readNestedString(data, "authorizationUrl"),
    readNestedString(data, "authorization_url"),
  );
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
  }

  const attributes = body.attributes ?? {};
  const selectedBranchServiceId = readFirstString(body.serviceId, attributes.selectedBranchServiceId, attributes.selected_branch_service_id);
  const selectedBranchStoreId = readFirstString(body.branchLocationId, attributes.selectedBranchStoreId, attributes.selected_branch_store_id);
  const branchLocationName = readFirstString(body.branchLocationName, attributes.branchLocationName, attributes.preferred_branch);
  const serviceName = readFirstString(body.serviceName, attributes.serviceName, attributes.service_name);
  const servicePrice = readNumber(body.servicePrice);
  const bookingDate = readFirstString(body.bookingDate, attributes.bookingDate, attributes.preferred_date);
  const bookingTime = readFirstString(body.bookingTime, attributes.bookingTime, attributes.preferred_time);
  const customerName = readFirstString(body.customer?.name, body.customerName, attributes.customerName);
  const customerPhone = readFirstString(body.customer?.phone, body.customerPhone, attributes.customerPhone);
  const customerEmail = readFirstString(body.customer?.email, body.customerEmail, attributes.customerEmail).toLowerCase();
  const preferredContactMethod = readFirstString(body.preferredContactMethod, attributes.preferred_contact_method) || "WhatsApp";
  const notes = readFirstString(body.notes, attributes.notes);
  const actualServiceId = MASTER_SERVICE_ID || selectedBranchServiceId;

  if (!selectedBranchStoreId || !branchLocationName) return NextResponse.json({ error: "Choose a valid Glittering branch." }, { status: 400 });
  if (!selectedBranchServiceId || !actualServiceId) return NextResponse.json({ error: "Please select a service." }, { status: 400 });
  if (!serviceName) return NextResponse.json({ error: "Service name is required." }, { status: 400 });
  if (!servicePrice || servicePrice <= 0) return NextResponse.json({ error: "Service price is required before payment can start." }, { status: 400 });
  if (!bookingDate || !isValidDate(bookingDate)) return NextResponse.json({ error: "Booking date must use YYYY-MM-DD format." }, { status: 400 });
  if (!bookingTime || !isValidTime(bookingTime)) return NextResponse.json({ error: "Booking time must use HH:mm format." }, { status: 400 });
  if (isPastBooking(bookingDate, bookingTime)) return NextResponse.json({ error: "Booking date/time must be in the future." }, { status: 400 });
  if (!customerName) return NextResponse.json({ error: "Customer name is required." }, { status: 400 });
  if (!customerPhone && !customerEmail) return NextResponse.json({ error: "Provide phone or email so we can contact you." }, { status: 400 });
  if (customerEmail && !isValidEmail(customerEmail)) return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  if (!body.noRefundPolicyAccepted) return NextResponse.json({ error: "Accept the no-refund policy before payment." }, { status: 400 });

  const syncRequestedAt = new Date().toISOString();
  const customer = { name: customerName, phone: customerPhone || undefined, email: customerEmail || undefined };
  const normalizedAttributes = {
    ...attributes,
    selectedBranchStoreId,
    selected_branch_store_id: selectedBranchStoreId,
    selectedBranchServiceId,
    selected_branch_service_id: selectedBranchServiceId,
    branchLocationId: selectedBranchStoreId,
    branchLocationName,
    preferred_branch: branchLocationName,
    serviceName,
    service_name: serviceName,
    bookingDate,
    bookingTime,
    preferred_date: bookingDate,
    preferred_time: bookingTime,
    customerName,
    customerPhone: customerPhone || undefined,
    customerEmail: customerEmail || undefined,
    preferred_contact_method: preferredContactMethod,
    notes: notes || undefined,
    paymentMethod: "sedifex_checkout",
    payment_method: "sedifex_checkout",
    paymentAmount: servicePrice,
    depositAmount: servicePrice,
    paymentCollectionMode: "online_checkout",
    paymentStatus: "checkout_created",
    bookingStatus: "booked",
    syncStatus: "pending",
    syncRequestedAt,
    approvalStatus: "approved",
    no_refund_policy_accepted: true,
    source: "website_booking_form",
    channel: "client-website",
    orderType: "service",
  };

  try {
    const bookingResponse = await fetch(`${BASE_URL.replace(/\/$/, "")}/v1IntegrationBookings?storeId=${encodeURIComponent(TARGET_STORE_ID)}`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        serviceId: actualServiceId,
        serviceName,
        customer,
        customerName,
        customerPhone: customerPhone || undefined,
        customerEmail: customerEmail || undefined,
        bookingDate,
        bookingTime,
        branchLocationId: selectedBranchStoreId,
        branchLocationName,
        paymentMethod: "sedifex_checkout",
        paymentAmount: servicePrice,
        depositAmount: servicePrice,
        quantity: 1,
        notes: notes || undefined,
        bookingStatus: "booked",
        paymentCollectionMode: "online_checkout",
        paymentStatus: "checkout_created",
        syncStatus: "pending",
        syncRequestedAt,
        approvalStatus: "approved",
        attributes: normalizedAttributes,
      }),
      cache: "no-store",
    });
    const booking = await parseResponse(bookingResponse, "Failed to create booking in Sedifex.");
    const bookingId = readBookingId(booking);
    const clientOrderId = bookingId ? `BOOKING-${bookingId}` : `BOOKING-${Date.now()}`;
    const returnUrl = process.env.SEDIFEX_CHECKOUT_RETURN_URL?.trim() || `${SITE_URL}/payment/return`;
    const params = new URLSearchParams({ reference: clientOrderId, course: `${serviceName} - ${branchLocationName}` });

    const checkoutResponse = await fetch(`${BASE_URL.replace(/\/$/, "")}/integration/checkout/create`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        storeId: TARGET_STORE_ID,
        store_id: TARGET_STORE_ID,
        merchantId: TARGET_STORE_ID,
        merchant_id: TARGET_STORE_ID,
        bookingId: bookingId || undefined,
        booking_id: bookingId || undefined,
        clientOrderId,
        client_order_id: clientOrderId,
        sourceChannel: "client_website",
        source_channel: "client_website",
        sourceLabel: "Client Website",
        source_label: "Client Website",
        orderType: "service",
        order_type: "service",
        currency: "GHS",
        amount: servicePrice,
        customer,
        returnUrl: `${returnUrl}?${params.toString()}`,
        cancelUrl: `${SITE_URL}/book`,
        metadata: {
          bookingId: bookingId || undefined,
          clientOrderId,
          branchLocationName,
          selectedBranchStoreId,
          selectedBranchServiceId,
          serviceId: actualServiceId,
          serviceName,
          bookingDate,
          bookingTime,
          source: "glittering_website_booking_form",
        },
        syncStatus: "pending",
        syncRequestedAt: new Date().toISOString(),
      }),
      cache: "no-store",
    });
    const checkout = await parseResponse(checkoutResponse, "Failed to create Sedifex checkout.");
    const checkoutUrl = readCheckoutUrl(checkout);

    if (!checkoutUrl) {
      console.error("Sedifex checkout missing URL", { TARGET_STORE_ID, branchLocationName, selectedBranchStoreId, selectedBranchServiceId, serviceName, servicePrice });
      return NextResponse.json({ error: "Payment link was not returned. Please contact support." }, { status: 502 });
    }

    return NextResponse.json({ ok: true, checkoutUrl, authorizationUrl: checkoutUrl, clientOrderId, bookingId: bookingId || undefined, booking, checkout });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create Sedifex checkout.";
    console.error("Glittering booking checkout failed", {
      targetStoreId: TARGET_STORE_ID,
      branchLocationName,
      selectedBranchStoreId,
      selectedBranchServiceId,
      serviceId: actualServiceId,
      serviceName,
      servicePrice,
      message,
    });
    return NextResponse.json({ error: "We could not open payment right now. Please contact support or try again shortly." }, { status: 502 });
  }
}
