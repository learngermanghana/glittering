import type { DisplayProduct } from "@/lib/productsData";
import { toSlug } from "@/lib/slugs";

const FALLBACK_PRODUCT_ID_PREFIX = "product";

function normalizeId(id: string | undefined): string {
  if (!id) return "";
  return id.trim();
}

export function getProductSlug(product: Pick<DisplayProduct, "id" | "name">): string {
  const nameSlug = toSlug(product.name) || "item";
  const stableId = normalizeId(product.id);
  if (!stableId) return nameSlug;
  return `${FALLBACK_PRODUCT_ID_PREFIX}-${toSlug(stableId)}-${nameSlug}`;
}

export function findProductBySlug(products: DisplayProduct[], slug: string): DisplayProduct | undefined {
  return products.find((product) => getProductSlug(product) === slug);
}

export function buildProductMetaDescription(product: Pick<DisplayProduct, "description" | "name" | "price">): string {
  const normalizedDescription = product.description.trim();
  const baseDescription = normalizedDescription || `${product.name} available at Glittering Med Spa.`;
  const withPrice = `${baseDescription} Price: GHS ${product.price.toFixed(2)}.`;
  return withPrice.length <= 160 ? withPrice : `${withPrice.slice(0, 157).trimEnd()}...`;
}
