import Link from "next/link";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { LoginForm } from "@/components/LoginForm";
import { BookingSyncForm } from "@/components/BookingSyncForm";
import { TeamToolsNav } from "@/components/TeamToolsNav";
import { getTeamSession } from "@/lib/auth";
import { TeamSessionActions } from "@/components/TeamSessionActions";

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
              subtitle="Sign in with your Glittering Spa Sedifex account, then use the Booking Sync and Bulk SMS tabs below."
            />
            <TeamToolsNav active="booking" />
            <Link
              href="/book"
              className="mt-4 inline-flex items-center justify-center rounded-2xl bg-brand-950 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-900"
            >
              Book on WhatsApp
            </Link>
            <LoginForm />
          </>
        )}
      </section>
    </Container>
  );
}
