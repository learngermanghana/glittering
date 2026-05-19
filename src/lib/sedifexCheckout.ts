export type SedifexBookingCreateResponse = {
  id?: string;
  bookingId?: string;
  booking_id?: string;
  booking?: {
    id?: string;
    bookingId?: string;
    booking_id?: string;
    [key: string]: unknown;
  };
  data?: {
    id?: string;
    bookingId?: string;
    booking_id?: string;
    [key: string]: unknown;
  };
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

export type CheckoutCustomer = {
  name?: string;
  email?: string;
  phone?: string;
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

const DEFAULT_SEDIFEX_BASE_URL = "https://us-central1-sedifex-web.cloudfunctions.net";

const readEnv = (key: string) => process.env[key]?.trim() ?? "";

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

export const getPrimarySedifexStoreId = () =>
  readEnv("SEDIFEX_BOOKING_TARGET_STORE_ID") || readEnv("SEDIFEX_WEBSITE_STORE_ID") || readEnv("NEXT_PUBLIC_SEDIFEX_STORE_ID") || "37mJqg20MjOriggaIaOOuahDsgj1";

const getIntegrationBaseUrl = () =>
  normalizeAbsoluteUrl(
    "SEDIFEX_INTEGRATION_API_BASE_URL",
    readEnv("SEDIFEX_INTEGRATION_API_BASE_URL") || readEnv("SEDIFEX_INTEGRATION_BASE_URL") || DEFAULT_SEDIFEX_BASE_URL,
  );

const getCheckoutCreateUrl = () => {
  const directUrl = readEnv("SEDIFEX_INTEGRATION_CHECKOUT_CREATE_URL");
  return directUrl ? normalizeAbsoluteUrl("SEDIFEX_INTEGRATION_CHECKOUT_CREATE_URL", directUrl) : `${getIntegrationBaseUrl()}/integration/checkout/create`;
};

export const getCheckoutReturnUrl = () => {
  const directReturnUrl = readEnv("SEDIFEX_CHECKOUT_RETURN_URL");
  if (directReturnUrl) return normalizeAbsoluteUrl("SEDIFEX_CHECKOUT_RETURN_URL", directReturnUrl);

  const siteUrl = readEnv("NEXT_PUBLIC_SITE_URL");
  if (siteUrl) return `${normalizeAbsoluteUrl("NEXT_PUBLIC_SITE_URL", siteUrl)}/payment/return`;

  return "";
};

const getContractVersion = () => readEnv("SEDIFEX_INTEGRATION_API_VERSION") || readEnv("SEDIFEX_CONTRACT_VERSION") || "2026-04-13";

const getSedifexToken = () => {
  const token =
    readEnv("SEDIFEX_INTEGRATION_API_KEY") ||
    readEnv("SEDIFEX_MERCHANT_TOKEN") ||
    readEnv("SEDIFEX_MAIN_MERCHANT_TOKEN") ||
    readEnv("SEDIFEX_CHECKOUT_MERCHANT_TOKEN");

  if (!token) {
    throw new Error("Configure SEDIFEX_INTEGRATION_API_KEY or SEDIFEX_MERCHANT_TOKEN for the main 37... Sedifex store.");
  }

  return token;
};

const buildSedifexHeaders = (storeId: string) => {
  const token = getSedifexToken();
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Sedifex-Contract-Version": getContractVersion(),
    Authorization: `Bearer ${token}`,
    "x-api-key": token,
    "x-sedifex-store-id": storeId,
    "x-sedifex-merchant-id": storeId,
  };
};

async function readJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const text = await response.text().catch(() => "");
  const parsed = text ? (JSON.parse(text) as T) : ({} as T);

  if (!response.ok) {
    const errorPayload = parsed as { error?: string; message?: string };
    throw new Error(errorPayload.error ?? errorPayload.message ?? `${fallbackMessage}: ${text}`);
  }

  return parsed;
}

export function readBookingId(response: SedifexBookingCreateResponse) {
  const candidates = [
    response.bookingId,
    response.booking_id,
    response.id,
    response.booking?.bookingId,
    response.booking?.booking_id,
    response.booking?.id,
    response.data?.bookingId,
    response.data?.booking_id,
    response.data?.id,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  }

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

export async function createIntegrationBooking(storeId: string, payload: Record<string, unknown>) {
  const params = new URLSearchParams({ storeId });
  const response = await fetch(`${getIntegrationBaseUrl()}/v1IntegrationBookings?${params.toString()}`, {
    method: "POST",
    headers: buildSedifexHeaders(storeId),
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  return readJsonResponse<SedifexBookingCreateResponse>(response, "Failed to create booking in Sedifex");
}

export async function createHostedServiceCheckout(input: CreateHostedCheckoutInput) {
  const payload = {
    storeId: input.storeId,
    store_id: input.storeId,
    merchantId: input.storeId,
    merchant_id: input.storeId,
    clientOrderId: input.clientOrderId,
    client_order_id: input.clientOrderId,
    orderType: input.orderType,
    order_type: input.orderType,
    currency: input.currency ?? "GHS",
    amount: input.amount,
    customer: input.customer,
    returnUrl: input.returnUrl,
    metadata: {
      bookingId: input.bookingId,
      channel: "client-website",
      ...(input.metadata ?? {}),
    },
  };

  const response = await fetch(getCheckoutCreateUrl(), {
    method: "POST",
    headers: buildSedifexHeaders(input.storeId),
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  return readJsonResponse<SedifexCheckoutCreateResponse>(response, "Failed to create hosted Sedifex checkout");
}
