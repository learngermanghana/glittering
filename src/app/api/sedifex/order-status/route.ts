import { NextResponse } from "next/server";

const DEFAULT_SEDIFEX_BASE_URL = "https://us-central1-sedifex-web.cloudfunctions.net";
const DEFAULT_STORE_ID = "37mJqg20MjOriggaIaOOuahDsgj1";

function getBaseUrl() {
  return (process.env.SEDIFEX_INTEGRATION_API_BASE_URL || process.env.SEDIFEX_API_BASE_URL || DEFAULT_SEDIFEX_BASE_URL).replace(/\/$/, "");
}

function getStoreId() {
  return process.env.SEDIFEX_BOOKING_TARGET_STORE_ID || process.env.NEXT_PUBLIC_SEDIFEX_STORE_ID || DEFAULT_STORE_ID;
}

function getApiKey() {
  return process.env.SEDIFEX_PARTNER_API_TOKEN || process.env.SEDIFEX_CHECKOUT_API_KEY || process.env.SEDIFEX_INTEGRATION_API_KEY || process.env.SEDIFEX_BOOKING_API_KEY || "";
}

function getOrderStatusUrl(reference: string) {
  const configuredUrl = process.env.SEDIFEX_INTEGRATION_ORDER_STATUS_URL || "";
  const url = new URL(configuredUrl || `${getBaseUrl()}/integrationOrderStatus`);
  url.searchParams.set("reference", reference);
  url.searchParams.set("storeId", getStoreId());
  return url.toString();
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const reference = (url.searchParams.get("reference") || "").trim();
  const apiKey = getApiKey();

  if (!reference) return NextResponse.json({ error: "missing-reference" }, { status: 400 });
  if (!apiKey) return NextResponse.json({ error: "missing-sedifex-api-key", reference }, { status: 500 });

  try {
    const response = await fetch(getOrderStatusUrl(reference), {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-Sedifex-Contract-Version": process.env.SEDIFEX_CONTRACT_VERSION || process.env.SEDIFEX_INTEGRATION_API_VERSION || "2026-04-13",
        Authorization: `Bearer ${apiKey}`,
        "x-api-key": apiKey,
      },
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return NextResponse.json(data || { error: "order-status-failed", reference }, { status: response.status });
    }

    return NextResponse.json(data || { reference, status: "pending" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "order-status-failed", reference }, { status: 500 });
  }
}
