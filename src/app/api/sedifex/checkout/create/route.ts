import { NextResponse } from "next/server";
import { getProductsCatalogData } from "@/lib/products";

const DEFAULT_STORE_ID = "37mJqg20MjOriggaIaOOuahDsgj1";
const STORE_ID = process.env.SEDIFEX_BOOKING_TARGET_STORE_ID || process.env.NEXT_PUBLIC_SEDIFEX_STORE_ID || DEFAULT_STORE_ID;

function stripFrontendSuffix(value: string) {
  return value.trim().replace(/-\d+$/, "");
}

function normalizeItemId(value: string) {
  const trimmed = stripFrontendSuffix(value);
  const prefix = `${STORE_ID}_`;
  return trimmed.startsWith(prefix) ? trimmed.slice(prefix.length) : trimmed;
}

function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 15;
}

function readCheckoutUrl(data: Record<string, unknown>) {
  const value = data.checkoutUrl ?? data.authorizationUrl ?? data.checkout_url ?? data.authorization_url;
  return typeof value === "string" ? value : "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      cart?: Array<{ id: string; quantity: number }>;
      customer?: { name?: string; email?: string; phone?: string };
      delivery?: { location?: string; notes?: string };
    };

    const cart = Array.isArray(body.cart) ? body.cart : [];
    const customer = body.customer ?? {};
    const delivery = body.delivery ?? {};

    if (!cart.length) return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    if (!isValidPhone(customer.phone ?? "")) return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });

    const catalog = await getProductsCatalogData();
    const catalogMap = new Map(catalog.map((product) => [String(product.id ?? ""), product]));

    const items = cart.map((line) => {
      const rawId = String(line.id ?? "");
      const normalizedId = normalizeItemId(rawId);
      const catalogProduct = catalogMap.get(normalizedId) || catalogMap.get(stripFrontendSuffix(rawId)) || catalogMap.get(rawId);

      if (!catalogProduct) throw new Error(`Product not found: ${rawId}`);
      if ((catalogProduct.quantity ?? 0) < line.quantity) throw new Error(`Insufficient stock for ${catalogProduct.name}`);

      const productId = normalizeItemId(String(catalogProduct.id ?? normalizedId));
      const unitPrice = Number(catalogProduct.price || 0);
      const unitMinor = Math.round(unitPrice * 100);

      return {
        id: productId,
        item_id: productId,
        productId,
        originalProductId: rawId,
        name: catalogProduct.name,
        unitPrice,
        price: unitPrice,
        qty: line.quantity,
        quantity: line.quantity,
        type: "PRODUCT",
        item_type: "product",
        totalPrice: unitMinor * line.quantity,
      };
    });

    const normalizedCart = items.map((item) => ({
      productId: item.productId,
      item_id: item.item_id,
      originalProductId: item.originalProductId,
      merchantId: STORE_ID,
      merchant_id: STORE_ID,
      storeId: STORE_ID,
      store_id: STORE_ID,
      quantity: item.quantity,
      qty: item.qty,
      type: "PRODUCT",
      item_type: "product",
    }));

    const amount = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const clientOrderId = `GLITTERING-PAY-${Date.now()}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.glitteringmedspa.com";
    const selectedItemsSummary = items.map((item) => `${item.name} x${item.quantity}`).join(", ");
    const checkoutReturnParams = new URLSearchParams({ reference: clientOrderId, course: selectedItemsSummary });

    const payload = {
      storeId: STORE_ID,
      store_id: STORE_ID,
      merchantId: STORE_ID,
      merchant_id: STORE_ID,
      clientOrderId,
      client_order_id: clientOrderId,
      sourceChannel: "client_website",
      source_channel: "client_website",
      sourceLabel: "Client Website",
      source_label: "Client Website",
      orderType: "product",
      order_type: "product",
      currency: "GHS",
      cart: normalizedCart,
      items,
      amount,
      customer: { name: customer.name?.trim() || "", email: customer.email?.trim() || "", phone: customer.phone?.trim() || "" },
      delivery: { location: delivery.location?.trim() || "", notes: delivery.notes?.trim() || "" },
      returnUrl: `${appUrl}/payment/return?${checkoutReturnParams.toString()}`,
      cancelUrl: `${appUrl}/payment/return?status=cancelled&${checkoutReturnParams.toString()}`,
      syncStatus: "pending",
      syncRequestedAt: new Date().toISOString(),
    };

    const endpoint = process.env.SEDIFEX_INTEGRATION_CHECKOUT_CREATE_URL || process.env.SEDIFEX_CHECKOUT_CREATE_URL;
    if (!endpoint) return NextResponse.json({ error: "Missing SEDIFEX_INTEGRATION_CHECKOUT_CREATE_URL." }, { status: 500 });

    const apiKey = process.env.SEDIFEX_CHECKOUT_API_KEY || process.env.SEDIFEX_INTEGRATION_API_KEY || process.env.SEDIFEX_BOOKING_API_KEY || "";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Sedifex-Contract-Version": process.env.SEDIFEX_CONTRACT_VERSION || process.env.SEDIFEX_INTEGRATION_API_VERSION || "2026-04-13",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}`, "x-api-key": apiKey } : {}),
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    if (!response.ok) return NextResponse.json({ error: data?.error ?? "Checkout create failed." }, { status: response.status });

    const checkoutUrl = readCheckoutUrl(data);
    return NextResponse.json({
      authorizationUrl: checkoutUrl,
      checkoutUrl,
      reference: data.reference ?? data.paymentReference ?? data.payment_reference ?? clientOrderId,
      clientOrderId,
      amountPaid: amount / 100,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Checkout failed." }, { status: 400 });
  }
}
