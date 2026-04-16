import { NextResponse } from "next/server";

const SEDIFEX_BASE_URL = process.env.SEDIFEX_INTEGRATION_BASE_URL ?? "https://us-central1-sedifex-web.cloudfunctions.net";
const SEDIFEX_STORE_ID = process.env.SEDIFEX_WEBSITE_STORE_ID ?? process.env.NEXT_PUBLIC_SEDIFEX_STORE_ID ?? "37mJqg20MjOriggaIaOOuahDsgj1";
const SEDIFEX_CONTRACT_VERSION = process.env.SEDIFEX_CONTRACT_VERSION ?? "2026-04-13";
const SEDIFEX_API_KEY = process.env.SEDIFEX_INTEGRATION_API_KEY;

type BookingRequestBody = {
  serviceId?: string;
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

function validateBookingPayload(payload: BookingRequestBody) {
  if (!payload.serviceId?.trim()) {
    return "Service ID is required.";
  }

  const hasCustomerIdentity = Boolean(
    payload.customer?.name?.trim() || payload.customer?.phone?.trim() || payload.customer?.email?.trim()
  );

  if (!hasCustomerIdentity) {
    return "At least one customer identifier is required: name, phone, or email.";
  }

  return null;
}

export async function POST(request: Request) {
  const body = (await request.json()) as BookingRequestBody;
  const validationMessage = validateBookingPayload(body);

  if (validationMessage) {
    return NextResponse.json({ error: validationMessage }, { status: 400 });
  }

  try {
    const response = await fetch(`${SEDIFEX_BASE_URL}/v1IntegrationBookings?storeId=${encodeURIComponent(SEDIFEX_STORE_ID)}`, {
      method: "POST",
      headers: buildSedifexHeaders(),
      body: JSON.stringify(body),
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
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to connect to Sedifex.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
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
