import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { BulkSmsForm } from "@/components/BulkSmsForm";
import { getCustomers } from "@/lib/crm";
import { getTeamSession } from "@/lib/auth";

export default async function SmsPage() {
  const session = await getTeamSession();

  if (!session) {
    redirect("/login");
  }

  const customers = await getCustomers(session.resolvedStoreId).catch(() => []);

  return (
    <Container>
      <section className="py-12 sm:py-16">
        <SectionTitle
          title="Bulk SMS Campaigns"
          subtitle={`Signed in as ${session.email ?? "Sedifex user"}. Store: ${session.resolvedStoreId}. Pull your customer list from Firebase and send campaign SMS with Hubtel.`}
        />
        <BulkSmsForm customers={customers} />
      </section>
    </Container>
  );
}
