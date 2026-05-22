import { NextResponse } from "next/server";

const SEDIFEX_BASE_URL = process.env.SEDIFEX_INTEGRATION_API_BASE_URL || "https://us-central1-sedifex-web.cloudfunctions.net";
const SEDIFEX_STORE_ID = process.env.SEDIFEX_BOOKING_TARGET_STORE_ID || process.env.NEXT_PUBLIC_SEDIFEX_STORE_ID || "37mJqg20MjOriggaIaOOuahDsgj1";
const CHECKOUT_CREATE_URL = process.env.SEDIFEX_INTEGRATION_CHECKOUT_CREATE_URL || `${SEDIFEX_BASE_URL.replace(/\/$/, "")}/integrationCheckoutCreate`;
const BOOKINGS_URL = process.env.SEDIFEX_INTEGRATION_BOOKINGS_URL || `${SEDIFEX_BASE_URL.replace(/\/$/, "")}/v1IntegrationBookings`;

type CheckoutService = {
  id?: string;
  serviceId?: string;
  item_id?: string;
  name?: string;
  serviceName?: string;
  price?: number | string | null;
  servicePrice?: number | string | null;
};

type CheckoutBody = {
  serviceId?: string;
  serviceName?: string;
  servicePrice?: number;
  services?: CheckoutService[];
  bookingDate?: string;
  bookingTime?: string;
  branchLocationId?: string;
  branchLocationName?: string;
  selectedBranchStoreId?: string;
  selectedBranchServiceId?: string;
  selectedBranchServiceIds?: string[];
  preferredContactMethod?: string;
  notes?: string;
  noRefundPolicyAccepted?: boolean;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
};

type AnyRecord = Record<string, unknown>;

function parseJsonSafely<T>(value: string): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function getSedifexKey() {
  return process.env.SEDIFEX_BOOKING_API_KEY || process.env.SEDIFEX_CHECKOUT_API_KEY || process.env.SEDIFEX_INTEGRATION_API_KEY || "";
}

function withStoreId(rawUrl: string, storeId: string) {
  const url = new URL(rawUrl);
  url.searchParams.set("storeId", storeId);
  return url.toString();
}

function readBookingId(data: AnyRecord | null) {
  const booking = (data?.booking ?? {}) as AnyRecord;
  const nestedData = (data?.data ?? {}) as AnyRecord;
  const candidates = [data?.bookingId, data?.booking_id, data?.id, booking.bookingId, booking.booking_id, booking.id, nestedData.bookingId, nestedData.booking_id, nestedData.id];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  }
  return "";
}

function readCheckoutUrl(data: AnyRecord | null) {
  const value = data?.checkoutUrl ?? data?.authorizationUrl ?? data?.checkout_url ?? data?.authorization_url;
  return typeof value === "string" ? value : "";
}

function normalizeServices(body: CheckoutBody) {
  const rawServices = Array.isArray(body.services) && body.services.length > 0
    ? body.services
    : [
        {
          id: body.selectedBranchServiceId || body.serviceId,
          serviceId: body.selectedBranchServiceId || body.serviceId,
          name: body.serviceName,
          serviceName: body.serviceName,
          price: body.servicePrice,
          servicePrice: body.servicePrice,
        },
      ];

  return rawServices
    .map((service) => {
      const id = readString(service.serviceId) || readString(service.id) || readString(service.item_id);
      const name = readString(service.serviceName) || readString(service.name) || "Service booking";
      const price = readNumber(service.servicePrice ?? service.price);
      return { id, name, price };
    })
    .filter((service) => service.id);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutBody;
    const selectedServices = normalizeServices(body);
    const actualServiceId = selectedServices[0]?.id ?? "";
    const serviceName = selectedServices.map((service) => service.name).join(" + ") || "Service booking";
    const servicePrice = selectedServices.reduce((total, service) => total + service.price, 0);
    const customerName = readString(body.customer?.name);
    const customerEmail = readString(body.customer?.email).toLowerCase();
    const customerPhone = readString(body.customer?.phone);
    const apiKey = getSedifexKey();
    const syncRequestedAt = new Date().toISOString();

    if (!actualServiceId || selectedServices.length === 0) return NextResponse.json({ error: "Select at least one service." }, { status: 400 });
    if (selectedServices.some((service) => !service.price || service.price <= 0)) return NextResponse.json({ error: "Every selected service must have a valid price." }, { status: 400 });
    if (!customerEmail) return NextResponse.json({ error: "Email is required for online checkout." }, { status: 400 });
    if (!servicePrice || servicePrice <= 0) return NextResponse.json({ error: "Service price is required." }, { status: 400 });
    if (!apiKey) return NextResponse.json({ error: "Sedifex integration key is missing." }, { status: 500 });

    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Sedifex-Contract-Version": process.env.SEDIFEX_CONTRACT_VERSION || "2026-04-13",
      Authorization: `Bearer ${apiKey}`,
      "x-api-key": apiKey,
    };

    const customer = { name: customerName, email: customerEmail, phone: customerPhone };
    const bookingPayload = {
      serviceId: actualServiceId,
      serviceName,
      services: selectedServices.map((service) => ({
        serviceId: service.id,
        id: service.id,
        name: service.name,
        serviceName: service.name,
        price: service.price,
        servicePrice: service.price,
        quantity: 1,
      })),
      customer,
      customerName,
      customerEmail,
      customerPhone,
      bookingDate: body.bookingDate,
      bookingTime: body.bookingTime,
      notes: body.notes || undefined,
      paymentMethod: "paystack",
      paymentAmount: servicePrice,
      depositAmount: servicePrice,
      quantity: 1,
      bookingStatus: "booked",
      paymentCollectionMode: "online_checkout",
      paymentStatus: "checkout_created",
      syncStatus: "pending",
      syncRequestedAt,
      attributes: {
        source: "website_booking_form",
        channel: "client-website",
        orderType: "service",
        selectedBranchStoreId: body.selectedBranchStoreId,
        selected_branch_store_id: body.selectedBranchStoreId,
        selectedBranchServiceId: actualServiceId,
        selected_branch_service_id: actualServiceId,
        selectedBranchServiceIds: selectedServices.map((service) => service.id),
        selected_branch_service_ids: selectedServices.map((service) => service.id),
        branchLocationId: body.branchLocationId,
        branchLocationName: body.branchLocationName,
        preferred_branch: body.branchLocationName,
        preferred_date: body.bookingDate,
        preferred_time: body.bookingTime,
        preferred_contact_method: body.preferredContactMethod,
        serviceName,
        service_name: serviceName,
        serviceCount: selectedServices.length,
        service_count: selectedServices.length,
        serviceNames: selectedServices.map((service) => service.name),
        service_names: selectedServices.map((service) => service.name),
        services: selectedServices,
        paymentMethod: "paystack",
        payment_method: "paystack",
        paymentAmount: servicePrice,
        depositAmount: servicePrice,
        bookingStatus: "booked",
        paymentCollectionMode: "online_checkout",
        paymentStatus: "checkout_created",
        syncStatus: "pending",
        syncRequestedAt,
        no_refund_policy_accepted: body.noRefundPolicyAccepted,
      },
    };

    const bookingResponse = await fetch(withStoreId(BOOKINGS_URL, SEDIFEX_STORE_ID), {
      method: "POST",
      headers,
      body: JSON.stringify(bookingPayload),
      cache: "no-store",
    });

    const bookingRawText = await bookingResponse.text();
    const bookingParsed = parseJsonSafely<AnyRecord>(bookingRawText);

    if (!bookingResponse.ok) {
      console.error("Sedifex booking creation failed", { status: bookingResponse.status, body: bookingRawText });
      return NextResponse.json({ error: "Unable to create booking before checkout." }, { status: 502 });
    }

    const bookingId = readBookingId(bookingParsed);
    const clientOrderId = bookingId ? `BOOKING-${bookingId}` : `BOOKING-${Date.now()}`;
    const checkoutPayload = {
      storeId: SEDIFEX_STORE_ID,
      store_id: SEDIFEX_STORE_ID,
      merchantId: SEDIFEX_STORE_ID,
      merchant_id: SEDIFEX_STORE_ID,
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
      items: selectedServices.map((service) => ({
        id: service.id,
        item_id: service.id,
        serviceId: service.id,
        name: service.name,
        serviceName: service.name,
        unitPrice: service.price,
        price: service.price,
        qty: 1,
        quantity: 1,
        type: "SERVICE",
        item_type: "service",
      })),
      metadata: {
        bookingId,
        clientOrderId,
        source: "glittering_website_booking_form",
        branchLocationName: body.branchLocationName,
        bookingDate: body.bookingDate,
        bookingTime: body.bookingTime,
        serviceCount: selectedServices.length,
        services: selectedServices,
      },
      returnUrl: process.env.SEDIFEX_CHECKOUT_RETURN_URL || "https://www.glitteringmedspa.com/payment/return",
      syncStatus: "pending",
      syncRequestedAt,
    };

    const checkoutResponse = await fetch(CHECKOUT_CREATE_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(checkoutPayload),
      cache: "no-store",
    });

    const checkoutRawText = await checkoutResponse.text();
    const checkoutParsed = parseJsonSafely<AnyRecord>(checkoutRawText);

    console.log("Sedifex booking response (raw):", bookingRawText);
    console.log("Sedifex checkout response (raw):", checkoutRawText);

    if (!checkoutResponse.ok) {
      return NextResponse.json({ error: "Unable to create Sedifex checkout.", bookingId, details: checkoutParsed ?? checkoutRawText }, { status: checkoutResponse.status });
    }

    const checkoutUrl = readCheckoutUrl(checkoutParsed);
    return NextResponse.json({ booking: bookingParsed, bookingId, checkout: checkoutParsed ?? checkoutRawText, checkoutUrl, authorizationUrl: checkoutUrl, clientOrderId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
