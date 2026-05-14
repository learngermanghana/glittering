import { NextResponse } from "next/server";
import { getTeamSession } from "@/lib/auth";
import { canonicalProductKey, resolveIdentity, writeEvent } from "@/lib/engagement";

export async function POST(request: Request) {
  const session = await getTeamSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = await request.json();
  const identity = await resolveIdentity(body);
  if (!identity) return NextResponse.json({ error: "Missing product identity." }, { status: 400 });
  const key = canonicalProductKey(identity);
  await writeEvent("favorite.changed", { canonicalProductKey: key, ...identity, platformOrigin: body.originPlatform ?? "website_api" });
  return NextResponse.json({ ok: true, canonicalProductKey: key, userId: session.sub });
}

export async function DELETE(request: Request) {
  const session = await getTeamSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = await request.json();
  const identity = await resolveIdentity(body);
  if (!identity) return NextResponse.json({ error: "Missing product identity." }, { status: 400 });
  const key = canonicalProductKey(identity);
  await writeEvent("favorite.changed", { canonicalProductKey: key, ...identity, removed: true, platformOrigin: body.originPlatform ?? "website_api" });
  return NextResponse.json({ ok: true, canonicalProductKey: key, userId: session.sub, removed: true });
}
