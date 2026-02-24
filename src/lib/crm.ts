import { fetchFirestoreCollection, queryFirestoreCollectionByStoreId } from "@/lib/firebase";
import { products as fallbackProducts } from "@/lib/site";

const PUBLIC_STORE_ID = process.env.NEXT_PUBLIC_SEDIFEX_STORE_ID ?? "37mJqg20MjOriggaIaOOuahDsgj1";

export type Product = {
  id?: string;
  name: string;
  description: string;
  image: string;
  price?: number;
  storeId?: string;
};

export type Customer = {
  id?: string;
  fullName: string;
  phone: string;
  email?: string;
  marketingOptIn?: boolean;
  storeId?: string;
};

export async function getProducts(): Promise<Product[]> {
  try {
    if (!PUBLIC_STORE_ID) return fallbackProducts;

    const data = await queryFirestoreCollectionByStoreId<Product>("products", PUBLIC_STORE_ID);

    const filteredStoreProducts = data.filter((item) => item.name && item.description && item.image);
    if (filteredStoreProducts.length) return filteredStoreProducts;

    const allProducts = await fetchFirestoreCollection<Product>("products");
    const validProducts = allProducts.filter((item) => item.name && item.description && item.image);

    if (!validProducts.length) return fallbackProducts;

    const storeSpecificProducts = validProducts.filter((item) => item.storeId === PUBLIC_STORE_ID);
    if (storeSpecificProducts.length) return storeSpecificProducts;

    const productsWithoutStore = validProducts.filter((item) => !item.storeId);
    if (productsWithoutStore.length) return productsWithoutStore;

    return validProducts;
  } catch {
    return fallbackProducts;
  }
}

export async function getCustomers(storeId: string) {
  return queryFirestoreCollectionByStoreId<Customer>("customers", storeId);
}
