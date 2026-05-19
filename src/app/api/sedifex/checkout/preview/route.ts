import { NextResponse } from "next/server";
import { getProductsCatalogData } from "@/lib/products";
import {
  getPrimarySedifexStoreId,
  getTrustedCustomerTotal,
  normalizeSedifexItemId,
  previewProductCheckout,
  type ProductCheckoutItem,
} from "@/lib/sedifexCheckout";

type CheckoutPreviewBody = {
  cart?: Array<{ id?: string; quantity?: number }>;
  customer?: { name?: string; email?: string; phone?: string };
  delivery?: { location?: string; notes?: string };
};

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return !value || (digits.length >= 9 && digits.length <= 15);
}

function isValidEmail(value: string) {
  return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeCartQuantity(value: unknown) {
  const quantity = Math.floor(Number(value));
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutPreviewBody;
    const rawCart = Array.isArray(body.cart) ? body.cart : [];
    const customerName = readString(body.customer?.name);
    const customerPhone = readString(body.customer?.phone);
    const customerEmail = readString(body.customer?.email).toLowerCase();
    const deliveryLocation = readString(body.delivery?.location);
    const deliveryNotes = readString(body.delivery?.notes);
    const storeId = getPrimarySedifexStoreId();

    if (!rawCart.length) return NextResponse.json({ error: "Cart is empty. Add at least one product." }, { status: 400 });
    if (!isValidPhone(customerPhone)) return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
    if (!isValidEmail(customerEmail)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });

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

    const preview = await previewProductCheckout({
      storeId,
      items,
      customer: {
        name: customerName || undefined,
        email: customerEmail || undefined,
        phone: customerPhone || undefined,
      },
      delivery: {
        location: deliveryLocation || undefined,
        notes: deliveryNotes || undefined,
      },
      fulfillmentType: "DELIVERY",
    });

    return NextResponse.json({
      ok: true,
      preview,
      trustedTotal: getTrustedCustomerTotal(preview),
      items,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout preview failed.";
    console.error("product.checkout.preview.failed", { message });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
