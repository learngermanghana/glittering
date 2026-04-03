import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { TeamSessionActions } from "@/components/TeamSessionActions";
import { TeamToolsNav } from "@/components/TeamToolsNav";
import { SeoInternalLinks } from "@/components/SeoInternalLinks";
import { getTeamSession } from "@/lib/auth";
import { buildPageMetadata } from "@/lib/seo";
import { getDateKeyInAccra, getSyncedBookings } from "@/lib/bookingsCsv";

export const metadata: Metadata = buildPageMetadata({
  title: "Team Booking Calendar | Glittering Med Spa",
  description: "Upcoming booking events pulled from the synced booking CSV feed.",
  path: "/calendar",
});

const DAY_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Africa/Accra",
});

export default async function CalendarPage() {
  const session = await getTeamSession();

  if (!session) {
    redirect("/login");
  }

  const now = new Date();
  const bookings = await getSyncedBookings().catch(() => []);

  const upcoming = bookings
    .filter((booking) => booking.dateTime && booking.dateTime.getTime() >= now.getTime())
    .sort((a, b) => (a.dateTime?.getTime() ?? Number.MAX_SAFE_INTEGER) - (b.dateTime?.getTime() ?? Number.MAX_SAFE_INTEGER));

  const groupedByDay = upcoming.reduce<Record<string, typeof upcoming>>((acc, booking) => {
    if (!booking.dateTime) return acc;
    const key = getDateKeyInAccra(booking.dateTime);
    if (!acc[key]) acc[key] = [];
    acc[key].push(booking);
    return acc;
  }, {});

  const dayKeys = Object.keys(groupedByDay).sort();

  return (
    <Container>
      <section className="py-8 sm:py-12">
        <SectionTitle
          title="Booking Calendar"
          subtitle={`Signed in as ${session.email ?? "Sedifex user"}. Upcoming events are loaded from your published booking CSV.`}
        />
        <TeamToolsNav active="calendar" />
        <TeamSessionActions />

        {dayKeys.length ? (
          <div className="mt-6 space-y-4">
            {dayKeys.map((dayKey) => {
              const dayDate = new Date(`${dayKey}T00:00:00Z`);

              return (
                <article key={dayKey} className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-600">{DAY_FORMATTER.format(dayDate)}</h2>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {groupedByDay[dayKey].map((booking, index) => (
                      <div key={`${dayKey}-${booking.name}-${booking.time}-${index}`} className="rounded-2xl border border-black/10 bg-neutral-50/70 p-4">
                        <p className="font-semibold text-neutral-900">{booking.name || "Unnamed client"}</p>
                        <p className="text-sm text-neutral-700">{booking.time || "Time not provided"} · {booking.branch || "Branch not set"}</p>
                        <p className="mt-1 text-sm text-neutral-600">{booking.service || "Service not listed"}</p>
                        <p className="text-xs text-neutral-500">Therapist: {booking.therapist || "Any"}</p>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-black/20 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-neutral-700">No upcoming events were found in the booking CSV.</p>
          </div>
        )}

        <SeoInternalLinks />
      </section>
    </Container>
  );
}
