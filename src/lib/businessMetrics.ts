import { queryFirestoreCollectionByStoreId } from "@/lib/firebase";
import { Product } from "@/lib/crm";

type SalesRecord = {
  id?: string;
  storeId?: string;
  createdAt?: string;
  soldAt?: string;
  date?: string;
  updatedAt?: string;
  amount?: number | string;
  total?: number | string;
  totalAmount?: number | string;
  grandTotal?: number | string;
  subtotal?: number | string;
};

type StoreBusinessSnapshot = {
  storeId: string;
  salesToday: number;
  salesThisMonth: number;
  salesAllTime: number;
  ordersToday: number;
  ordersThisMonth: number;
  totalProducts: number;
  inStockProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
};

type AggregateSnapshot = Omit<StoreBusinessSnapshot, "storeId">;

const SALES_COLLECTION_CANDIDATES = ["sales", "orders", "transactions"];

function toValidNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const numeric = Number(value.replace(/,/g, "").trim());
    if (Number.isFinite(numeric)) return numeric;
  }

  return 0;
}

function toRecordDate(record: SalesRecord) {
  const value = record.soldAt ?? record.createdAt ?? record.date ?? record.updatedAt;
  if (!value) return null;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function amountFromRecord(record: SalesRecord) {
  const candidates = [record.amount, record.total, record.totalAmount, record.grandTotal, record.subtotal];
  return candidates.reduce((best, current) => {
    const candidate = toValidNumber(current);
    return candidate > best ? candidate : best;
  }, 0);
}

function isSameUtcDay(left: Date, right: Date) {
  return (
    left.getUTCFullYear() === right.getUTCFullYear() &&
    left.getUTCMonth() === right.getUTCMonth() &&
    left.getUTCDate() === right.getUTCDate()
  );
}

function isSameUtcMonth(left: Date, right: Date) {
  return left.getUTCFullYear() === right.getUTCFullYear() && left.getUTCMonth() === right.getUTCMonth();
}

async function getStoreSalesRecords(storeId: string) {
  for (const collectionName of SALES_COLLECTION_CANDIDATES) {
    try {
      const rows = await queryFirestoreCollectionByStoreId<SalesRecord>(collectionName, storeId);
      if (rows.length) return rows;
    } catch {
      // try next candidate collection
    }
  }

  return [] as SalesRecord[];
}

async function getStoreProducts(storeId: string) {
  try {
    return await queryFirestoreCollectionByStoreId<Product>("products", storeId);
  } catch {
    return [] as Product[];
  }
}

function buildStoreSnapshot(storeId: string, salesRecords: SalesRecord[], products: Product[], now: Date): StoreBusinessSnapshot {
  const salesTotals = salesRecords.reduce(
    (totals, record) => {
      const amount = amountFromRecord(record);
      const recordDate = toRecordDate(record);

      if (!recordDate) {
        return totals;
      }

      const isToday = isSameUtcDay(recordDate, now);
      const isThisMonth = isSameUtcMonth(recordDate, now);

      return {
        salesToday: totals.salesToday + (isToday ? amount : 0),
        salesThisMonth: totals.salesThisMonth + (isThisMonth ? amount : 0),
        salesAllTime: totals.salesAllTime + amount,
        ordersToday: totals.ordersToday + (isToday ? 1 : 0),
        ordersThisMonth: totals.ordersThisMonth + (isThisMonth ? 1 : 0),
      };
    },
    { salesToday: 0, salesThisMonth: 0, salesAllTime: 0, ordersToday: 0, ordersThisMonth: 0 }
  );

  const productTotals = products.reduce(
    (totals, product) => {
      const quantity = toValidNumber(product.quantity ?? product.stockCount ?? 0);
      const isService = product.itemType === "service";

      if (isService) return totals;

      return {
        totalProducts: totals.totalProducts + 1,
        inStockProducts: totals.inStockProducts + (quantity > 0 ? 1 : 0),
        outOfStockProducts: totals.outOfStockProducts + (quantity <= 0 ? 1 : 0),
        lowStockProducts: totals.lowStockProducts + (quantity > 0 && quantity <= 5 ? 1 : 0),
      };
    },
    { totalProducts: 0, inStockProducts: 0, outOfStockProducts: 0, lowStockProducts: 0 }
  );

  return {
    storeId,
    ...salesTotals,
    ...productTotals,
  };
}

export async function getBusinessSnapshotForStores(storeIds: string[]) {
  const uniqueStoreIds = Array.from(new Set(storeIds.filter(Boolean)));
  const now = new Date();

  const stores = await Promise.all(
    uniqueStoreIds.map(async (storeId) => {
      const [salesRecords, products] = await Promise.all([getStoreSalesRecords(storeId), getStoreProducts(storeId)]);
      return buildStoreSnapshot(storeId, salesRecords, products, now);
    })
  );

  const totals = stores.reduce<AggregateSnapshot>(
    (acc, store) => ({
      salesToday: acc.salesToday + store.salesToday,
      salesThisMonth: acc.salesThisMonth + store.salesThisMonth,
      salesAllTime: acc.salesAllTime + store.salesAllTime,
      ordersToday: acc.ordersToday + store.ordersToday,
      ordersThisMonth: acc.ordersThisMonth + store.ordersThisMonth,
      totalProducts: acc.totalProducts + store.totalProducts,
      inStockProducts: acc.inStockProducts + store.inStockProducts,
      outOfStockProducts: acc.outOfStockProducts + store.outOfStockProducts,
      lowStockProducts: acc.lowStockProducts + store.lowStockProducts,
    }),
    {
      salesToday: 0,
      salesThisMonth: 0,
      salesAllTime: 0,
      ordersToday: 0,
      ordersThisMonth: 0,
      totalProducts: 0,
      inStockProducts: 0,
      outOfStockProducts: 0,
      lowStockProducts: 0,
    }
  );

  return {
    stores,
    totals,
  };
}
