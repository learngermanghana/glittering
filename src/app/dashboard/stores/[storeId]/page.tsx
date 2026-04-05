import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { TeamSessionActions } from "@/components/TeamSessionActions";
import { TeamToolsNav } from "@/components/TeamToolsNav";
import { getTeamSession } from "@/lib/auth";
import { getStoreProfile } from "@/lib/storeProfiles";

export const metadata: Metadata = {
  title: "Store Overview | Glittering Med Spa",
  description: "Per-store details for customers, sales, products, and SMS performance.",
};

type StoreOverviewPageProps = {
  params: Promise<{ storeId: string }>;
};

export default async function StoreOverviewPage({ params }: StoreOverviewPageProps) {
  const session = await getTeamSession();
  if (!session) {
    redirect("/login");
  }

  const { storeId } = await params;
  const store = await getStoreProfile(storeId);

  if (!store) {
    notFound();
  }

  const currency = new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 2,
  });

  return (
    <Container>
      <section className="py-12 sm:py-16">
        <SectionTitle
          title={`${store.storeName} · Store Overview`}
          subtitle={`Personalized store profile with rich data from /customers, /sales, and /products for ${store.storeId}.`}
        />
        <TeamToolsNav active="dashboard" />
        <TeamSessionActions />

        <div className="mt-5 rounded-2xl border border-brand-200 bg-brand-50/70 p-4 text-sm text-brand-950">
          <p className="font-semibold">You are now viewing this store: {store.storeName}.</p>
          <p className="mt-1 text-brand-900">All numbers below are filtered to this branch only.</p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Identity & contact</p>
            <p className="mt-2 text-sm font-semibold text-neutral-900">{store.storeName}</p>
            <p className="text-sm text-neutral-700">{store.location}</p>
            <p className="mt-2 text-sm text-neutral-700">Email: {store.contact.email ?? "Not set"}</p>
            <p className="text-sm text-neutral-700">Phone: {store.contact.phone ?? "Not set"}</p>
            <p className="text-sm text-neutral-700">Owner: {store.contact.ownerEmail ?? "Not set"}</p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Status</p>
            <p className="mt-2 text-sm text-neutral-700">Store status: {store.statuses.store}</p>
            <p className="text-sm text-neutral-700">Payment status: {store.statuses.payment}</p>
            <p className="text-sm text-neutral-700">Contract status: {store.statuses.contract}</p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Personalization</p>
            <p className="mt-2 text-sm text-neutral-700">Promo title: {store.personalization.promoTitle ?? "Not set"}</p>
            <p className="text-sm text-neutral-700">Promo summary: {store.personalization.promoSummary ?? "Not set"}</p>
            <p className="text-sm text-neutral-700">Promo window: {store.personalization.promoWindow ?? "Not set"}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Data paths</p>
          <p className="mt-2 text-sm text-neutral-700">/customers/{store.storeId}</p>
          <p className="text-sm text-neutral-700">/sales (filtered by storeId)</p>
          <p className="text-sm text-neutral-700">/products (filtered by storeId)</p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Metric label="Customers" value={store.counts.customers} />
          <Metric label="Sales records" value={store.counts.sales} />
          <Metric label="Products" value={store.counts.products} />
          <Metric label="Sales today" value={currency.format(store.business.salesToday)} />
          <Metric label="Sales this month" value={currency.format(store.business.salesThisMonth)} />
          <Metric label="Sales all time" value={currency.format(store.business.salesAllTime)} />
          <Metric label="Live sales count (today)" value={store.business.liveSalesCount} />
          <Metric label="Orders today" value={store.business.ordersToday} />
          <Metric label="Orders this month" value={store.business.ordersThisMonth} />
          <Metric label="SMS credits" value={store.sms.bulkMessagingCredits} />
          <Metric label="Customers with debt" value={store.insights.customersWithDebt} />
          <Metric label="Outstanding debt" value={currency.format(store.insights.outstandingDebtCents / 100)} />
        </div>

        <div className="mt-6 rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Top selling products / services</p>
          <p className="mt-2 text-sm text-neutral-700">
            {store.insights.topSellingItems.length
              ? store.insights.topSellingItems.map((item) => `${item.name} (${item.quantity})`).join(", ")
              : "No item-level sales data available yet for this store."}
          </p>
        </div>

        <div className="mt-6">
          <Link href="/dashboard" className="text-sm font-semibold text-neutral-900 underline underline-offset-4">
            ← Back to store switcher
          </Link>
        </div>
      </section>
    </Container>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-3 shadow-sm">
      <p className="text-xs uppercase text-neutral-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-neutral-900">{value}</p>
    </div>
  );
}
