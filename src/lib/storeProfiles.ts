import { fetchFirestoreDocument, queryFirestoreCollectionByStoreId } from "@/lib/firebase";
import { getBusinessSnapshotForStores } from "@/lib/businessMetrics";
import { getSmsMetricsForStores } from "@/lib/smsMetrics";

type StoreDoc = {
  id?: string;
  name?: string;
  displayName?: string;
  addressLine1?: string;
  addressLine2?: string | null;
  city?: string;
  country?: string;
  email?: string;
  phone?: string;
  ownerEmail?: string;
  paymentStatus?: string;
  contractStatus?: string;
  status?: string;
  bulkMessagingCredits?: number;
  promoTitle?: string;
  promoSummary?: string;
  promoStartDate?: string;
  promoEndDate?: string;
  updatedAt?: string;
};

type StoreProfile = {
  storeId: string;
  storeName: string;
  location: string;
  contact: {
    email: string | null;
    phone: string | null;
    ownerEmail: string | null;
  };
  statuses: {
    store: string;
    payment: string;
    contract: string;
  };
  personalization: {
    promoTitle: string | null;
    promoSummary: string | null;
    promoWindow: string | null;
  };
  counts: {
    customers: number;
    sales: number;
    products: number;
  };
  sms: {
    attemptedThisWeek: number;
    sentThisWeek: number;
    failedThisWeek: number;
    bulkMessagingCredits: number;
  };
  business: {
    salesToday: number;
    salesThisMonth: number;
    salesAllTime: number;
    ordersToday: number;
    ordersThisMonth: number;
    liveSalesCount: number;
    totalProducts: number;
    inStockProducts: number;
    outOfStockProducts: number;
    lowStockProducts: number;
  };
  insights: {
    customersWithDebt: number;
    outstandingDebtCents: number;
    topSellingItems: Array<{ name: string; quantity: number }>;
  };
};

function asText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function buildLocation(store: StoreDoc) {
  const lines = [asText(store.addressLine1), asText(store.addressLine2), asText(store.city), asText(store.country)].filter(Boolean);
  return lines.length ? lines.join(", ") : "Not set";
}

function formatPromoWindow(start?: string, end?: string) {
  if (!start && !end) return null;
  if (start && end) return `${start} → ${end}`;
  return start ?? end ?? null;
}

async function countCollectionByStoreId(collectionName: string, storeId: string) {
  try {
    const rows = await queryFirestoreCollectionByStoreId(collectionName, storeId);
    return rows.length;
  } catch {
    return 0;
  }
}

type StoreCustomerRecord = {
  debt?: {
    outstandingCents?: number | string | null;
  } | null;
};

type StoreSalesRecord = {
  name?: string;
  itemName?: string;
  productName?: string;
  serviceName?: string;
  product?: string;
  service?: string;
  items?: Array<{
    name?: string;
    itemName?: string;
    productName?: string;
    serviceName?: string;
    quantity?: number | string;
    qty?: number | string;
    count?: number | string;
  }>;
};

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, "").trim());
    if (Number.isFinite(parsed)) return parsed;
  }

  return 0;
}

function toPositiveInt(value: unknown) {
  const numeric = toNumber(value);
  if (numeric <= 0) return 0;
  return Math.floor(numeric);
}

function extractSaleItemNames(record: StoreSalesRecord) {
  const names = [
    asText(record.itemName),
    asText(record.productName),
    asText(record.serviceName),
    asText(record.product),
    asText(record.service),
    asText(record.name),
  ].filter(Boolean) as string[];

  const lineItemEntries = (record.items ?? []).flatMap((item) => {
    const itemName = asText(item.itemName) ?? asText(item.productName) ?? asText(item.serviceName) ?? asText(item.name);
    if (!itemName) return [];

    const quantity = toPositiveInt(item.quantity ?? item.qty ?? item.count);
    return [{ name: itemName, quantity: quantity > 0 ? quantity : 1 }];
  });

  const directEntries = names.map((name) => ({ name, quantity: 1 }));
  return [...lineItemEntries, ...directEntries];
}

export async function getStoreProfiles(storeIds: string[]): Promise<StoreProfile[]> {
  const uniqueStoreIds = Array.from(new Set(storeIds.filter(Boolean)));

  const [sms, business, stores, countsByStore] = await Promise.all([
    getSmsMetricsForStores(uniqueStoreIds),
    getBusinessSnapshotForStores(uniqueStoreIds),
    Promise.all(uniqueStoreIds.map((storeId) => fetchFirestoreDocument<StoreDoc>("stores", storeId).catch(() => null))),
    Promise.all(
      uniqueStoreIds.map(async (storeId) => ({
        storeId,
        customers: await countCollectionByStoreId("customers", storeId),
        sales: await countCollectionByStoreId("sales", storeId),
        products: await countCollectionByStoreId("products", storeId),
      }))
    ),
  ]);

  const [customersByStore, salesByStore] = await Promise.all([
    Promise.all(
      uniqueStoreIds.map(async (storeId) => {
        try {
          const rows = await queryFirestoreCollectionByStoreId<StoreCustomerRecord>("customers", storeId);
          return { storeId, rows };
        } catch {
          return { storeId, rows: [] as StoreCustomerRecord[] };
        }
      })
    ),
    Promise.all(
      uniqueStoreIds.map(async (storeId) => {
        try {
          const rows = await queryFirestoreCollectionByStoreId<StoreSalesRecord>("sales", storeId);
          return { storeId, rows };
        } catch {
          return { storeId, rows: [] as StoreSalesRecord[] };
        }
      })
    ),
  ]);

  const smsMap = new Map(sms.stores.map((entry) => [entry.storeId, entry]));
  const businessMap = new Map(business.stores.map((entry) => [entry.storeId, entry]));
  const countsMap = new Map(countsByStore.map((entry) => [entry.storeId, entry]));
  const customersMap = new Map(customersByStore.map((entry) => [entry.storeId, entry.rows]));
  const salesMap = new Map(salesByStore.map((entry) => [entry.storeId, entry.rows]));

  return uniqueStoreIds.map((storeId, index) => {
    const store = stores[index] ?? null;
    const smsForStore = smsMap.get(storeId);
    const businessForStore = businessMap.get(storeId);
    const counts = countsMap.get(storeId);
    const customerRows = customersMap.get(storeId) ?? [];
    const salesRows = salesMap.get(storeId) ?? [];
    const debtStats = customerRows.reduce(
      (acc, customer) => {
        const outstanding = toPositiveInt(customer.debt?.outstandingCents);
        if (outstanding <= 0) return acc;

        return {
          customersWithDebt: acc.customersWithDebt + 1,
          outstandingDebtCents: acc.outstandingDebtCents + outstanding,
        };
      },
      { customersWithDebt: 0, outstandingDebtCents: 0 }
    );

    const topSellingItems = Array.from(
      salesRows
        .flatMap(extractSaleItemNames)
        .reduce((map, item) => {
          const current = map.get(item.name) ?? 0;
          map.set(item.name, current + item.quantity);
          return map;
        }, new Map<string, number>())
        .entries()
    )
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((left, right) => right.quantity - left.quantity)
      .slice(0, 3);

    return {
      storeId,
      storeName: asText(store?.displayName) ?? asText(store?.name) ?? `Store ${storeId.slice(0, 6)}`,
      location: buildLocation(store ?? {}),
      contact: {
        email: asText(store?.email),
        phone: asText(store?.phone),
        ownerEmail: asText(store?.ownerEmail),
      },
      statuses: {
        store: asText(store?.status) ?? "unknown",
        payment: asText(store?.paymentStatus) ?? "unknown",
        contract: asText(store?.contractStatus) ?? "unknown",
      },
      personalization: {
        promoTitle: asText(store?.promoTitle),
        promoSummary: asText(store?.promoSummary),
        promoWindow: formatPromoWindow(asText(store?.promoStartDate) ?? undefined, asText(store?.promoEndDate) ?? undefined),
      },
      counts: {
        customers: counts?.customers ?? 0,
        sales: counts?.sales ?? 0,
        products: counts?.products ?? 0,
      },
      sms: {
        attemptedThisWeek: smsForStore?.attemptedThisWeek ?? 0,
        sentThisWeek: smsForStore?.sentThisWeek ?? 0,
        failedThisWeek: smsForStore?.failedThisWeek ?? 0,
        bulkMessagingCredits: smsForStore?.bulkMessagingCredits ?? 0,
      },
      business: {
        salesToday: businessForStore?.salesToday ?? 0,
        salesThisMonth: businessForStore?.salesThisMonth ?? 0,
        salesAllTime: businessForStore?.salesAllTime ?? 0,
        ordersToday: businessForStore?.ordersToday ?? 0,
        ordersThisMonth: businessForStore?.ordersThisMonth ?? 0,
        liveSalesCount: businessForStore?.ordersToday ?? 0,
        totalProducts: businessForStore?.totalProducts ?? 0,
        inStockProducts: businessForStore?.inStockProducts ?? 0,
        outOfStockProducts: businessForStore?.outOfStockProducts ?? 0,
        lowStockProducts: businessForStore?.lowStockProducts ?? 0,
      },
      insights: {
        customersWithDebt: debtStats.customersWithDebt,
        outstandingDebtCents: debtStats.outstandingDebtCents,
        topSellingItems,
      },
    };
  });
}

export async function getStoreProfile(storeId: string) {
  const [profile] = await getStoreProfiles([storeId]);
  return profile ?? null;
}
