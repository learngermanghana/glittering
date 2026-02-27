import { redirect } from "next/navigation";
import { CalendarBoard } from "@/components/CalendarBoard";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { TeamSessionActions } from "@/components/TeamSessionActions";
import { TeamToolsNav } from "@/components/TeamToolsNav";
import { getTeamSession } from "@/lib/auth";
import { getSyncedBookings } from "@/lib/bookingsCsv";

export default async function CalendarPage() {
  const session = await getTeamSession();

  if (!session) {
    redirect("/login");
  }

  const bookings = await getSyncedBookings().catch(() => []);

  return (
    <Container>
      <section className="py-12 sm:py-16">
        <SectionTitle
          title="Calendar View"
          subtitle={`Signed in as ${session.email ?? "Sedifex user"}. Daily and weekly appointment board sourced from synced booking CSV data.`}
        />
        <TeamToolsNav active="calendar" />
        <TeamSessionActions />
        <CalendarBoard bookings={bookings} />
      </section>
    </Container>
  );
}
