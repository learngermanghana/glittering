type Props = {
  sentThisWeek: number;
  failedThisWeek: number;
};

export function DashboardSmsMetrics({ sentThisWeek, failedThisWeek }: Props) {

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
