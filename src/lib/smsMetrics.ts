import { queryFirestoreCollectionByStoreId } from "@/lib/firebase";

type SmsCampaignRecord = {
  createdAt?: string;
  sent?: number;
  failed?: number;
};

const SMS_COLLECTION_CANDIDATES = ["smsCampaigns", "campaigns", "bulkSmsCampaigns"];

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

  for (const collectionName of SMS_COLLECTION_CANDIDATES) {
    try {
      const campaigns = await queryFirestoreCollectionByStoreId<SmsCampaignRecord>(collectionName, storeId);

      if (!campaigns.length) {
        continue;
      }

      return campaigns.reduce(
        (totals, entry) => {
          const created = entry.createdAt ? new Date(entry.createdAt) : null;
          if (!created || Number.isNaN(created.getTime()) || created < weekStart) {
            return totals;
          }

          return {
            sentThisWeek: totals.sentThisWeek + toValidNumber(entry.sent),
            failedThisWeek: totals.failedThisWeek + toValidNumber(entry.failed),
          };
        },
        { sentThisWeek: 0, failedThisWeek: 0 }
      );
    } catch {
      // Try the next candidate collection if this one does not exist or cannot be queried.
      continue;
    }
  }

  return { sentThisWeek: 0, failedThisWeek: 0 };
}
