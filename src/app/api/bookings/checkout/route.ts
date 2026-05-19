import { NextResponse } from "next/server";

const SEDIFEX_BASE_URL = process.env.SEDIFEX_INTEGRATION_API_BASE_URL || "https://us-central1-sedifex-web.cloudfunctions.net";
const SEDIFEX_STORE_ID = process.env.SEDIFEX_BOOKING_TARGET_STORE_ID || process.env.NEXT_PUBLIC_SEDIFEX_STORE_ID || "37mJqg20MjOriggaIaOOuahDsgj1";
const CHECKOUT_CREATE_URL = process.env.SEDIFEX_INTEGRATION_CHECKOUT_CREATE_URL || `${SEDIFEX_BASE_URL.replace(/\/$/, "")}/integrationCheckoutCreate`;

type CheckoutBody = {
  serviceId?: string;
  serviceName?: string;
  servicePrice?: number;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
};

function parseJsonSafely<T>(value: string): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function getSedifexKey() {
  return process.env.SEDIFEX_CHECKOUT_API_KEY || process.env.SEDIFEX_INTEGRATION_API_KEY || process.env.SEDIFEX_BOOKING_API_KEY || "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutBody;
    const actualServiceId = body.serviceId?.trim() ?? "";
    const serviceName = body.serviceName?.trim() ?? "";
    const servicePrice = Number(body.servicePrice ?? 0);
    const email = body.customer?.email?.trim() ?? "";
    const apiKey = getSedifexKey();

    if (!actualServiceId) return NextResponse.json({ error: "Service is required." }, { status: 400 });
    if (!email) return NextResponse.json({ error: "Email is required for online checkout." }, { status: 400 });
    if (!apiKey) return NextResponse.json({ error: "Sedifex integration key is missing." }, { status: 500 });

    const clientOrderId = `BOOKING-${Date.now()}`;
    const payload = {
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
      amount: Number.isFinite(servicePrice) ? servicePrice : 0,
      customer: {
        name: body.customer?.name?.trim() ?? "",
        email,
        phone: body.customer?.phone?.trim() ?? "",
      },
      items: [
        {
          id: actualServiceId,
          item_id: actualServiceId,
          serviceId: actualServiceId,
          name: serviceName,
          serviceName,
          unitPrice: Number.isFinite(servicePrice) ? servicePrice : 0,
          price: Number.isFinite(servicePrice) ? servicePrice : 0,
          qty: 1,
          quantity: 1,
          type: "SERVICE",
          item_type: "service",
        },
      ],
      returnUrl: process.env.SEDIFEX_CHECKOUT_RETURN_URL || "https://www.glitteringmedspa.com/payment/return",
      syncStatus: "pending",
      syncRequestedAt: new Date().toISOString(),
    };

    const checkoutResponse = await fetch(CHECKOUT_CREATE_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Sedifex-Contract-Version": process.env.SEDIFEX_CONTRACT_VERSION || "2026-04-13",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const checkoutRawText = await checkoutResponse.text();
    const checkoutParsed = parseJsonSafely<Record<string, unknown>>(checkoutRawText);

    console.log("Sedifex booking response (raw):", JSON.stringify(body));
    console.log("Sedifex checkout response (raw):", checkoutRawText);

    if (!checkoutResponse.ok) {
      return NextResponse.json(
        { error: "Unable to create Sedifex checkout.", details: checkoutParsed ?? checkoutRawText },
        { status: checkoutResponse.status }
      );
    }

    const checkoutUrl = String(checkoutParsed?.checkoutUrl ?? checkoutParsed?.authorizationUrl ?? checkoutParsed?.checkout_url ?? checkoutParsed?.authorization_url ?? "");
    return NextResponse.json({ checkout: checkoutParsed ?? checkoutRawText, checkoutUrl, authorizationUrl: checkoutUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
