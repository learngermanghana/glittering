import { NextResponse } from "next/server";
import { canonicalProductKey, resolveIdentity } from "@/lib/engagement";

export async function POST(request: Request) {
  const body = await request.json();
  const identity = await resolveIdentity(body);
  if (!identity) return NextResponse.json({ error: "Unable to resolve product identity." }, { status: 404 });
  return NextResponse.json({ ...identity, canonicalProductKey: canonicalProductKey(identity) });
}
