import { NextResponse } from "next/server";
import { getIntegrationGalleryItems } from "@/lib/gallery";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get("storeId")?.trim();

  if (!storeId) {
    return NextResponse.json({ error: "Missing storeId query parameter." }, { status: 400 });
  }

  try {
    const items = await getIntegrationGalleryItems(storeId);
    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load integration gallery.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
