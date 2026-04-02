import { getProducts } from "@/lib/crm";
import {
  getStaticCatalogFallbackProducts,
  mapSedifexProductsToDisplay,
  type DisplayProduct,
  type SedifexProductRecord,
} from "@/lib/productsData";

export async function getProductsCatalogData(): Promise<DisplayProduct[]> {
  try {
    const records = (await getProducts()) as SedifexProductRecord[];
    const mappedProducts = mapSedifexProductsToDisplay(records).filter((product) => !product.isService);

    if (mappedProducts.length) return mappedProducts;
  } catch {
    // no-op and use static fallback below
  }

  return getStaticCatalogFallbackProducts().filter((product) => !product.isService);
}
