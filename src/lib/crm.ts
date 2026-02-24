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

type FirestoreCustomerRecord = Partial<Customer> & {
  name?: string;
  displayName?: string;
  customerName?: string;
};

function normalizeCustomer(record: FirestoreCustomerRecord): Customer {
  const fullName =
    record.fullName?.trim() ||
    record.name?.trim() ||
    record.displayName?.trim() ||
    record.customerName?.trim() ||
    "";

  const phone = record.phone === undefined || record.phone === null ? "" : String(record.phone).trim();

  return {
    ...record,
    fullName,
    phone,
  };
}

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
  const customers = await queryFirestoreCollectionByStoreId<FirestoreCustomerRecord>("customers", storeId);
  return customers.map(normalizeCustomer);
}
