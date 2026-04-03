import { fetchFirestoreCollection, queryFirestoreCollectionByStoreId } from "@/lib/firebase";
import { products as fallbackProducts } from "@/lib/site";
import { leaderStoreIds } from "@/lib/stores";

const PUBLIC_STORE_ID = process.env.NEXT_PUBLIC_SEDIFEX_STORE_ID ?? "37mJqg20MjOriggaIaOOuahDsgj1";

export type Product = {
  id?: string;
  name?: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  price?: number | string;
  stockCount?: number | string | null;
  quantity?: number | string | null;
  itemType?: string;
  updatedAt?: string;
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
    const preferredStoreIds = Array.from(new Set([PUBLIC_STORE_ID, ...leaderStoreIds].filter(Boolean)));

    if (preferredStoreIds.length) {
      const settled = await Promise.allSettled(
        preferredStoreIds.map((storeId) => queryFirestoreCollectionByStoreId<Product>("products", storeId))
      );
      const multiStoreData = settled
        .filter((entry): entry is PromiseFulfilledResult<Product[]> => entry.status === "fulfilled")
        .flatMap((entry) => entry.value);

      if (multiStoreData.length) {
        const seenKeys = new Set<string>();
        const uniqueProducts = multiStoreData.filter((item) => {
          const key = `${item.id ?? ""}|${item.storeId ?? ""}|${item.name ?? ""}|${item.price ?? ""}`;
          if (seenKeys.has(key)) return false;
          seenKeys.add(key);
          return true;
        });

        if (uniqueProducts.length) return uniqueProducts;
      }
    }

    const allProducts = await fetchFirestoreCollection<Product>("products");
    if (!allProducts.length) return fallbackProducts;

    const storeSpecificProducts = allProducts.filter((item) => preferredStoreIds.includes(item.storeId ?? ""));
    if (storeSpecificProducts.length) return storeSpecificProducts;

    const productsWithoutStore = allProducts.filter((item) => !item.storeId);
    if (productsWithoutStore.length) return productsWithoutStore;

    return allProducts;
  } catch {
    return fallbackProducts;
  }
}

export async function getCustomers(storeId: string) {
  const customers = await queryFirestoreCollectionByStoreId<FirestoreCustomerRecord>("customers", storeId);
  return customers.map(normalizeCustomer);
}
