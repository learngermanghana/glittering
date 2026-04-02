export const PRODUCT_PLACEHOLDER_IMAGE = "/products/product.jpeg";

export type SedifexProductRecord = {
  id?: string;
  name?: unknown;
  price?: unknown;
  stockCount?: unknown;
  itemType?: unknown;
  imageUrl?: unknown;
  updatedAt?: unknown;
  storeId?: unknown;
  image?: unknown;
  quantity?: unknown;
};

export type DisplayProduct = {
  id?: string;
  name: string;
  price: number;
  quantity: number | null;
  image: string;
  isService: boolean;
};

export function normalizeProductImageUrl(imageUrl: unknown): string {
  if (typeof imageUrl !== "string") return PRODUCT_PLACEHOLDER_IMAGE;

  const trimmed = imageUrl.trim();
  if (!trimmed) return PRODUCT_PLACEHOLDER_IMAGE;
  if (trimmed.startsWith("/")) return trimmed;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") return trimmed;
    return PRODUCT_PLACEHOLDER_IMAGE;
  } catch {
    return PRODUCT_PLACEHOLDER_IMAGE;
  }
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toSafePrice(value: unknown): number {
  const parsed = toFiniteNumber(value);
  if (parsed === null || parsed < 0) return 0;
  return parsed;
}

function toStockQuantity(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = toFiniteNumber(value);
  if (parsed === null) return null;
  return Math.trunc(parsed);
}

function normalizeName(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

function normalizeItemType(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase();
}

export function isLikelyServiceProduct(name: string, price: number): boolean {
  const normalized = name.toLowerCase();
  return (
    price >= 300 ||
    normalized.includes("massage") ||
    normalized.includes("facial") ||
    normalized.includes("wax")
  );
}

export function mapSedifexProductToDisplay(record: SedifexProductRecord): DisplayProduct | null {
  const name = normalizeName(record.name);
  if (!name) return null;

  const price = toSafePrice(record.price);
  const quantity = toStockQuantity(record.stockCount ?? record.quantity);
  const itemType = normalizeItemType(record.itemType);
  const isService = itemType ? itemType === "service" : isLikelyServiceProduct(name, price);
  const image = normalizeProductImageUrl(record.imageUrl ?? record.image);

  return {
    id: typeof record.id === "string" ? record.id : undefined,
    name,
    price,
    quantity,
    image,
    isService,
  };
}

export function mapSedifexProductsToDisplay(records: SedifexProductRecord[]): DisplayProduct[] {
  return records
    .map((record) => mapSedifexProductToDisplay(record))
    .filter((record): record is DisplayProduct => record !== null);
}

export function mapFallbackCatalogProduct(id: string, product: { name: string; price: number; quantity: number | null; image: string }): DisplayProduct {
  return {
    id,
    name: product.name,
    price: toSafePrice(product.price),
    quantity: toStockQuantity(product.quantity),
    image: normalizeProductImageUrl(product.image),
    isService: isLikelyServiceProduct(product.name, product.price),
  };
}
