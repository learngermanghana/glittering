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

const quickLinks = [{ href: "/login", label: "Booking Sync", description: "Enter and sync appointments." }];


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

  return (
    <Container>
      <section className="py-12 sm:py-16">
        <SectionTitle
          title="Team Dashboard"
          subtitle={`Signed in as ${session.email ?? "Sedifex user"}. Choose a store to view full customers, sales, and products context.`}
        />
        <TeamToolsNav active="dashboard" />
        <TeamSessionActions />

        <div className="mt-6 rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Store switcher</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {stores.map((store) => (
              <Link
                key={store.storeId}
                href={`/dashboard/stores/${store.storeId}`}
                className="rounded-xl border border-black/10 p-4 text-sm transition hover:border-black/20 hover:bg-neutral-50"
              >
                <p className="font-semibold text-neutral-900">{store.storeName}</p>
                <p className="mt-1 text-neutral-600">{store.location}</p>
                <p className="mt-2 text-neutral-700">
                  Customers: {store.counts.customers} · Sales records: {store.counts.sales} · Products: {store.counts.products}
                </p>
                <p className="text-neutral-700">Credits: {store.sms.bulkMessagingCredits} · SMS sent this week: {store.sms.sentThisWeek}</p>
                <p className="text-neutral-700">Sales this month: {currency.format(store.business.salesThisMonth)}</p>
              </Link>
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
