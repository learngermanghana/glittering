import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { TeamSessionActions } from "@/components/TeamSessionActions";
import { TeamToolsNav } from "@/components/TeamToolsNav";
import { DashboardSmsMetrics } from "@/components/DashboardSmsMetrics";
import { SeoInternalLinks } from "@/components/SeoInternalLinks";
import { buildPageMetadata } from "@/lib/seo";
import { getTeamSession } from "@/lib/auth";
import { getSmsMetricsForStore } from "@/lib/smsMetrics";

export const metadata: Metadata = buildPageMetadata({
  title: "Team Dashboard | Glittering Med Spa",
  description: "Overview dashboard for Glittering Med Spa team tools and weekly SMS metrics.",
  path: "/dashboard",
});

const quickLinks = [
  { href: "/login", label: "Booking Sync", description: "Sync appointments to Google Sheets." },
  { href: "/sms", label: "Bulk SMS", description: "Send targeted campaigns to opted-in customers." },
  { href: "/campaigns", label: "Campaigns", description: "Reuse templates and campaign history." },
  { href: "/calendar", label: "Calendar", description: "View synced bookings by day or week." },
];

export default async function DashboardPage() {
  const session = await getTeamSession();

  if (!session) {
    redirect("/login");
  }

  const metrics = await getSmsMetricsForStore(session.resolvedStoreId).catch(() => ({ sentThisWeek: 0, failedThisWeek: 0 }));

  return (
    <Container>
      <section className="py-12 sm:py-16">
        <SectionTitle
          title="Team Dashboard"
          subtitle={`Signed in as ${session.email ?? "Sedifex user"}. Store: ${session.resolvedStoreId}.`}
        />
        <TeamToolsNav active="dashboard" />
        <TeamSessionActions />

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <DashboardSmsMetrics sentThisWeek={metrics.sentThisWeek} failedThisWeek={metrics.failedThisWeek} />
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
