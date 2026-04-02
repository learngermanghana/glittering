type Props = {
  attemptedThisWeek: number;
  sentThisWeek: number;
  failedThisWeek: number;
  bulkMessagingCredits: number;
};

export function DashboardSmsMetrics({ attemptedThisWeek, sentThisWeek, failedThisWeek, bulkMessagingCredits }: Props) {
  return (
    <>
      <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">SMS attempted this week</p>
        <p className="mt-2 text-2xl font-semibold text-neutral-900">{attemptedThisWeek}</p>
      </div>
      <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">SMS sent this week</p>
        <p className="mt-2 text-2xl font-semibold text-neutral-900">{sentThisWeek}</p>
      </div>
      <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Failed sends this week</p>
        <p className="mt-2 text-2xl font-semibold text-neutral-900">{failedThisWeek}</p>
      </div>
      <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">SMS credits balance</p>
        <p className="mt-2 text-2xl font-semibold text-neutral-900">{bulkMessagingCredits}</p>
      </div>
    </>
  );
}
