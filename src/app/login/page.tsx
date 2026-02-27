import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { LoginForm } from "@/components/LoginForm";
import { BookingSyncForm } from "@/components/BookingSyncForm";
import { TeamToolsNav } from "@/components/TeamToolsNav";
import { SeoInternalLinks } from "@/components/SeoInternalLinks";
import { getTeamSession } from "@/lib/auth";
import { TeamSessionActions } from "@/components/TeamSessionActions";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Team Tools Login | Glittering Med Spa",
  description: "Access booking sync and campaign tools for Glittering Med Spa staff.",
  path: "/login",
});

export default async function LoginPage() {
  const session = await getTeamSession();

  return (
    <Container>
      <section className="py-12 sm:py-16">
        {session ? (
          <>
            <SectionTitle
              title="Booking Sync"
              subtitle={`Signed in as ${session.email ?? "Sedifex user"}. Enter booking details to sync directly to Google Sheets.`}
            />
            <TeamToolsNav active="booking" />
            <TeamSessionActions />
            <BookingSyncForm />
          </>
        ) : (
          <>
            <SectionTitle
              title="Team Login"
              subtitle="Sign in with your Glittering Spa Sedifex account, then use the Dashboard, Booking Sync, Bulk SMS, Campaigns, and Calendar tabs."
            />
            <TeamToolsNav active="booking" />
            <LoginForm />
          </>
        )}

        <SeoInternalLinks />
      </section>
    </Container>
  );
}
