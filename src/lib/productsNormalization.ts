export const PRODUCT_PLACEHOLDER_IMAGE = "/products/product.jpeg";

export type SedifexProductRecord = {
  id?: string;
  name?: unknown;
  description?: unknown;
  price?: unknown;
  stockCount?: unknown;
  itemType?: unknown;
  imageUrl?: unknown;
  imageUrl2?: unknown;
  imageUrl3?: unknown;
  secondaryImageUrl?: unknown;
  tertiaryImageUrl?: unknown;
  imageUrls?: unknown;
  photos?: unknown;
  images?: unknown;
  updatedAt?: unknown;
  storeId?: unknown;
  image?: unknown;
  image2?: unknown;
  image3?: unknown;
  quantity?: unknown;
};

export type DisplayProduct = {
  id?: string;
  name: string;
  description: string;
  price: number;
  quantity: number | null;
  image: string;
  images: string[];
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

function normalizeProductImageUrls(imageCandidates: unknown[]): string[] {
  const normalized = imageCandidates.map((candidate) => normalizeProductImageUrl(candidate));
  const unique = Array.from(new Set(normalized));
  const withoutPlaceholder = unique.filter((image) => image !== PRODUCT_PLACEHOLDER_IMAGE);
  const selected = withoutPlaceholder.slice(0, 3);
  return selected.length ? selected : [PRODUCT_PLACEHOLDER_IMAGE];
}

function readUnknownRecordValue(record: SedifexProductRecord, key: string): unknown {
  return (record as Record<string, unknown>)[key];
}

function collectSedifexImages(record: SedifexProductRecord): string[] {
  const listLikeCandidates: unknown[] = [];
  const listLikeKeys = ["imageUrls", "photos", "images"];
  for (const key of listLikeKeys) {
    const value = readUnknownRecordValue(record, key);
    if (Array.isArray(value)) listLikeCandidates.push(...value);
  }

  const directCandidates: unknown[] = [
    record.imageUrl,
    record.secondaryImageUrl,
    record.tertiaryImageUrl,
    record.imageUrl2,
    record.imageUrl3,
    record.image,
    record.image2,
    record.image3,
    readUnknownRecordValue(record, "photo1"),
    readUnknownRecordValue(record, "photo2"),
    readUnknownRecordValue(record, "photo3"),
    readUnknownRecordValue(record, "productImage1"),
    readUnknownRecordValue(record, "productImage2"),
    readUnknownRecordValue(record, "productImage3"),
  ];

  return normalizeProductImageUrls([...directCandidates, ...listLikeCandidates]);
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

function normalizeDescription(value: unknown): string {
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
  const images = collectSedifexImages(record);
  const image = images[0] ?? PRODUCT_PLACEHOLDER_IMAGE;

  return {
    id: typeof record.id === "string" ? record.id : undefined,
    name,
    description: normalizeDescription(record.description),
    price,
    quantity,
    image,
    images,
    isService,
  };
}

export function mapSedifexProductsToDisplay(records: SedifexProductRecord[]): DisplayProduct[] {
  return records
    .map((record) => mapSedifexProductToDisplay(record))
    .filter((record): record is DisplayProduct => record !== null);
}

export function mapFallbackCatalogProduct(id: string, product: { name: string; price: number; quantity: number | null; image: string }): DisplayProduct {
  const images = normalizeProductImageUrls([product.image]);
  return {
    id,
    name: product.name,
    description: "",
    price: toSafePrice(product.price),
    quantity: toStockQuantity(product.quantity),
    image: images[0] ?? PRODUCT_PLACEHOLDER_IMAGE,
    images,
    isService: isLikelyServiceProduct(product.name, product.price),
  };
}
