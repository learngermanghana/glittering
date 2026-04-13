import { NextResponse } from "next/server";
import { getIntegrationGalleryItems } from "@/lib/gallery";

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization")?.trim();
  if (!authorization) return null;

  const [scheme, token] = authorization.split(/\s+/, 2);
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token.trim();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get("storeId")?.trim();
  const expectedApiKey = process.env.INTEGRATION_API_KEY?.trim();
  const token = getBearerToken(request);

  if (!expectedApiKey) {
    return NextResponse.json({ error: "Integration API key is not configured." }, { status: 500 });
  }

  if (!token || token !== expectedApiKey) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

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
