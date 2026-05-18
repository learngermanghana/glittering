import { randomUUID } from "node:crypto";

export type CheckoutItem = {
  productId: string;
  quantity: number;
  merchantId: string;
  type?: "PRODUCT" | "SERVICE";
  itemName?: string;
  productName?: string;
  serviceName?: string;
};

type SedifexCheckoutItem = {
  type: "PRODUCT" | "SERVICE";
  item_type: "product" | "service";
  item_id: string;
  qty: number;
  name?: string;
  itemName?: string;
  productName?: string;
  serviceName?: string;
};

export type SedifexCheckoutPreviewResponse = {
  pricing_version?: string;
  currency?: string;
  subtotal?: number;
  tax_total?: number;
  delivery_fee?: number;
  pre_processing_total?: number;
  processing_fee_to_add?: number;
  final_total?: number;
  breakdown?: Array<{ code: string; amount: number }>;
  [key: string]: unknown;
};

export type SedifexCheckoutCreateResponse = {
  authorizationUrl?: string;
  authorization_url?: string;
  checkoutUrl?: string;
  checkout_url?: string;
  payment_reference?: string;
  paymentReference?: string;
  bookingId?: string;
  orderId?: string;
  [key: string]: unknown;
};

type CheckoutCustomer = {
  name?: string;
  email?: string;
  phone?: string;
};

type CreateCheckoutOptions = {
  reference: string;
  pricingSnapshot?: SedifexCheckoutPreviewResponse;
  customer?: CheckoutCustomer;
  booking?: Record<string, unknown>;
  attributes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

const DEFAULT_SEDIFEX_BASE_URL = "https://us-central1-sedifex-web.cloudfunctions.net";

const readEnv = (key: string) => process.env[key]?.trim() ?? "";

const requireEnv = (key: string) => {
  const value = readEnv(key);
  if (!value) throw new Error(`${key} is not configured.`);
  return value;
};

const normalizeAbsoluteUrl = (key: string, rawUrl: string) => {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new Error(`${key} must be an absolute URL.`);
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`${key} must use http or https protocol.`);
  }

  return parsed.toString().replace(/\/$/, "");
};

const getCheckoutBaseUrl = () =>
  normalizeAbsoluteUrl(
    "SEDIFEX_INTEGRATION_API_BASE_URL",
    readEnv("SEDIFEX_INTEGRATION_API_BASE_URL") || readEnv("SEDIFEX_INTEGRATION_BASE_URL") || DEFAULT_SEDIFEX_BASE_URL,
  );

const getCheckoutPreviewUrl = () => {
  const directUrl = readEnv("SEDIFEX_INTEGRATION_CHECKOUT_PREVIEW_URL");
  return directUrl ? normalizeAbsoluteUrl("SEDIFEX_INTEGRATION_CHECKOUT_PREVIEW_URL", directUrl) : `${getCheckoutBaseUrl()}/integration/checkout/preview`;
};

const getCheckoutCreateUrl = () => {
  const directUrl = readEnv("SEDIFEX_INTEGRATION_CHECKOUT_CREATE_URL");
  return directUrl ? normalizeAbsoluteUrl("SEDIFEX_INTEGRATION_CHECKOUT_CREATE_URL", directUrl) : `${getCheckoutBaseUrl()}/integration/checkout/create`;
};

const getContractVersion = () => readEnv("SEDIFEX_INTEGRATION_API_VERSION") || readEnv("SEDIFEX_CONTRACT_VERSION") || "2026-04-13";

const normalizeStoreIdentifier = (value: string) => value.trim().replace(/^[\"'`]+|[\"'`]+$/g, "");

const getMerchantTokensJsonMap = (): Record<string, string> => {
  const raw = readEnv("SEDIFEX_MERCHANT_TOKENS_JSON");
  if (!raw) return {};

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("SEDIFEX_MERCHANT_TOKENS_JSON must be valid JSON.");
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("SEDIFEX_MERCHANT_TOKENS_JSON must be a JSON object mapping storeId to token.");
  }

  const map: Record<string, string> = {};
  for (const [storeId, token] of Object.entries(parsed)) {
    const normalizedStoreId = normalizeStoreIdentifier(storeId);
    if (normalizedStoreId && typeof token === "string" && token.trim()) {
      map[normalizedStoreId] = token.trim();
    }
  }

  return map;
};

const normalizeMerchantId = (merchantId: string) => {
  const normalized = normalizeStoreIdentifier(merchantId);
  if (!normalized) {
    throw new Error("Checkout storeId is missing. Choose a Glittering branch before creating payment.");
  }
  return normalized;
};

const getMerchantToken = (merchantId: string) => {
  const normalizedMerchantId = normalizeMerchantId(merchantId);
  const jsonToken = getMerchantTokensJsonMap()[normalizedMerchantId];
  if (jsonToken) return jsonToken;

  const safeEnvKey = `SEDIFEX_MERCHANT_TOKEN_${normalizedMerchantId.replace(/[^A-Za-z0-9]/g, "_").toUpperCase()}`;
  const tokenFromSafeKey = readEnv(safeEnvKey);
  if (tokenFromSafeKey) return tokenFromSafeKey;

  const singleMerchantToken = readEnv("SEDIFEX_MERCHANT_TOKEN");
  if (singleMerchantToken) return singleMerchantToken;

  const legacyIntegrationKey = readEnv("SEDIFEX_INTEGRATION_API_KEY");
  if (legacyIntegrationKey) return legacyIntegrationKey;

  throw new Error(`Missing Sedifex merchant token for ${normalizedMerchantId}. Configure SEDIFEX_MERCHANT_TOKENS_JSON.`);
};

const normalizeQuantity = (quantity: number) => {
  const nextQuantity = Math.floor(Number(quantity));
  if (!Number.isFinite(nextQuantity) || nextQuantity <= 0) {
    throw new Error("Checkout quantity must be a positive whole number.");
  }
  return nextQuantity;
};

const normalizeCheckoutItemType = (type?: CheckoutItem["type"]) => {
  const contractType = type === "PRODUCT" ? "PRODUCT" : "SERVICE";
  return {
    contractType,
    backendItemType: contractType === "SERVICE" ? "service" : "product",
  } as const;
};

const normalizeCheckoutItemId = (item: CheckoutItem) => {
  const rawItemId = item.productId.trim();
  const merchantId = item.merchantId.trim();
  if (!rawItemId) throw new Error("Checkout item_id is missing.");

  const merchantPrefix = `${merchantId}_`;
  if (merchantId && rawItemId.startsWith(merchantPrefix)) {
    return rawItemId.slice(merchantPrefix.length);
  }

  return rawItemId;
};

const toSedifexCheckoutItem = (item: CheckoutItem): SedifexCheckoutItem => {
  const itemType = normalizeCheckoutItemType(item.type);
  const name = item.itemName?.trim() || item.productName?.trim() || item.serviceName?.trim() || undefined;
  return {
    type: itemType.contractType,
    item_type: itemType.backendItemType,
    item_id: normalizeCheckoutItemId(item),
    qty: normalizeQuantity(item.quantity),
    name,
    itemName: item.itemName?.trim() || undefined,
    productName: item.productName?.trim() || undefined,
    serviceName: item.serviceName?.trim() || undefined,
  };
};

const getBaseTotalMinor = (preview?: SedifexCheckoutPreviewResponse) => {
  if (!preview) return null;
  const candidates = [preview.final_total, preview.pre_processing_total, preview.subtotal];
  for (const value of candidates) {
    if (typeof value === "number" && Number.isFinite(value) && value > 0) return Math.round(value);
  }
  return null;
};

export const createCheckoutReference = (merchantId: string) => `${merchantId}_${Date.now()}_${randomUUID().slice(0, 8)}`;

export const readCheckoutUrl = (checkout: SedifexCheckoutCreateResponse) => {
  const value = checkout.authorizationUrl ?? checkout.authorization_url ?? checkout.checkoutUrl ?? checkout.checkout_url;
  return typeof value === "string" && value.trim() ? value.trim() : "";
};

export async function previewSedifexCheckout(merchantId: string, items: CheckoutItem[]) {
  const normalizedMerchantId = normalizeMerchantId(merchantId);
  const merchantToken = getMerchantToken(normalizedMerchantId);

  const response = await fetch(getCheckoutPreviewUrl(), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Sedifex-Contract-Version": getContractVersion(),
      Authorization: `Bearer ${merchantToken}`,
      "x-api-key": merchantToken,
      "x-sedifex-store-id": normalizedMerchantId,
      "x-sedifex-merchant-id": normalizedMerchantId,
    },
    body: JSON.stringify({
      store_id: normalizedMerchantId,
      merchant_id: normalizedMerchantId,
      storeId: normalizedMerchantId,
      merchantId: normalizedMerchantId,
      currency: "GHS",
      fulfillment_type: "PICKUP",
      delivery_address_id: null,
      items: items.map(toSedifexCheckoutItem),
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Sedifex request failed (${response.status}) for checkout preview: ${body}`);
  }

  return (await response.json()) as SedifexCheckoutPreviewResponse;
}

export async function createSedifexCheckout(merchantId: string, items: CheckoutItem[], options: CreateCheckoutOptions) {
  const normalizedMerchantId = normalizeMerchantId(merchantId);
  const merchantToken = getMerchantToken(normalizedMerchantId);
  const finalTotalMinor = getBaseTotalMinor(options.pricingSnapshot);
  const fallbackAmountMajor = finalTotalMinor ? finalTotalMinor / 100 : undefined;
  const returnUrl = readEnv("SEDIFEX_CHECKOUT_RETURN_URL") || readEnv("NEXT_PUBLIC_SITE_URL");

  const response = await fetch(getCheckoutCreateUrl(), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Sedifex-Contract-Version": getContractVersion(),
      Authorization: `Bearer ${merchantToken}`,
      "x-api-key": merchantToken,
      "x-sedifex-store-id": normalizedMerchantId,
      "x-sedifex-merchant-id": normalizedMerchantId,
    },
    body: JSON.stringify({
      store_id: normalizedMerchantId,
      merchant_id: normalizedMerchantId,
      storeId: normalizedMerchantId,
      merchantId: normalizedMerchantId,
      currency: options.pricingSnapshot?.currency ?? "GHS",
      payment_reference: options.reference,
      paymentReference: options.reference,
      client_order_id: options.reference,
      clientOrderId: options.reference,
      amount: fallbackAmountMajor,
      items: items.map(toSedifexCheckoutItem),
      pricing_snapshot: options.pricingSnapshot,
      customer: options.customer,
      booking: options.booking,
      attributes: options.attributes,
      metadata: options.metadata,
      recordType: "service_booking",
      sourceChannel: "glittering_website",
      source_channel: "glittering_website",
      payment_status: "pending",
      paymentStatus: "pending",
      order_status: "pending_payment",
      orderStatus: "pending_payment",
      bookingStatus: "pending_payment",
      paymentCollectionMode: "online_checkout",
      returnUrl: returnUrl || undefined,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Sedifex request failed (${response.status}) for checkout create: ${body}`);
  }

  return (await response.json()) as SedifexCheckoutCreateResponse;
}
