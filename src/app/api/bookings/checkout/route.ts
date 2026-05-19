import { NextResponse } from "next/server";

const SEDIFEX_BASE_URL = process.env.SEDIFEX_INTEGRATION_BASE_URL ?? "https://us-central1-sedifex-web.cloudfunctions.net";
const MAIN_STORE_ID = "37mJqg20MjOriggaIaOOuahDsgj1";
const SEDIFEX_CONTRACT_VERSION = process.env.SEDIFEX_CONTRACT_VERSION ?? "2026-04-13";
const SEDIFEX_API_KEY = process.env.SEDIFEX_INTEGRATION_API_KEY;

type CheckoutBody = {
  booking?: Record<string, unknown>;
  serviceId?: string;
  serviceName?: string;
  servicePrice?: number;
  customer?: { name?: string; email?: string; phone?: string };
};

function headers() {
  return {
    "Content-Type": "application/json",
    "X-Sedifex-Contract-Version": SEDIFEX_CONTRACT_VERSION,
    ...(SEDIFEX_API_KEY ? { Authorization: `Bearer ${SEDIFEX_API_KEY}` } : {}),
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutBody;
    const actualServiceId = (body.serviceId ?? "").trim();
    const serviceName = (body.serviceName ?? "").trim();
    const servicePrice = Number.isFinite(body.servicePrice) ? Number(body.servicePrice) : 0;

    if (!actualServiceId) {
      return NextResponse.json({ error: "serviceId is required." }, { status: 400 });
    }

    const bookingPayload = body.booking ?? {};
    const bookingResponse = await fetch(
      `${SEDIFEX_BASE_URL}/v1IntegrationBookings?storeId=${encodeURIComponent(MAIN_STORE_ID)}`,
      {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(bookingPayload),
        cache: "no-store",
      }
    );
    const bookingRaw = await bookingResponse.text();
    console.log("Sedifex booking raw response:", bookingRaw);

    if (!bookingResponse.ok) {
      return NextResponse.json({ error: "Booking create failed.", bookingRaw }, { status: bookingResponse.status });
    }

    const checkoutPayload = {
      storeId: MAIN_STORE_ID,
      items: [
        {
          id: actualServiceId,
          item_id: actualServiceId,
          serviceId: actualServiceId,
          name: serviceName,
          serviceName,
          unitPrice: servicePrice,
          qty: 1,
          type: "SERVICE",
          item_type: "service",
        },
      ],
      customer: {
        name: body.customer?.name?.trim() ?? "",
        email: body.customer?.email?.trim() ?? "",
        phone: body.customer?.phone?.trim() ?? "",
      },
    };

    const checkoutResponse = await fetch(
      `${SEDIFEX_BASE_URL}/integration/checkout/create?storeId=${encodeURIComponent(MAIN_STORE_ID)}`,
      {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(checkoutPayload),
        cache: "no-store",
      }
    );
    const checkoutRaw = await checkoutResponse.text();
    console.log("Sedifex checkout raw response:", checkoutRaw);

    if (!checkoutResponse.ok) {
      return NextResponse.json({ error: "Checkout create failed.", checkoutRaw }, { status: checkoutResponse.status });
    }

    return NextResponse.json({
      message: "Booking and checkout created.",
      bookingRaw,
      checkoutRaw,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Checkout failed." }, { status: 500 });
  }
}
