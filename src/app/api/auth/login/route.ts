import { NextResponse } from "next/server";
import { getSessionCookieName, verifyFirebaseIdToken } from "@/lib/auth";

// Prefer server-scoped key; allow public-key fallback only outside production.
const firebaseApiKey =
  process.env.FIREBASE_SERVER_API_KEY ??
  (process.env.NODE_ENV === "production" ? undefined : process.env.NEXT_PUBLIC_FIREBASE_API_KEY);

export async function POST(request: Request) {
  if (!firebaseApiKey) {
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "production"
            ? "Missing FIREBASE_SERVER_API_KEY."
            : "Missing FIREBASE_SERVER_API_KEY (or fallback NEXT_PUBLIC_FIREBASE_API_KEY).",
      },
      { status: 500 }
    );
  }

  const { email, password } = (await request.json()) as { email?: string; password?: string };

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const loginResponse = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );

  const loginPayload = await loginResponse.json();

  if (!loginResponse.ok || !loginPayload.idToken) {
    const message = loginPayload?.error?.message ?? "Login failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }

  try {
    await verifyFirebaseIdToken(String(loginPayload.idToken));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized Sedifex account";
    return NextResponse.json({ error: message }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true });

  const expiresIn = Number(loginPayload.expiresIn ?? 3600);
  const maxAge = Math.max(60, expiresIn - 30); // small buffer

  response.cookies.set({
    name: getSessionCookieName(),
    value: String(loginPayload.idToken),
    httpOnly: true,
    sameSite: "lax", // change to "strict" if you don't need cross-site redirects
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });

  return response;
}
