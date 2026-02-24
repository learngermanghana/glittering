import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSessionCookieName, verifyFirebaseIdToken } from "@/lib/auth";
import { appendBookingToGoogleSheet } from "@/lib/googleSheets";

type Payload = {
  name?: string;
  email?: string;
  branch?: string;
  date?: string;
  time?: string;
  confirmationSent?: string;
  confirmationSentAt?: string;
  reminderSent3d?: string;
  reminderSentAt3d?: string;
  emailNormalized?: string;
  emailIssue?: string;
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

  if (!body.name?.trim() || !body.email?.trim() || !body.branch?.trim() || !body.date?.trim() || !body.time?.trim()) {
    return NextResponse.json(
      { error: "Name, Email, Branch, Date, and Time are required." },
      { status: 400 }
    );
  }

  try {
    await appendBookingToGoogleSheet({
      name: body.name.trim(),
      email: body.email.trim(),
      branch: body.branch.trim(),
      date: body.date.trim(),
      time: body.time.trim(),
      confirmationSent: body.confirmationSent?.trim() ?? "",
      confirmationSentAt: body.confirmationSentAt?.trim() ?? "",
      reminderSent3d: body.reminderSent3d?.trim() ?? "",
      reminderSentAt3d: body.reminderSentAt3d?.trim() ?? "",
      emailNormalized: body.emailNormalized?.trim() ?? "",
      emailIssue: body.emailIssue?.trim() ?? "",
    });

    return NextResponse.json({ message: "Booking synced to Google Sheet." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to sync booking.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
