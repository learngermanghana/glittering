import { queryFirestoreCollectionByStoreId } from "@/lib/firebase";
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

export async function getProducts() {
  try {
    if (!PUBLIC_STORE_ID) return fallbackProducts;

    const data = await queryFirestoreCollectionByStoreId<Product>("products", PUBLIC_STORE_ID);
    if (!data.length) return fallbackProducts;

    return data.filter((item) => item.name && item.description && item.image);
  } catch {
    return fallbackProducts;
  }
}

export async function getCustomers(storeId: string) {
  return queryFirestoreCollectionByStoreId<Customer>("customers", storeId);
}
