import { NextResponse } from "next/server";
import { getTeamSession } from "@/lib/auth";
import { writeEvent } from "@/lib/engagement";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getTeamSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  await writeEvent("moderation.changed", { commentId: id, storeId: session.resolvedStoreId, platformOrigin: body.originPlatform ?? "website_api" });
  return NextResponse.json({ id, status: body.status, visibility: body.visibility, updated: true });
}
