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
import { getSmsMetricsForStores } from "@/lib/smsMetrics";
import { getBusinessSnapshotForStores } from "@/lib/businessMetrics";

export const metadata: Metadata = buildPageMetadata({
  title: "Team Dashboard | Glittering Med Spa",
  description: "Overview dashboard for Glittering Med Spa team tools and weekly SMS metrics.",
  path: "/dashboard",
});

const quickLinks = [
  { href: "/login", label: "Booking Sync", description: "Enter and sync appointments." },
];

const leaderStoreIds = [
  "37mJqg20MjOriggaIaOOuahDsgj1",
  "2EeDEIDS1FO814KVfaaUVdv66bM2",
  "kT9QTWUkACMby6OwI2RO1bxG0WL2",
];

export default async function DashboardPage() {
  const session = await getTeamSession();

  if (!session) {
    redirect("/login");
  }

  const metrics = await getSmsMetricsForStores(leaderStoreIds).catch(() => ({
    stores: leaderStoreIds.map((storeId) => ({
      storeId,
      attemptedThisWeek: 0,
      sentThisWeek: 0,
      failedThisWeek: 0,
      bulkMessagingCredits: 0,
    })),
    totals: {
      attemptedThisWeek: 0,
      sentThisWeek: 0,
      failedThisWeek: 0,
      bulkMessagingCredits: 0,
    },
  }));

  const business = await getBusinessSnapshotForStores(leaderStoreIds).catch(() => ({
    stores: leaderStoreIds.map((storeId) => ({
      storeId,
      salesToday: 0,
      salesThisMonth: 0,
      salesAllTime: 0,
      ordersToday: 0,
      ordersThisMonth: 0,
      totalProducts: 0,
      inStockProducts: 0,
      outOfStockProducts: 0,
      lowStockProducts: 0,
    })),
    totals: {
      salesToday: 0,
      salesThisMonth: 0,
      salesAllTime: 0,
      ordersToday: 0,
      ordersThisMonth: 0,
      totalProducts: 0,
      inStockProducts: 0,
      outOfStockProducts: 0,
      lowStockProducts: 0,
    },
  }));

  const currency = new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 2,
  });

  return (
    <Container>
      <section className="py-12 sm:py-16">
        <SectionTitle
          title="Team Dashboard"
          subtitle={`Signed in as ${session.email ?? "Sedifex user"}. Aggregated metrics across ${leaderStoreIds.length} stores.`}
        />
        <TeamToolsNav active="dashboard" />
        <TeamSessionActions />

        <div className="mt-6 rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Per-store SMS metrics (this week)</p>
          <div className="mt-3 space-y-2">
            {metrics.stores.map((store) => (
              <div key={store.storeId} className="grid grid-cols-2 gap-2 rounded-xl border border-black/10 p-3 text-sm sm:grid-cols-5">
                <p className="font-semibold text-neutral-800 sm:col-span-1">{store.storeId}</p>
                <p className="text-neutral-700">Attempted: {store.attemptedThisWeek}</p>
                <p className="text-neutral-700">Sent: {store.sentThisWeek}</p>
                <p className="text-neutral-700">Failed: {store.failedThisWeek}</p>
                <p className="text-neutral-700">Credits: {store.bulkMessagingCredits}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Business snapshot (all selected stores)</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-black/10 p-3">
              <p className="text-xs uppercase text-neutral-500">Sales today</p>
              <p className="mt-1 text-xl font-semibold text-neutral-900">{currency.format(business.totals.salesToday)}</p>
            </div>
            <div className="rounded-xl border border-black/10 p-3">
              <p className="text-xs uppercase text-neutral-500">Sales this month</p>
              <p className="mt-1 text-xl font-semibold text-neutral-900">{currency.format(business.totals.salesThisMonth)}</p>
            </div>
            <div className="rounded-xl border border-black/10 p-3">
              <p className="text-xs uppercase text-neutral-500">Sales all-time</p>
              <p className="mt-1 text-xl font-semibold text-neutral-900">{currency.format(business.totals.salesAllTime)}</p>
            </div>
            <div className="rounded-xl border border-black/10 p-3">
              <p className="text-xs uppercase text-neutral-500">Orders today</p>
              <p className="mt-1 text-xl font-semibold text-neutral-900">{business.totals.ordersToday}</p>
            </div>
            <div className="rounded-xl border border-black/10 p-3">
              <p className="text-xs uppercase text-neutral-500">Orders this month</p>
              <p className="mt-1 text-xl font-semibold text-neutral-900">{business.totals.ordersThisMonth}</p>
            </div>
            <div className="rounded-xl border border-black/10 p-3">
              <p className="text-xs uppercase text-neutral-500">Total products</p>
              <p className="mt-1 text-xl font-semibold text-neutral-900">{business.totals.totalProducts}</p>
            </div>
            <div className="rounded-xl border border-black/10 p-3">
              <p className="text-xs uppercase text-neutral-500">In stock products</p>
              <p className="mt-1 text-xl font-semibold text-neutral-900">{business.totals.inStockProducts}</p>
            </div>
            <div className="rounded-xl border border-black/10 p-3">
              <p className="text-xs uppercase text-neutral-500">Out of stock products</p>
              <p className="mt-1 text-xl font-semibold text-neutral-900">{business.totals.outOfStockProducts}</p>
            </div>
            <div className="rounded-xl border border-black/10 p-3">
              <p className="text-xs uppercase text-neutral-500">Low stock products (≤ 5)</p>
              <p className="mt-1 text-xl font-semibold text-neutral-900">{business.totals.lowStockProducts}</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {business.stores.map((store) => (
              <div key={store.storeId} className="rounded-xl border border-black/10 p-3 text-sm">
                <p className="font-semibold text-neutral-900">{store.storeId}</p>
                <p className="mt-1 text-neutral-700">
                  Today: {currency.format(store.salesToday)} · Month: {currency.format(store.salesThisMonth)} · All-time: {currency.format(store.salesAllTime)}
                </p>
                <p className="text-neutral-700">
                  Orders today/month: {store.ordersToday}/{store.ordersThisMonth} · Products: {store.totalProducts} · In stock: {store.inStockProducts} · Out:
                  {store.outOfStockProducts} · Low stock: {store.lowStockProducts}
                </p>
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
