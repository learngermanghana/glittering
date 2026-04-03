import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildPageMetadata } from "@/lib/seo";
import { getTeamSession } from "@/lib/auth";

export const metadata: Metadata = buildPageMetadata({
  title: "Bulk SMS Deprecated | Glittering Med Spa",
  description: "Bulk SMS page has been removed from the admin tools.",
  path: "/sms",
});

export default async function SmsPage() {
  const session = await getTeamSession();

  if (!session) {
    redirect("/login");
  }

  redirect("/dashboard");
}
