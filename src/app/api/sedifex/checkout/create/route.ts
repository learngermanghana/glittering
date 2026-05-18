import { NextResponse } from "next/server";
import { getProductsCatalogData } from "@/lib/products";
import {
  createCheckoutReference,
  createSedifexCheckout,
  previewSedifexCheckout,
  readCheckoutUrl,
  type CheckoutItem,
} from "@/lib/sedifexCheckout";

const STORE_ID = "37mJqg20MjOriggaIaOOuahDsgj1";

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
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function fallbackEmailFromPhone(phone: string) {
  const digits = phone.replace(/[^\d]/g, "");
  return `${digits || "buyer"}@glittering.local`;
}

function normalizeCartQuantity(value: unknown) {
  const quantity = Math.floor(Number(value));
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
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

    if (!rawCart.length) return NextResponse.json({ error: "Cart is empty. Add at least one product." }, { status: 400 });
    if (!customerName) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    if (!isValidPhone(customerPhone)) return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
    if (!isValidEmail(customerEmail)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    if (!deliveryLocation) return NextResponse.json({ error: "Please enter a delivery or pickup location." }, { status: 400 });

    const catalog = await getProductsCatalogData();
    const catalogMap = new Map(catalog.map((product) => [String(product.id ?? ""), product]));

    const items: CheckoutItem[] = rawCart.map((line) => {
      const id = readString(line.id);
      const quantity = normalizeCartQuantity(line.quantity);
      if (!id) throw new Error("A cart item is missing its product ID.");
      if (!quantity) throw new Error("Cart quantity must be greater than 0.");

      const catalogProduct = catalogMap.get(id);
      if (!catalogProduct) throw new Error(`Product not found: ${id}`);
      if (catalogProduct.quantity !== null && catalogProduct.quantity < quantity) {
        throw new Error(`Only ${catalogProduct.quantity} left for ${catalogProduct.name}.`);
      }
      if (!catalogProduct.price || catalogProduct.price <= 0) {
        throw new Error(`${catalogProduct.name} has no valid price.`);
      }

      return {
        productId: id,
        quantity,
        merchantId: STORE_ID,
        type: "PRODUCT",
        itemName: catalogProduct.name,
        productName: catalogProduct.name,
      };
    });

    const reference = createCheckoutReference(STORE_ID);
    const pricingSnapshot = await previewSedifexCheckout(STORE_ID, items);
    const checkout = await createSedifexCheckout(STORE_ID, items, {
      reference,
      pricingSnapshot,
      customer: {
        name: customerName,
        email: customerEmail || fallbackEmailFromPhone(customerPhone),
        phone: customerPhone,
      },
      attributes: {
        source: "glittering_website_products_page",
        orderType: "product_order",
        deliveryLocation,
        deliveryNotes: deliveryNotes || undefined,
        customerName,
        customerPhone,
        customerEmail: customerEmail || undefined,
        paymentCollectionMode: "online_checkout",
        paymentStatus: "pending",
        orderStatus: "pending_payment",
        syncStatus: "pending",
        syncRequestedAt: new Date().toISOString(),
      },
      metadata: {
        source: "glittering_website_products_page",
        orderType: "product_order",
        delivery: { location: deliveryLocation, notes: deliveryNotes || undefined },
        customer: { name: customerName, email: customerEmail || undefined, phone: customerPhone },
      },
    });

    const checkoutUrl = readCheckoutUrl(checkout);
    if (!checkoutUrl) {
      return NextResponse.json({ error: "Sedifex checkout was created but no checkout URL was returned." }, { status: 502 });
    }

    return NextResponse.json({
      ok: true,
      checkoutUrl,
      authorizationUrl: checkoutUrl,
      reference,
      pricingSnapshot,
      checkout,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed.";
    console.error("product.checkout.create.failed", { message });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
