import { fetchFirestoreDocument, queryFirestoreSubcollection } from "@/lib/firebase";

type BulkMessageRunRecord = {
  createdAt?: string;
  attempted?: number;
  sent?: number;
  failed?: number;
};

type StoreDoc = {
  bulkMessagingCredits?: number;
};

function getWeekStart(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = (day + 6) % 7;
  copy.setDate(copy.getDate() - diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function toValidNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export async function getSmsMetricsForStore(storeId: string) {
  const weekStart = getWeekStart(new Date());
  const [runs, store] = await Promise.all([
    queryFirestoreSubcollection<BulkMessageRunRecord>(`stores/${storeId}`, "bulkMessageRuns", {
      orderBy: [{ fieldPath: "createdAt", direction: "DESCENDING" }],
      limit: 100,
    }).catch(() => []),
    fetchFirestoreDocument<StoreDoc>("stores", storeId).catch(() => null),
  ]);

  const weeklyTotals = runs.reduce(
    (totals, run) => {
      const created = run.createdAt ? new Date(run.createdAt) : null;
      if (!created || Number.isNaN(created.getTime()) || created < weekStart) {
        return totals;
      }

      return {
        attemptedThisWeek: totals.attemptedThisWeek + toValidNumber(run.attempted),
        sentThisWeek: totals.sentThisWeek + toValidNumber(run.sent),
        failedThisWeek: totals.failedThisWeek + toValidNumber(run.failed),
      };
    },
    { attemptedThisWeek: 0, sentThisWeek: 0, failedThisWeek: 0 }
  );

  return {
    ...weeklyTotals,
    bulkMessagingCredits: Math.max(0, toValidNumber(store?.bulkMessagingCredits)),
  };
}

export async function getSmsMetricsForStores(storeIds: string[]) {
  const uniqueStoreIds = Array.from(new Set(storeIds.filter(Boolean)));

  const metricsByStore = await Promise.all(
    uniqueStoreIds.map(async (storeId) => {
      const metrics = await getSmsMetricsForStore(storeId).catch(() => ({
        attemptedThisWeek: 0,
        sentThisWeek: 0,
        failedThisWeek: 0,
        bulkMessagingCredits: 0,
      }));

      return {
        storeId,
        ...metrics,
      };
    })
  );

  const totals = metricsByStore.reduce(
    (acc, store) => ({
      attemptedThisWeek: acc.attemptedThisWeek + store.attemptedThisWeek,
      sentThisWeek: acc.sentThisWeek + store.sentThisWeek,
      failedThisWeek: acc.failedThisWeek + store.failedThisWeek,
      bulkMessagingCredits: acc.bulkMessagingCredits + store.bulkMessagingCredits,
    }),
    { attemptedThisWeek: 0, sentThisWeek: 0, failedThisWeek: 0, bulkMessagingCredits: 0 }
  );

  return {
    stores: metricsByStore,
    totals,
  };
}
