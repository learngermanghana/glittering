"use client";

import { useMemo, useState } from "react";
import { CAMPAIGN_HISTORY_KEY, type CampaignHistoryEntry } from "@/lib/campaignHistory";

function getWeekStart(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = (day + 6) % 7;
  copy.setDate(copy.getDate() - diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function DashboardSmsMetrics() {
  const [history] = useState<CampaignHistoryEntry[]>(() => {
    if (typeof window === "undefined") return [];

    const raw = window.localStorage.getItem(CAMPAIGN_HISTORY_KEY);
    if (!raw) return [];

    try {
      return JSON.parse(raw) as CampaignHistoryEntry[];
    } catch {
      return [];
    }
  });

  const { sentThisWeek, failedThisWeek } = useMemo(() => {
    const weekStart = getWeekStart(new Date());

    return history.reduce(
      (totals, entry) => {
        const created = new Date(entry.createdAt);
        if (Number.isNaN(created.getTime()) || created < weekStart) return totals;

        return {
          sentThisWeek: totals.sentThisWeek + entry.sent,
          failedThisWeek: totals.failedThisWeek + entry.failed,
        };
      },
      { sentThisWeek: 0, failedThisWeek: 0 }
    );
  }, [history]);

  return (
    <>
      <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">SMS sent this week</p>
        <p className="mt-2 text-2xl font-semibold text-neutral-900">{sentThisWeek}</p>
      </div>
      <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Failed sends this week</p>
        <p className="mt-2 text-2xl font-semibold text-neutral-900">{failedThisWeek}</p>
      </div>
    </>
  );
}
