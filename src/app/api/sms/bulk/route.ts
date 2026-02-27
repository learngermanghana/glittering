import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSessionCookieName, verifyFirebaseIdToken } from "@/lib/auth";

type Payload = {
  recipients?: string[];
  message?: string;
};

type HubtelResponse = {
  Message?: string;
  message?: string;
  Description?: string;
  description?: string;
};

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(getSessionCookieName())?.value;

  if (!sessionToken) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    await verifyFirebaseIdToken(sessionToken);
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as Payload;
  const recipients = body.recipients ?? [];
  const message = body.message?.trim();

  if (!message || recipients.length === 0) {
    return NextResponse.json({ error: "Message and at least one recipient are required." }, { status: 400 });
  }

  const clientId = process.env.HUBTEL_CLIENT_ID;
  const clientSecret = process.env.HUBTEL_CLIENT_SECRET;
  const senderId = process.env.HUBTEL_SENDER_ID;

  if (!clientId || !clientSecret || !senderId) {
    return NextResponse.json(
      {
        error: "Missing Hubtel credentials. Add HUBTEL_CLIENT_ID, HUBTEL_CLIENT_SECRET, HUBTEL_SENDER_ID.",
      },
      { status: 500 }
    );
  }

  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const results = await Promise.all(
    recipients.map(async (to) => {
      try {
        const response = await fetch("https://sms.hubtel.com/v1/messages/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${authHeader}`,
          },
          body: JSON.stringify({
            From: senderId,
            To: to,
            Content: message,
          }),
        });

        let parsed: HubtelResponse | null = null;
        try {
          parsed = (await response.json()) as HubtelResponse;
        } catch {
          parsed = null;
        }

        const reason =
          parsed?.Message ?? parsed?.message ?? parsed?.Description ?? parsed?.description ?? response.statusText;

        return {
          to,
          ok: response.ok,
          reason,
        };
      } catch (error) {
        return {
          to,
          ok: false,
          reason: error instanceof Error ? error.message : "Network request failed",
        };
      }
    })
  );

  const sent = results.filter((item) => item.ok).length;
  const failed = results.length - sent;
  const failureSummary = results
    .filter((item) => !item.ok)
    .map((item) => `${item.to} (${item.reason ?? "Unknown error"})`)
    .join(", ");

  return NextResponse.json({
    message:
      failed > 0
        ? `Campaign complete. Sent: ${sent}, Failed: ${failed}. Failures: ${failureSummary}`
        : `Campaign complete. Sent: ${sent}, Failed: ${failed}`,
    results,
  });
}
