import { NextResponse } from "next/server";

const DEFAULT_SEDIFEX_BASE_URL = "https://us-central1-sedifex-web.cloudfunctions.net";
const DEFAULT_STORE_ID = "37mJqg20MjOriggaIaOOuahDsgj1";

type CheckoutBody = {
  serviceId?: string;
  serviceName?: string;
  servicePrice?: number;
  customer?: { name?: string; email?: string; phone?: string };
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  bookingDate?: string;
  bookingTime?: string;
  branchLocationName?: string;
  selectedBranchStoreId?: string;
  selectedBranchServiceId?: string;
};

type SedifexResponse = {
  authorizationUrl?: string;
  authorization_url?: string;
  checkoutUrl?: string;
  checkout_url?: string;
  reference?: string;
  paymentReference?: string;
  payment_reference?: string;
  error?: string;
  message?: string;
  [key: string]: unknown;
};

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseJsonSafely<T>(value: string): T | null {
  try {
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

function getStoreId() {
  return process.env.SEDIFEX_BOOKING_TARGET_STORE_ID?.trim() || process.env.NEXT_PUBLIC_SEDIFEX_STORE_ID?.trim() || DEFAULT_STORE_ID;
}

function getCheckoutEndpoint() {
  const base = (process.env.SEDIFEX_INTEGRATION_API_BASE_URL || process.env.SEDIFEX_INTEGRATION_BASE_URL || DEFAULT_SEDIFEX_BASE_URL).replace(/\/$/, "");
  return process.env.SEDIFEX_INTEGRATION_CHECKOUT_CREATE_URL?.trim() || process.env.SEDIFEX_CHECKOUT_CREATE_URL?.trim() || `${base}/integrationCheckoutCreate`;
}

function getApiKey() {
  return process.env.SEDIFEX_CHECKOUT_API_KEY?.trim() || process.env.SEDIFEX_INTEGRATION_API_KEY?.trim() || process.env.SEDIFEX_BOOKING_API_KEY?.trim() || "";
}

function getCheckoutUrl(data: SedifexResponse) {
  return data.checkoutUrl || data.checkout_url || data.authorizationUrl || data.authorization_url || "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutBody;
    const storeId = getStoreId();
    const apiKey = getApiKey();
    const serviceId = readString(body.selectedBranchServiceId) || readString(body.serviceId);
    const serviceName = readString(body.serviceName);
    const servicePrice = Number(body.servicePrice ?? 0);
    const customerName = readString(body.customer?.name) || readString(body.customerName);
    const customerEmail = (readString(body.customer?.email) || readString(body.customerEmail)).toLowerCase();
    const customerPhone = readString(body.customer?.phone) || readString(body.customerPhone);
    const clientOrderId = `BOOKING-${Date.now()}`;

    if (!serviceId) return NextResponse.json({ error: "Service is required." }, { status: 400 });
    if (!customerEmail) return NextResponse.json({ error: "Email is required for online checkout." }, { status: 400 });
    if (!servicePrice || servicePrice <= 0) return NextResponse.json({ error: "Service price is required." }, { status: 400 });
    if (!apiKey) return NextResponse.json({ error: "Sedifex checkout key is not configured." }, { status: 500 });

    const returnBase = process.env.SEDIFEX_CHECKOUT_RETURN_URL || "https://www.glitteringmedspa.com/payment/return";
    const returnUrl = new URL(returnBase);
    returnUrl.searchParams.set("reference", clientOrderId);

    const payload = {
      storeId,
      store_id: storeId,
      merchantId: storeId,
      merchant_id: storeId,
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
      customer: { name: customerName, email: customerEmail, phone: customerPhone },
      items: [{ id: serviceId, item_id: serviceId, serviceId, name: serviceName, unitPrice: servicePrice, price: servicePrice, qty: 1, quantity: 1, type: "SERVICE", item_type: "service" }],
      metadata: { source: "website_booking_form", bookingDate: body.bookingDate, bookingTime: body.bookingTime, branchLocationName: body.branchLocationName, selectedBranchStoreId: body.selectedBranchStoreId },
      returnUrl: returnUrl.toString(),
      paymentCollectionMode: "online_checkout",
      paymentStatus: "checkout_created",
      syncStatus: "pending",
      syncRequestedAt: new Date().toISOString(),
    };

    const checkoutResponse = await fetch(getCheckoutEndpoint(), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Sedifex-Contract-Version": process.env.SEDIFEX_CONTRACT_VERSION || process.env.SEDIFEX_INTEGRATION_API_VERSION || "2026-04-13",
        Authorization: `Bearer ${apiKey}`,
        "x-api-key": apiKey,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const raw = await checkoutResponse.text();
    const parsed = parseJsonSafely<SedifexResponse>(raw) ?? {};
    if (!checkoutResponse.ok) {
      console.error("Glittering booking checkout failed", { storeId, serviceId, serviceName, servicePrice, status: checkoutResponse.status, message: parsed.error || parsed.message || raw });
      return NextResponse.json({ error: "We could not open payment right now. Please contact support or try again shortly." }, { status: 502 });
    }

    const checkoutUrl = getCheckoutUrl(parsed);
    if (!checkoutUrl) return NextResponse.json({ error: "Checkout was created but no payment URL was returned." }, { status: 502 });

    return NextResponse.json({ ok: true, checkoutUrl, authorizationUrl: checkoutUrl, clientOrderId, reference: parsed.reference || parsed.paymentReference || parsed.payment_reference || clientOrderId });
  } catch (error) {
    console.error("Glittering booking checkout failed", { message: error instanceof Error ? error.message : "Unable to create checkout." });
    return NextResponse.json({ error: "We could not open payment right now. Please contact support or try again shortly." }, { status: 502 });
  }
}
