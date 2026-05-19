export type SedifexBookingCreateResponse = {
  id?: string;
  bookingId?: string;
  booking_id?: string;
  booking?: { id?: string; bookingId?: string; booking_id?: string; [key: string]: unknown };
  data?: { id?: string; bookingId?: string; booking_id?: string; [key: string]: unknown };
  [key: string]: unknown;
};

export type SedifexCheckoutCreateResponse = {
  authorizationUrl?: string;
  authorization_url?: string;
  checkoutUrl?: string;
  checkout_url?: string;
  payment_reference?: string;
  paymentReference?: string;
  reference?: string;
  clientOrderId?: string;
  client_order_id?: string;
  sedifexOrderId?: string;
  sedifex_order_id?: string;
  orderId?: string;
  order_id?: string;
  [key: string]: unknown;
};

export type SedifexCheckoutPreviewResponse = {
  ok?: boolean;
  currency?: string;
  subtotal?: number;
  transferFee?: number;
  customerTotal?: number;
  sedifexServiceFee?: number;
  storeReceives?: number;
  final_total?: number;
  pre_processing_total?: number;
  processing_fee_to_add?: number;
  items?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

export type CheckoutCustomer = { name?: string; email?: string; phone?: string };

export type ProductCheckoutItem = {
  type: "PRODUCT";
  item_type: "product";
  item_id: string;
  productId?: string;
  originalProductId?: string;
  qty: number;
  quantity?: number;
  name?: string;
  unitPrice?: number;
  price?: number;
};

type ProductCheckoutBaseInput = {
  storeId: string;
  items: ProductCheckoutItem[];
  customer: CheckoutCustomer;
  delivery?: { location?: string; notes?: string };
  fulfillmentType?: "DELIVERY" | "PICKUP";
};

type CreateHostedCheckoutInput = {
  storeId: string;
  bookingId: string;
  clientOrderId: string;
  orderType: "service";
  amount: number;
  currency?: string;
  customer: CheckoutCustomer;
  returnUrl: string;
  metadata?: Record<string, unknown>;
};

type CreateProductCheckoutInput = ProductCheckoutBaseInput & {
  clientOrderId: string;
  sourceChannel?: string;
  sourceLabel?: string;
  returnUrl: string;
  cancelUrl: string;
  preview?: SedifexCheckoutPreviewResponse;
  localAmount?: number;
  metadata?: Record<string, unknown>;
};

type SedifexAuthPurpose = "booking" | "checkout";

const DEFAULT_SEDIFEX_BASE_URL = "https://us-central1-sedifex-web.cloudfunctions.net";
const SEDIFEX_UNAUTHORIZED_PREFIX = "SEDIFEX_UNAUTHORIZED:";

const readEnv = (key: string) => process.env[key]?.trim() ?? "";

const normalizeAbsoluteUrl = (key: string, rawUrl: string) => {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new Error(`${key} must be an absolute URL.`);
  }
  if (!["http:", "https:"].includes(parsed.protocol)) throw new Error(`${key} must use http or https protocol.`);
  return parsed.toString().replace(/\/$/, "");
};

export const getPrimarySedifexStoreId = () =>
  readEnv("SEDIFEX_BOOKING_TARGET_STORE_ID") || readEnv("SEDIFEX_WEBSITE_STORE_ID") || readEnv("NEXT_PUBLIC_SEDIFEX_STORE_ID") || "37mJqg20MjOriggaIaOOuahDsgj1";

const getSiteUrl = () => normalizeAbsoluteUrl("NEXT_PUBLIC_SITE_URL", readEnv("NEXT_PUBLIC_SITE_URL") || "https://www.glitteringmedspa.com");

const getIntegrationBaseUrl = () =>
  normalizeAbsoluteUrl(
    "SEDIFEX_INTEGRATION_API_BASE_URL",
    readEnv("SEDIFEX_INTEGRATION_API_BASE_URL") || readEnv("SEDIFEX_INTEGRATION_BASE_URL") || DEFAULT_SEDIFEX_BASE_URL,
  );

const appendStoreIdQuery = (rawUrl: string, storeId: string) => {
  const url = new URL(rawUrl);
  url.searchParams.set("storeId", storeId);
  return url.toString();
};

const getIntegrationBookingsUrl = (storeId: string) => {
  const directUrl = readEnv("SEDIFEX_INTEGRATION_BOOKINGS_URL");
  const baseUrl = directUrl ? normalizeAbsoluteUrl("SEDIFEX_INTEGRATION_BOOKINGS_URL", directUrl) : `${getIntegrationBaseUrl()}/v1IntegrationBookings`;
  return appendStoreIdQuery(baseUrl, storeId);
};

const getCheckoutPreviewUrl = () => {
  const directUrl = readEnv("SEDIFEX_INTEGRATION_CHECKOUT_PREVIEW_URL");
  return directUrl ? normalizeAbsoluteUrl("SEDIFEX_INTEGRATION_CHECKOUT_PREVIEW_URL", directUrl) : `${getIntegrationBaseUrl()}/integration/checkout/preview`;
};

const getCheckoutCreateUrl = () => {
  const directUrl = readEnv("SEDIFEX_INTEGRATION_CHECKOUT_CREATE_URL");
  return directUrl ? normalizeAbsoluteUrl("SEDIFEX_INTEGRATION_CHECKOUT_CREATE_URL", directUrl) : `${getIntegrationBaseUrl()}/integration/checkout/create`;
};

export const getCheckoutReturnUrl = () => {
  const directReturnUrl = readEnv("SEDIFEX_CHECKOUT_RETURN_URL");
  if (directReturnUrl) return normalizeAbsoluteUrl("SEDIFEX_CHECKOUT_RETURN_URL", directReturnUrl);
  return `${getSiteUrl()}/payment/return`;
};

export const getCheckoutCancelUrl = () => {
  const directCancelUrl = readEnv("SEDIFEX_CHECKOUT_CANCEL_URL");
  if (directCancelUrl) return normalizeAbsoluteUrl("SEDIFEX_CHECKOUT_CANCEL_URL", directCancelUrl);
  return `${getSiteUrl()}/payment/return?status=cancelled`;
};

const getContractVersion = () => readEnv("SEDIFEX_INTEGRATION_API_VERSION") || readEnv("SEDIFEX_CONTRACT_VERSION") || "2026-04-13";

const getSedifexApiKey = (purpose: SedifexAuthPurpose) => {
  const key =
    purpose === "booking"
      ? readEnv("SEDIFEX_BOOKING_API_KEY") || readEnv("SEDIFEX_INTEGRATION_API_KEY") || readEnv("SEDIFEX_CHECKOUT_API_KEY")
      : readEnv("SEDIFEX_CHECKOUT_API_KEY") || readEnv("SEDIFEX_INTEGRATION_API_KEY") || readEnv("SEDIFEX_BOOKING_API_KEY");

  if (!key) {
    throw new Error(
      purpose === "booking"
        ? "Configure SEDIFEX_BOOKING_API_KEY or SEDIFEX_INTEGRATION_API_KEY for Sedifex booking creation."
        : "Configure SEDIFEX_CHECKOUT_API_KEY or SEDIFEX_INTEGRATION_API_KEY for Sedifex checkout.",
    );
  }

  return key;
};

const buildSedifexHeaders = (purpose: SedifexAuthPurpose) => {
  const apiKey = getSedifexApiKey(purpose);
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Sedifex-Contract-Version": getContractVersion(),
    Authorization: `Bearer ${apiKey}`,
    "x-api-key": apiKey,
  };
};

export function isSedifexUnauthorizedError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return message.includes(SEDIFEX_UNAUTHORIZED_PREFIX) || /\bunauthorized\b/i.test(message) || /\bforbidden\b/i.test(message) || /invalid-api-key/i.test(message);
}

async function readJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const text = await response.text().catch(() => "");
  let parsed: T;
  try {
    parsed = text ? (JSON.parse(text) as T) : ({} as T);
  } catch {
    throw new Error(`${fallbackMessage}: ${text}`);
  }

  if (!response.ok) {
    const errorPayload = parsed as { error?: string; message?: string };
    const serverMessage = errorPayload.error ?? errorPayload.message ?? text;
    if (response.status === 401 || response.status === 403 || /\bunauthorized\b/i.test(serverMessage) || /\bforbidden\b/i.test(serverMessage) || /invalid-api-key/i.test(serverMessage)) {
      throw new Error(`${SEDIFEX_UNAUTHORIZED_PREFIX} ${serverMessage || response.status}`);
    }
    throw new Error(serverMessage || `${fallbackMessage}: ${text}`);
  }
  return parsed;
}

export function normalizeSedifexItemId(rawId: string, storeId: string) {
  const id = rawId.trim();
  const prefix = `${storeId}_`;
  return storeId && id.startsWith(prefix) ? id.slice(prefix.length) : id;
}

function toProductCheckoutCart(items: ProductCheckoutItem[], storeId: string) {
  return items.map((item) => {
    const productId = item.productId || item.item_id;
    return {
      productId,
      item_id: productId,
      originalProductId: item.originalProductId || productId,
      merchantId: storeId,
      merchant_id: storeId,
      storeId,
      store_id: storeId,
      quantity: item.qty,
      qty: item.qty,
      type: "PRODUCT",
      item_type: "product",
    };
  });
}

function toProductCheckoutItems(items: ProductCheckoutItem[], storeId: string) {
  return items.map((item) => {
    const productId = item.productId || item.item_id;
    return {
      id: productId,
      item_id: productId,
      productId,
      originalProductId: item.originalProductId || productId,
      merchantId: storeId,
      merchant_id: storeId,
      storeId,
      store_id: storeId,
      name: item.name,
      unitPrice: item.unitPrice ?? item.price,
      price: item.price ?? item.unitPrice,
      qty: item.qty,
      quantity: item.qty,
      type: "PRODUCT",
      item_type: "product",
    };
  });
}

export function readBookingId(response: SedifexBookingCreateResponse) {
  const candidates = [response.bookingId, response.booking_id, response.id, response.booking?.bookingId, response.booking?.booking_id, response.booking?.id, response.data?.bookingId, response.data?.booking_id, response.data?.id];
  for (const candidate of candidates) if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  return "";
}

export const readCheckoutUrl = (checkout: SedifexCheckoutCreateResponse) => {
  const value = checkout.authorizationUrl ?? checkout.authorization_url ?? checkout.checkoutUrl ?? checkout.checkout_url;
  return typeof value === "string" && value.trim() ? value.trim() : "";
};

export function readSedifexOrderId(checkout: SedifexCheckoutCreateResponse) {
  const value = checkout.sedifexOrderId ?? checkout.sedifex_order_id ?? checkout.orderId ?? checkout.order_id;
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

export function getTrustedCustomerTotal(preview?: SedifexCheckoutPreviewResponse) {
  if (!preview) return null;
  const candidates = [preview.customerTotal, preview.final_total, preview.pre_processing_total, preview.subtotal];
  for (const value of candidates) if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
  return null;
}

export async function createIntegrationBooking(storeId: string, payload: Record<string, unknown>) {
  const response = await fetch(getIntegrationBookingsUrl(storeId), {
    method: "POST",
    headers: buildSedifexHeaders("booking"),
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  return readJsonResponse<SedifexBookingCreateResponse>(response, "Failed to create booking in Sedifex");
}

export async function createHostedServiceCheckout(input: CreateHostedCheckoutInput) {
  const response = await fetch(getCheckoutCreateUrl(), {
    method: "POST",
    headers: buildSedifexHeaders("checkout"),
    body: JSON.stringify({
      storeId: input.storeId,
      store_id: input.storeId,
      merchantId: input.storeId,
      merchant_id: input.storeId,
      clientOrderId: input.clientOrderId,
      client_order_id: input.clientOrderId,
      orderType: input.orderType,
      order_type: input.orderType,
      sourceChannel: "client_website",
      source_channel: "client_website",
      sourceLabel: "Client Website",
      source_label: "Client Website",
      currency: input.currency ?? "GHS",
      amount: input.amount,
      customer: input.customer,
      returnUrl: input.returnUrl,
      metadata: { bookingId: input.bookingId, channel: "client-website", ...(input.metadata ?? {}) },
      syncStatus: "pending",
      syncRequestedAt: new Date().toISOString(),
    }),
    cache: "no-store",
  });
  return readJsonResponse<SedifexCheckoutCreateResponse>(response, "Failed to create hosted Sedifex checkout");
}

export async function previewProductCheckout(input: ProductCheckoutBaseInput) {
  const normalizedItems = toProductCheckoutItems(input.items, input.storeId).map((item) => ({
    type: "PRODUCT",
    item_type: "product",
    item_id: item.item_id,
    productId: item.productId,
    qty: item.qty,
    quantity: item.quantity,
    name: item.name,
    unitPrice: item.unitPrice,
    price: item.price,
  }));

  const response = await fetch(getCheckoutPreviewUrl(), {
    method: "POST",
    headers: buildSedifexHeaders("checkout"),
    body: JSON.stringify({
      storeId: input.storeId,
      store_id: input.storeId,
      merchantId: input.storeId,
      merchant_id: input.storeId,
      currency: "GHS",
      fulfillment_type: input.fulfillmentType ?? "DELIVERY",
      delivery_address_id: null,
      items: normalizedItems,
      customer: input.customer,
      delivery: input.delivery,
      sourceChannel: "client_website",
      source_channel: "client_website",
      sourceLabel: "Client Website",
      source_label: "Client Website",
    }),
    cache: "no-store",
  });
  return readJsonResponse<SedifexCheckoutPreviewResponse>(response, "Failed to preview Sedifex checkout");
}

export async function createProductCheckout(input: CreateProductCheckoutInput) {
  const amount = getTrustedCustomerTotal(input.preview) ?? input.localAmount;
  const cart = toProductCheckoutCart(input.items, input.storeId);
  const items = toProductCheckoutItems(input.items, input.storeId);
  const response = await fetch(getCheckoutCreateUrl(), {
    method: "POST",
    headers: buildSedifexHeaders("checkout"),
    body: JSON.stringify({
      storeId: input.storeId,
      store_id: input.storeId,
      merchantId: input.storeId,
      merchant_id: input.storeId,
      clientOrderId: input.clientOrderId,
      client_order_id: input.clientOrderId,
      sourceChannel: input.sourceChannel ?? "client_website",
      source_channel: input.sourceChannel ?? "client_website",
      sourceLabel: input.sourceLabel ?? "Client Website",
      source_label: input.sourceLabel ?? "Client Website",
      orderType: "product",
      order_type: "product",
      currency: "GHS",
      cart,
      items,
      amount,
      customer: input.customer,
      delivery: input.delivery,
      returnUrl: input.returnUrl,
      cancelUrl: input.cancelUrl,
      pricing_snapshot: input.preview,
      metadata: input.metadata,
      paymentCollectionMode: "online_checkout",
      paymentStatus: "checkout_created",
      payment_status: "checkout_created",
      orderStatus: "pending_payment",
      order_status: "pending_payment",
      syncStatus: "pending",
      syncRequestedAt: new Date().toISOString(),
    }),
    cache: "no-store",
  });
  return readJsonResponse<SedifexCheckoutCreateResponse>(response, "Failed to create Sedifex product checkout");
}
