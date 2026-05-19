import { NextResponse } from "next/server";

const SEDIFEX_BASE_URL = process.env.SEDIFEX_BASE_URL || "https://api.sedifex.com";
const SEDIFEX_STORE_ID = "37mJqg20MjOriggaIaOOuahDsgj1";

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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutBody;

    const actualServiceId = body.serviceId?.trim() ?? "";
    const serviceName = body.serviceName?.trim() ?? "";
    const servicePrice = Number(body.servicePrice ?? 0);
    const email = body.customer?.email?.trim() ?? "";

    if (!actualServiceId) {
      return NextResponse.json({ error: "Service is required." }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required for online checkout." }, { status: 400 });
    }

    const payload = {
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
          qty: 1,
          type: "SERVICE",
          item_type: "service",
        },
      ],
    };

    const checkoutResponse = await fetch(
      `${SEDIFEX_BASE_URL}/integration/checkout/create?storeId=${encodeURIComponent(SEDIFEX_STORE_ID)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      }
    );

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

    return NextResponse.json({ checkout: checkoutParsed ?? checkoutRawText });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
