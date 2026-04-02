import { productCatalog } from "@/lib/productCatalog";
import { mapFallbackCatalogProduct } from "@/lib/productsNormalization";

export {
  PRODUCT_PLACEHOLDER_IMAGE,
  isLikelyServiceProduct,
  mapSedifexProductToDisplay,
  mapSedifexProductsToDisplay,
  normalizeProductImageUrl,
  type DisplayProduct,
  type SedifexProductRecord,
} from "@/lib/productsNormalization";

export function getStaticCatalogFallbackProducts() {
  return Object.entries(productCatalog).map(([id, product]) => mapFallbackCatalogProduct(id, product));
}
