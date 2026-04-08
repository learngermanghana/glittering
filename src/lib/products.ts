import { getProducts } from "@/lib/crm";
import {
  getStaticCatalogFallbackProducts,
  mapSedifexProductsToDisplay,
  type DisplayProduct,
  type SedifexProductRecord,
} from "@/lib/productsData";

const PRODUCTS_PAGE_STORE_ID = "37mJqg20MjOriggaIaOOuahDsgj1";

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function isStoreProductRecord(record: SedifexProductRecord): boolean {
  const storeId = typeof record.storeId === "string" ? record.storeId.trim() : "";
  const itemType = normalizeText(record.itemType);

  return storeId === PRODUCTS_PAGE_STORE_ID && itemType === "product";
}

export async function getProductsCatalogData(): Promise<DisplayProduct[]> {
  try {
    const records = (await getProducts()) as SedifexProductRecord[];
    const storeProducts = records.filter((record) => isStoreProductRecord(record));
    const mappedProducts = mapSedifexProductsToDisplay(storeProducts).filter((product) => !product.isService);

    if (mappedProducts.length) return mappedProducts;
  } catch {
    // no-op and use static fallback below
  }

  return getStaticCatalogFallbackProducts().filter((product) => !product.isService);
}
