import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { TeamSessionActions } from "@/components/TeamSessionActions";
import { TeamToolsNav } from "@/components/TeamToolsNav";
import { SeoInternalLinks } from "@/components/SeoInternalLinks";
import { buildPageMetadata } from "@/lib/seo";
import { getTeamSession } from "@/lib/auth";
import { getStoreProfiles } from "@/lib/storeProfiles";
import { leaderStoreIds } from "@/lib/stores";

export const metadata: Metadata = buildPageMetadata({
  title: "Team Dashboard | Glittering Med Spa",
  description: "Overview dashboard for Glittering Med Spa stores, SMS metrics, and sales performance.",
  path: "/dashboard",
});

const quickLinks = [
  { href: "/login", label: "Booking Sync", description: "Enter and sync appointments." },
  { href: "/calendar", label: "Booking Calendar", description: "View upcoming events from the booking CSV feed." },
];

export default async function DashboardPage() {
  const session = await getTeamSession();

  if (!session) {
    redirect("/login");
  }

  const stores = await getStoreProfiles(leaderStoreIds).catch(() => []);

  const currency = new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 2,
  });

  const totals = stores.reduce(
    (acc, store) => {
      acc.customers += store.counts.customers;
      acc.salesRecords += store.counts.sales;
      acc.products += store.counts.products;
      acc.smsCredits += store.sms.bulkMessagingCredits;
      acc.smsThisWeek += store.sms.sentThisWeek;
      acc.salesThisMonth += store.business.salesThisMonth;
      return acc;
    },
    {
      customers: 0,
      salesRecords: 0,
      products: 0,
      smsCredits: 0,
      smsThisWeek: 0,
      salesThisMonth: 0,
    },
  );

  return (
    <Container>
      <section className="py-8 sm:py-12">
        <SectionTitle
          title="Team Dashboard"
          subtitle={`Signed in as ${session.email ?? "Sedifex user"}. Choose a store to view full customers, sales, and products context.`}
        />
        <TeamToolsNav active="dashboard" />
        <TeamSessionActions />

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-rose-200/70 bg-gradient-to-br from-rose-100 to-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-600">Total customers</p>
            <p className="mt-3 text-3xl font-semibold text-neutral-900">{totals.customers.toLocaleString("en-US")}</p>
          </div>
          <div className="rounded-3xl border border-brand-200/70 bg-gradient-to-br from-brand-100 to-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-600">Sales this month</p>
            <p className="mt-3 text-3xl font-semibold text-neutral-900">{currency.format(totals.salesThisMonth)}</p>
          </div>
          <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-600">SMS sent this week</p>
            <p className="mt-3 text-3xl font-semibold text-neutral-900">{totals.smsThisWeek.toLocaleString("en-US")}</p>
          </div>
          <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-600">Products tracked</p>
            <p className="mt-3 text-3xl font-semibold text-neutral-900">{totals.products.toLocaleString("en-US")}</p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Store switcher</p>
            <p className="text-xs text-neutral-500">
              {stores.length} stores · {totals.salesRecords.toLocaleString("en-US")} sales records · {totals.smsCredits} SMS credits
            </p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {stores.map((store) => (
              <div
                key={store.storeId}
                className="rounded-2xl border border-black/10 bg-neutral-50/60 p-4 text-sm transition hover:-translate-y-0.5 hover:border-black/20 hover:bg-white hover:shadow-sm"
              >
                <p className="font-semibold text-neutral-900">{store.storeName}</p>
                <p className="mt-1 text-neutral-600">{store.location}</p>
                <p className="mt-2 text-neutral-700">
                  Customers: {store.counts.customers} · Sales records: {store.counts.sales} · Products: {store.counts.products}
                </p>
                <p className="text-neutral-700">Credits: {store.sms.bulkMessagingCredits} · SMS sent this week: {store.sms.sentThisWeek}</p>
                <p className="mt-1 text-sm font-semibold text-neutral-800">
                  Sales this month: {currency.format(store.business.salesThisMonth)}
                </p>
                <Link
                  href={`/dashboard/stores/${store.storeId}`}
                  className="mt-3 inline-flex rounded-xl border border-black/15 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 transition hover:border-black/30 hover:bg-neutral-100"
                >
                  Select store
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition hover:border-black/20 hover:shadow"
            >
              <p className="text-sm font-semibold text-neutral-900">{link.label}</p>
              <p className="mt-1 text-sm text-neutral-600">{link.description}</p>
            </Link>
          ))}
        </div>

        <SeoInternalLinks />
      </section>
    </Container>
  );
}
