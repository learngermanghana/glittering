import { NextResponse } from "next/server";
import { getProductsCatalogData } from "@/lib/products";
import {
  createProductCheckout,
  getCheckoutCancelUrl,
  getCheckoutReturnUrl,
  getPrimarySedifexStoreId,
  getTrustedCustomerTotal,
  normalizeSedifexItemId,
  previewProductCheckout,
  readCheckoutUrl,
  readSedifexOrderId,
  type ProductCheckoutItem,
} from "@/lib/sedifexCheckout";

const CLIENT_SOURCE_CHANNEL = "client_website";
const CLIENT_SOURCE_LABEL = "Client Website";

type CheckoutCreateBody = {
  cart?: Array<{ id?: string; quantity?: number }>;
  customer?: { name?: string; email?: string; phone?: string };
  delivery?: { location?: string; notes?: string };
};

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 15;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeCartQuantity(value: unknown) {
  const quantity = Math.floor(Number(value));
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
}

function createClientOrderId() {
  return `WEB-PAY-${Date.now()}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutCreateBody;
    const rawCart = Array.isArray(body.cart) ? body.cart : [];
    const customerName = readString(body.customer?.name);
    const customerPhone = readString(body.customer?.phone);
    const customerEmail = readString(body.customer?.email).toLowerCase();
    const deliveryLocation = readString(body.delivery?.location);
    const deliveryNotes = readString(body.delivery?.notes);
    const storeId = getPrimarySedifexStoreId();

    if (!rawCart.length) return NextResponse.json({ error: "Cart is empty. Add at least one product." }, { status: 400 });
    if (!customerName) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    if (!isValidPhone(customerPhone)) return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
    if (!isValidEmail(customerEmail)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    if (!deliveryLocation) return NextResponse.json({ error: "Please enter a delivery or pickup location." }, { status: 400 });

    const catalog = await getProductsCatalogData();
    const catalogMap = new Map(catalog.filter((product) => !product.isService).map((product) => [String(product.id ?? ""), product]));

    const items: ProductCheckoutItem[] = rawCart.map((line) => {
      const displayId = readString(line.id);
      const quantity = normalizeCartQuantity(line.quantity);
      if (!displayId) throw new Error("A cart item is missing its product ID.");
      if (!quantity) throw new Error("Cart quantity must be at least 1.");

      const catalogProduct = catalogMap.get(displayId);
      if (!catalogProduct) throw new Error(`Product not found or not available for checkout: ${displayId}`);
      if (catalogProduct.quantity !== null && catalogProduct.quantity < quantity) throw new Error(`Only ${catalogProduct.quantity} left for ${catalogProduct.name}.`);
      if (!catalogProduct.price || catalogProduct.price <= 0) throw new Error(`${catalogProduct.name} has no valid price.`);

      return {
        type: "PRODUCT",
        item_type: "product",
        item_id: normalizeSedifexItemId(displayId, storeId),
        qty: quantity,
        name: catalogProduct.name,
      };
    });

    const customer = { name: customerName, email: customerEmail, phone: customerPhone };
    const delivery = { location: deliveryLocation, notes: deliveryNotes || undefined };
    const preview = await previewProductCheckout({ storeId, items, customer, delivery, fulfillmentType: "DELIVERY" });
    const localAmount = rawCart.reduce((sum, line) => {
      const product = catalogMap.get(readString(line.id));
      return sum + (product?.price ?? 0) * normalizeCartQuantity(line.quantity);
    }, 0);
    const clientOrderId = createClientOrderId();
    const returnUrl = `${getCheckoutReturnUrl()}?reference=${encodeURIComponent(clientOrderId)}`;
    const cancelUrl = `${getCheckoutCancelUrl()}&reference=${encodeURIComponent(clientOrderId)}`;

    const checkout = await createProductCheckout({
      storeId,
      clientOrderId,
      sourceChannel: CLIENT_SOURCE_CHANNEL,
      sourceLabel: CLIENT_SOURCE_LABEL,
      items,
      customer,
      delivery,
      fulfillmentType: "DELIVERY",
      returnUrl,
      cancelUrl,
      preview,
      localAmount,
      metadata: {
        clientOrderId,
        channel: CLIENT_SOURCE_CHANNEL,
        source: "glittering_website_products_page",
        delivery,
        items,
      },
    });

    const checkoutUrl = readCheckoutUrl(checkout);
    if (!checkoutUrl) return NextResponse.json({ error: "Sedifex checkout was created but no payment URL was returned." }, { status: 502 });

    return NextResponse.json({
      ok: true,
      checkoutUrl,
      authorizationUrl: checkoutUrl,
      clientOrderId,
      reference: checkout.reference ?? checkout.paymentReference ?? checkout.payment_reference ?? clientOrderId,
      sedifexOrderId: readSedifexOrderId(checkout) || undefined,
      preview,
      customerTotal: getTrustedCustomerTotal(preview),
      checkout,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed.";
    console.error("product.checkout.create.failed", { message });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
