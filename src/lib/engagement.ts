import { createHmac, randomUUID } from "node:crypto";
import { fetchFirestoreDocument } from "@/lib/firebase";

export type ProductIdentity = { storeId: string; sourceProductId: string };

export type CommentStatus = "pending" | "approved" | "rejected";
export type CommentVisibility = "public" | "store_only";
export type PlatformOrigin = "sedifexmarket" | "storefront" | "website_api";

export function canonicalProductKey({ storeId, sourceProductId }: ProductIdentity) {
  return `${storeId}:${sourceProductId}`;
}

export async function resolveFromPublicProduct(publicProductId: string): Promise<ProductIdentity | null> {
  const doc = await fetchFirestoreDocument<{ storeId?: string; sourceProductId?: string }>("publicProducts", publicProductId);
  if (!doc?.storeId || !doc?.sourceProductId) return null;
  return { storeId: doc.storeId, sourceProductId: doc.sourceProductId };
}

export async function resolveFromStoreProduct(storeId: string, productId: string): Promise<ProductIdentity> {
  return { storeId, sourceProductId: productId };
}

export async function resolveIdentity(input: {
  storeId?: string;
  sourceProductId?: string;
  publicProductId?: string;
}): Promise<ProductIdentity | null> {
  if (input.storeId && input.sourceProductId) return resolveFromStoreProduct(input.storeId, input.sourceProductId);
  if (input.publicProductId) return resolveFromPublicProduct(input.publicProductId);
  return null;
}

export async function writeEvent(event: string, payload: Record<string, unknown>) {
  const apiBase = process.env.NEXT_PUBLIC_FIREBASE_API_BASE_URL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!projectId || !apiKey || !apiBase) return;

  const eventId = randomUUID();
  const occurredAt = new Date().toISOString();
  const body = {
    fields: {
      event: { stringValue: event },
      eventId: { stringValue: eventId },
      occurredAt: { timestampValue: occurredAt },
      payload: { stringValue: JSON.stringify(payload) },
    },
  };

  await fetch(`${apiBase}/projects/${projectId}/databases/(default)/documents/engagement_events?documentId=${eventId}&key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const webhookUrl = process.env.SEDIFEX_ENGAGEMENT_WEBHOOK_URL;
  const webhookSecret = process.env.SEDIFEX_WEBHOOK_SECRET;
  if (!webhookUrl || !webhookSecret) return;

  const webhookPayload = { event, eventId, occurredAt, ...payload };
  const raw = JSON.stringify(webhookPayload);
  const signature = createHmac("sha256", webhookSecret).update(raw).digest("hex");

  await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Sedifex-Signature": signature,
    },
    body: raw,
  });
}
