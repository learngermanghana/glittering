import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { LoginForm } from "@/components/LoginForm";
import { BookingSyncForm } from "@/components/BookingSyncForm";
import { TeamToolsNav } from "@/components/TeamToolsNav";
import { SeoInternalLinks } from "@/components/SeoInternalLinks";
import { getTeamSession } from "@/lib/auth";
import { TeamSessionActions } from "@/components/TeamSessionActions";
import { buildPageMetadata } from "@/lib/seo";
import { getStoreProfiles } from "@/lib/storeProfiles";
import { leaderStoreIds } from "@/lib/stores";

export const metadata: Metadata = buildPageMetadata({
  title: "Team Tools Login | Glittering Med Spa",
  description: "Access booking sync and campaign tools for Glittering Med Spa staff.",
  path: "/login",
});

export default async function LoginPage() {
  const session = await getTeamSession();
  const stores = session ? await getStoreProfiles(leaderStoreIds).catch(() => []) : [];

  return (
    <Container>
      <section className="py-12 sm:py-16">
        {session ? (
          <>
            <SectionTitle
              title="Booking Sync"
              subtitle={`Signed in as ${session.email ?? "Sedifex user"}. Pick a store page for rich details, then sync appointments here.`}
            />
            <TeamToolsNav active="booking" />
            <TeamSessionActions />

            <div className="mt-6 rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Switch store pages</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {stores.map((store) => (
                  <Link
                    key={store.storeId}
                    href={`/dashboard/stores/${store.storeId}`}
                    className="rounded-xl border border-black/10 px-3 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
                  >
                    {store.storeName}
                  </Link>
                ))}
              </div>
            </div>

            <BookingSyncForm />
          </>
        ) : (
          <>
            <SectionTitle
              title="Team Login"
              subtitle="Sign in with your Glittering Spa Sedifex account, then switch between store pages, Dashboard, Booking Sync, and Bulk SMS tabs."
            />
            <LoginForm />
          </>
        )}

        <SeoInternalLinks />
      </section>
    </Container>
  );
}
