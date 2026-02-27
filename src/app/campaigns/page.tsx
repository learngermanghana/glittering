import { redirect } from "next/navigation";
import { CampaignWorkspace } from "@/components/CampaignWorkspace";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { TeamSessionActions } from "@/components/TeamSessionActions";
import { TeamToolsNav } from "@/components/TeamToolsNav";
import { getTeamSession } from "@/lib/auth";

export default async function CampaignsPage() {
  const session = await getTeamSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <Container>
      <section className="py-12 sm:py-16">
        <SectionTitle
          title="Campaign History & Templates"
          subtitle={`Signed in as ${session.email ?? "Sedifex user"}. Save reusable templates, review outcomes, and re-send failed numbers in one click.`}
        />
        <TeamToolsNav active="campaigns" />
        <TeamSessionActions />
        <CampaignWorkspace />
      </section>
    </Container>
  );
}
