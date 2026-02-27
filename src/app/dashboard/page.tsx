import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { DashboardSmsMetrics } from "@/components/DashboardSmsMetrics";
import { SectionTitle } from "@/components/SectionTitle";
import { TeamSessionActions } from "@/components/TeamSessionActions";
import { TeamToolsNav } from "@/components/TeamToolsNav";
import { getTeamSession } from "@/lib/auth";
import { getSyncedBookings, getDateKeyInAccra } from "@/lib/bookingsCsv";

export default async function DashboardPage() {
  const session = await getTeamSession();

  if (!session) {
    redirect("/login");
  }

  const bookings = await getSyncedBookings().catch(() => []);
  const todayKey = getDateKeyInAccra(new Date());

  const todayBookings = bookings.filter((booking) => booking.dateTime && getDateKeyInAccra(booking.dateTime) === todayKey).length;

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const previousMonthStart = new Date(monthStart);
  previousMonthStart.setMonth(previousMonthStart.getMonth() - 1);

  const previousMonthEnd = new Date(monthStart);
  previousMonthEnd.setMilliseconds(-1);

  function uniqueCustomersBetween(start: Date, end?: Date) {
    const unique = new Set(
      bookings
        .filter((booking) => {
          if (!booking.dateTime || !booking.email) return false;
          if (booking.dateTime < start) return false;
          return end ? booking.dateTime <= end : true;
        })
        .map((booking) => booking.email.toLowerCase())
    );

    return unique.size;
  }

  const customersThisMonth = uniqueCustomersBetween(monthStart);
  const customersPreviousMonth = uniqueCustomersBetween(previousMonthStart, previousMonthEnd);
  const growthPercent =
    customersPreviousMonth === 0
      ? customersThisMonth > 0
        ? 100
        : 0
      : Math.round(((customersThisMonth - customersPreviousMonth) / customersPreviousMonth) * 100);

  return (
    <Container>
      <section className="py-12 sm:py-16">
        <SectionTitle
          title="Team Dashboard"
          subtitle={`Signed in as ${session.email ?? "Sedifex user"}. Snapshot powered by your synced bookings CSV and campaign outcomes.`}
        />
        <TeamToolsNav active="dashboard" />
        <TeamSessionActions />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Today bookings synced</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-900">{todayBookings}</p>
          </div>
          <DashboardSmsMetrics />
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Customer growth</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-900">
              {growthPercent > 0 ? "+" : ""}
              {growthPercent}%
            </p>
            <p className="mt-1 text-xs text-neutral-600">vs previous month (unique booking emails)</p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900">Quick actions</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/login" className="rounded-2xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700">
              New Booking Sync
            </Link>
            <Link href="/sms" className="rounded-2xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-100">
              New Campaign
            </Link>
            <Link href="/sms" className="rounded-2xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-100">
              View Customers
            </Link>
          </div>
        </div>
      </section>
    </Container>
  );
}
