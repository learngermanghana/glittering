"use client";

import { useMemo, useState } from "react";
import type { SyncedBooking } from "@/lib/bookingsCsv";

type Props = {
  bookings: SyncedBooking[];
};

function getStartOfWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = (day + 6) % 7;
  copy.setDate(copy.getDate() - diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function CalendarBoard({ bookings }: Props) {
  const [view, setView] = useState<"day" | "week">("week");
  const [focusDate, setFocusDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [branch, setBranch] = useState("all");
  const [therapist, setTherapist] = useState("all");
  const [sessionType, setSessionType] = useState("all");

  const branches = Array.from(new Set(bookings.map((item) => item.branch).filter(Boolean))).sort();
  const therapists = Array.from(new Set(bookings.map((item) => item.therapist).filter(Boolean))).sort();
  const sessionTypes = Array.from(new Set(bookings.map((item) => item.sessionType).filter(Boolean))).sort();

  const filteredBookings = useMemo(
    () =>
      bookings.filter((booking) => {
        if (!booking.dateTime) return false;
        if (branch !== "all" && booking.branch !== branch) return false;
        if (therapist !== "all" && booking.therapist !== therapist) return false;
        if (sessionType !== "all" && booking.sessionType !== sessionType) return false;
        return true;
      }),
    [bookings, branch, therapist, sessionType]
  );

  const board = useMemo(() => {
    const target = new Date(`${focusDate}T00:00:00`);
    if (Number.isNaN(target.getTime())) return [] as Array<{ key: string; label: string; bookings: SyncedBooking[] }>;

    if (view === "day") {
      const key = target.toISOString().slice(0, 10);
      return [
        {
          key,
          label: target.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }),
          bookings: filteredBookings.filter((booking) => booking.dateTime?.toISOString().slice(0, 10) === key),
        },
      ];
    }

    const start = getStartOfWeek(target);
    const days = Array.from({ length: 7 }, (_, index) => {
      const current = new Date(start);
      current.setDate(start.getDate() + index);
      const key = current.toISOString().slice(0, 10);

      return {
        key,
        label: current.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
        bookings: filteredBookings.filter((booking) => booking.dateTime?.toISOString().slice(0, 10) === key),
      };
    });

    return days;
  }, [filteredBookings, focusDate, view]);

  return (
    <div className="mt-8 rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        <label className="text-sm font-medium text-neutral-700">
          Date
          <input
            type="date"
            value={focusDate}
            onChange={(event) => setFocusDate(event.target.value)}
            className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2"
          />
        </label>

        <label className="text-sm font-medium text-neutral-700">
          View
          <select value={view} onChange={(event) => setView(event.target.value as "day" | "week")} className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2">
            <option value="day">Daily board</option>
            <option value="week">Weekly board</option>
          </select>
        </label>

        <label className="text-sm font-medium text-neutral-700">
          Branch
          <select value={branch} onChange={(event) => setBranch(event.target.value)} className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2">
            <option value="all">All branches</option>
            {branches.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-neutral-700">
          Therapist
          <select value={therapist} onChange={(event) => setTherapist(event.target.value)} className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2">
            <option value="all">All therapists</option>
            {therapists.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-neutral-700">
          Session type
          <select value={sessionType} onChange={(event) => setSessionType(event.target.value)} className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2">
            <option value="all">All session types</option>
            {sessionTypes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {board.map((day) => (
          <article key={day.key} className="rounded-2xl border border-neutral-200 p-4">
            <h3 className="font-semibold text-neutral-900">{day.label}</h3>
            <p className="mt-1 text-xs text-neutral-500">{day.bookings.length} bookings</p>

            <div className="mt-3 space-y-2">
              {day.bookings.length === 0 ? (
                <p className="text-sm text-neutral-500">No bookings.</p>
              ) : (
                day.bookings.map((booking, index) => (
                  <div key={`${day.key}-${booking.email}-${index}`} className="rounded-xl bg-neutral-50 p-2 text-xs text-neutral-700">
                    <p className="font-semibold text-neutral-900">{booking.name || booking.email || "Booking"}</p>
                    <p>{booking.time || "Time not set"}</p>
                    <p>{booking.branch || "No branch"}</p>
                    <p>{booking.therapist || "No therapist"}</p>
                    <p>{booking.sessionType || "No session type"}</p>
                  </div>
                ))
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
