import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CampaignWorkspace } from "@/components/CampaignWorkspace";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { TeamSessionActions } from "@/components/TeamSessionActions";
import { TeamToolsNav } from "@/components/TeamToolsNav";
import { SeoInternalLinks } from "@/components/SeoInternalLinks";
import { buildPageMetadata } from "@/lib/seo";
import { getTeamSession } from "@/lib/auth";
export const metadata: Metadata = buildPageMetadata({
  title: "Campaign Templates | Glittering Med Spa",
  description: "Review and reuse Glittering Med Spa campaign history and templates.",
  path: "/campaigns",
});


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

        <SeoInternalLinks />
      </section>
    </Container>
  );
}
