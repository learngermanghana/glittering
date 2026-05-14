import { NextResponse } from "next/server";
import { canonicalProductKey, resolveIdentity } from "@/lib/engagement";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const identity = await resolveIdentity({
    storeId: searchParams.get("storeId") ?? undefined,
    sourceProductId: searchParams.get("sourceProductId") ?? undefined,
    publicProductId: searchParams.get("publicProductId") ?? undefined,
  });
  if (!identity) return NextResponse.json({ error: "Missing product identity." }, { status: 400 });
  return NextResponse.json({ canonicalProductKey: canonicalProductKey(identity), ...identity, commentsCount: 0, favoritesCount: 0 });
}
