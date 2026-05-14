import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getTeamSession } from "@/lib/auth";
import { canonicalProductKey, resolveIdentity, writeEvent } from "@/lib/engagement";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

function dbUrl(path: string) {
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}?key=${apiKey}`;
}

export async function POST(request: Request) {
  const session = await getTeamSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = await request.json();
  const identity = await resolveIdentity(body);
  if (!identity) return NextResponse.json({ error: "Missing product identity." }, { status: 400 });
  if (identity.storeId !== session.resolvedStoreId) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const key = canonicalProductKey(identity);
  const now = new Date().toISOString();
  const docId = randomUUID();
  const res = await fetch(dbUrl(`engagement_comments?documentId=${docId}`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fields: {
        canonicalProductKey: { stringValue: key },
        storeId: { stringValue: identity.storeId },
        sourceProductId: { stringValue: identity.sourceProductId },
        body: { stringValue: String(body.body ?? "").trim() },
        rating: body.rating ? { integerValue: String(body.rating) } : undefined,
        authorUserId: { stringValue: session.sub },
        authorDisplayName: { stringValue: body.authorDisplayName ?? "Anonymous" },
        originPlatform: { stringValue: body.originPlatform ?? "website_api" },
        status: { stringValue: "pending" },
        visibility: { stringValue: body.visibility ?? "public" },
        createdAt: { timestampValue: now },
        updatedAt: { timestampValue: now },
      },
    }),
  });
  if (!res.ok) return NextResponse.json({ error: "Failed to create comment." }, { status: 500 });
  await writeEvent("comment.created", { canonicalProductKey: key, ...identity, platformOrigin: body.originPlatform ?? "website_api" });
  return NextResponse.json({ id: docId, canonicalProductKey: key, createdAt: now });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const identity = await resolveIdentity({
    storeId: searchParams.get("storeId") ?? undefined,
    sourceProductId: searchParams.get("sourceProductId") ?? undefined,
    publicProductId: searchParams.get("publicProductId") ?? undefined,
  });
  if (!identity) return NextResponse.json({ error: "Missing product identity." }, { status: 400 });
  const key = canonicalProductKey(identity);
  return NextResponse.json({ canonicalProductKey: key, comments: [] });
}
