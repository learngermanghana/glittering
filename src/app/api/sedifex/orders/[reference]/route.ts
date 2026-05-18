import { NextResponse } from "next/server";

export async function GET(_: Request, context: { params: Promise<{ reference: string }> }) {
  const { reference } = await context.params;
  const endpointBase = process.env.SEDIFEX_ORDER_STATUS_URL;

  if (!endpointBase) return NextResponse.json({ error: "Missing SEDIFEX_ORDER_STATUS_URL." }, { status: 500 });

  const endpoint = `${endpointBase.replace(/\/$/, "")}/${encodeURIComponent(reference)}`;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: { ...(process.env.SEDIFEX_INTEGRATION_API_KEY ? { Authorization: `Bearer ${process.env.SEDIFEX_INTEGRATION_API_KEY}` } : {}) },
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) return NextResponse.json({ error: data?.error ?? "Unable to load order status." }, { status: response.status });
  return NextResponse.json(data);
}
