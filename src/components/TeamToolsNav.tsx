import Link from "next/link";

type TeamToolsNavProps = {
  active: "booking" | "sms";
};

const linkBaseClass =
  "inline-flex min-w-28 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400";

export function TeamToolsNav({ active }: TeamToolsNavProps) {
  return (
    <nav aria-label="Team tools" className="mt-4 inline-flex flex-col gap-2 sm:flex-row sm:items-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-600">Quick navigation</p>
      <div className="inline-flex rounded-2xl border border-black/10 bg-white p-1 shadow-sm">
        <Link
          href="/login"
          aria-current={active === "booking" ? "page" : undefined}
          className={`${linkBaseClass} ${
            active === "booking" ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100"
          }`}
        >
          Booking Sync
        </Link>
        <Link
          href="/sms"
          aria-current={active === "sms" ? "page" : undefined}
          className={`${linkBaseClass} ${active === "sms" ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100"}`}
        >
          Bulk SMS
        </Link>
      </div>
    </nav>
  );
}
