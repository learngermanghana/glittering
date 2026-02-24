import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { BulkSmsForm } from "@/components/BulkSmsForm";
import { TeamToolsNav } from "@/components/TeamToolsNav";
import { getCustomers } from "@/lib/crm";
import { getTeamSession } from "@/lib/auth";

export default async function SmsPage() {
  const session = await getTeamSession();

  if (!session) {
    redirect("/login");
  }

  const customers = await getCustomers(session.resolvedStoreId).catch(() => []);
  const eligibleCustomers = customers.filter((customer) => customer.marketingOptIn !== false && customer.phone);

  return (
    <Container>
      <section className="py-12 sm:py-16">
        <SectionTitle
          title="Bulk SMS Campaigns"
          subtitle={`Signed in as ${session.email ?? "Sedifex user"}. Store: ${session.resolvedStoreId}. Use the tabs below to switch between Booking Sync and Bulk SMS quickly.`}
        />
        <TeamToolsNav active="sms" />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Total customers</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-900">{customers.length}</p>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Opted-in contacts</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-900">{eligibleCustomers.length}</p>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm sm:col-span-2 lg:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Tip</p>
            <p className="mt-2 text-sm text-neutral-700">Use search and “Select visible” to target a specific audience quickly.</p>
          </div>
        </div>

        <BulkSmsForm customers={customers} />
      </section>
    </Container>
  );
}
