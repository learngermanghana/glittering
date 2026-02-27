import Link from "next/link";

type TeamTab = "dashboard" | "booking" | "sms" | "campaigns" | "calendar";

type TeamToolsNavProps = {
  active: TeamTab;
};

const links: Array<{ href: string; label: string; key: TeamTab }> = [
  { href: "/dashboard", label: "Dashboard", key: "dashboard" },
  { href: "/login", label: "Booking Sync", key: "booking" },
  { href: "/sms", label: "Bulk SMS", key: "sms" },
  { href: "/campaigns", label: "Campaigns", key: "campaigns" },
  { href: "/calendar", label: "Calendar", key: "calendar" },
];

const linkBaseClass =
  "inline-flex min-w-28 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400";

export function TeamToolsNav({ active }: TeamToolsNavProps) {
  return (
    <nav aria-label="Team tools" className="mt-4 inline-flex flex-col gap-2 sm:flex-row sm:items-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-600">Quick navigation</p>
      <div className="inline-flex flex-wrap rounded-2xl border border-black/10 bg-white p-1 shadow-sm">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active === link.key ? "page" : undefined}
            className={`${linkBaseClass} ${
              active === link.key ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
