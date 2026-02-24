import Link from "next/link";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { LoginForm } from "@/components/LoginForm";
import { BookingSyncForm } from "@/components/BookingSyncForm";
import { getTeamSession } from "@/lib/auth";

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
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <Link href="/sms" className="rounded-2xl border border-neutral-300 px-4 py-2 hover:bg-neutral-50">
                Open SMS tools
              </Link>
            </div>
            <BookingSyncForm />
          </>
        ) : (
          <>
            <SectionTitle
              title="Team Login"
              subtitle="Sign in with your Glittering Spa Sedifex account. After login, you can input booking records and sync them to Google Sheets."
            />
            <LoginForm />
          </>
        )}
      </section>
    </Container>
  );
}
