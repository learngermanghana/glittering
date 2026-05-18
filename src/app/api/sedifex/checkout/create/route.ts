import { NextResponse } from "next/server";
import { getProductsCatalogData } from "@/lib/products";

const STORE_ID = "37mJqg20MjOriggaIaOOuahDsgj1";

function normalizeItemId(value: string) {
  const trimmed = value.trim();
  const prefix = `${STORE_ID}_`;
  return trimmed.startsWith(prefix) ? trimmed.slice(prefix.length) : trimmed;
}

function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 15;
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
      const catalogProduct = catalogMap.get(line.id);
      if (!catalogProduct) throw new Error(`Product not found: ${line.id}`);
      if ((catalogProduct.quantity ?? 0) < line.quantity) throw new Error(`Insufficient stock for ${catalogProduct.name}`);
      const unitMinor = Math.round(catalogProduct.price * 100);
      return { id: normalizeItemId(line.id), originalProductId: line.id, name: catalogProduct.name, quantity: line.quantity, unitPrice: unitMinor, totalPrice: unitMinor * line.quantity };
    });

    const amount = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const clientOrderId = `HAJ-PAY-${Date.now()}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.glitteringmedspa.com";
    const selectedItemsSummary = items.map((item) => `${item.name} x${item.quantity}`).join(", ");
    const checkoutReturnParams = new URLSearchParams({
      reference: clientOrderId,
      course: selectedItemsSummary,
    });

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
      currency: "GHS",
      cart,
      items,
      amount,
      customer: { name: customer.name?.trim() || "", email: customer.email?.trim() || "", phone: customer.phone?.trim() || "" },
      delivery: { location: delivery.location?.trim() || "", notes: delivery.notes?.trim() || "" },
      returnUrl: `${appUrl}/checkout/success?${checkoutReturnParams.toString()}`,
      cancelUrl: `${appUrl}/checkout/failed?${checkoutReturnParams.toString()}`,
      syncStatus: "pending",
      syncRequestedAt: new Date().toISOString(),
    };

    const endpoint = process.env.SEDIFEX_CHECKOUT_CREATE_URL;
    if (!endpoint) return NextResponse.json({ error: "Missing SEDIFEX_CHECKOUT_CREATE_URL." }, { status: 500 });

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(process.env.SEDIFEX_INTEGRATION_API_KEY ? { Authorization: `Bearer ${process.env.SEDIFEX_INTEGRATION_API_KEY}` } : {}) },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: data?.error ?? "Checkout create failed." }, { status: response.status });

    return NextResponse.json({
      authorizationUrl: data.authorizationUrl ?? data.checkoutUrl,
      checkoutUrl: data.checkoutUrl ?? data.authorizationUrl,
      reference: data.reference ?? data.paymentReference ?? data.payment_reference ?? clientOrderId,
      clientOrderId,
      amountPaid: amount / 100,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Checkout failed." }, { status: 400 });
  }
}
