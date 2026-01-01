"use client";

import Link from "next/link";
import { useState } from "react";
import { EMAIL, INSTAGRAM, LOCATION, PHONE_INTL } from "../data";

function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>;
}

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", service: "", date: "", time: "" });
  const whatsappLink = `https://wa.me/${PHONE_INTL}?text=${encodeURIComponent(
    "Hi Glittering Spa! I want to book a session."
  )}`;

  const submitBooking = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = `Hi Glittering Spa! I want to book a session.\nName: ${formData.name || ""}\nService: ${formData.service || ""}\nDate: ${formData.date || ""}\nTime: ${formData.time || ""}`;
    const url = `https://wa.me/${PHONE_INTL}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noreferrer");
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="border-b border-white/10 bg-neutral-950/90">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="font-semibold">
              ← Back to Home
            </Link>
            <a
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-neutral-200"
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
            >
              Book on WhatsApp
            </a>
          </div>
        </Container>
      </header>

      <main className="py-14 sm:py-20">
        <Container>
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-300">Contact</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-semibold">Visit Glittering Spa</h1>
            <p className="mt-3 text-neutral-300">Find us easily and book the glow you deserve.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold">Location</h3>
              <p className="mt-2 text-sm text-neutral-300">{LOCATION}</p>

              <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
                <iframe
                  title="Glittering Spa Location"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(LOCATION)}&output=embed`}
                  className="h-72 w-full"
                  loading="lazy"
                />
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-neutral-950 hover:bg-emerald-300 text-center"
                >
                  Book on WhatsApp
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(LOCATION)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold hover:bg-white/10 text-center"
                >
                  Get Directions
                </a>
                <a
                  href={`tel:+${PHONE_INTL}`}
                  className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold hover:bg-white/10 text-center"
                >
                  Call +{PHONE_INTL}
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold">Quick Info</h3>
              <div className="mt-4 space-y-3 text-sm text-neutral-300">
                <div className="rounded-xl border border-white/10 bg-neutral-950/40 p-4">
                  <div className="text-neutral-400 text-xs">Email</div>
                  <a className="font-semibold text-white hover:underline" href={`mailto:${EMAIL}`}>
                    {EMAIL}
                  </a>
                </div>
                <div className="rounded-xl border border-white/10 bg-neutral-950/40 p-4">
                  <div className="text-neutral-400 text-xs">Instagram</div>
                  <a
                    className="font-semibold text-white hover:underline"
                    href={`https://instagram.com/${INSTAGRAM}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    @{INSTAGRAM}
                  </a>
                </div>
                <div className="rounded-xl border border-white/10 bg-neutral-950/40 p-4">
                  <div className="text-neutral-400 text-xs">Days</div>
                  <div className="font-semibold text-white">Mon – Sat</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <form onSubmit={submitBooking} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">Smart WhatsApp booking</div>
                  <div className="text-sm text-neutral-300">Fill in your details and we’ll respond quickly.</div>
                </div>
                <div className="text-2xl">💬</div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="text-sm text-neutral-300">
                  Name
                  <input
                    value={formData.name}
                    onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                    placeholder="Your name"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-neutral-950/60 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  />
                </label>
                <label className="text-sm text-neutral-300">
                  Service
                  <input
                    value={formData.service}
                    onChange={(event) => setFormData({ ...formData, service: event.target.value })}
                    placeholder="Relax Package, Nails, Facial..."
                    className="mt-2 w-full rounded-xl border border-white/10 bg-neutral-950/60 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  />
                </label>
                <label className="text-sm text-neutral-300">
                  Date
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(event) => setFormData({ ...formData, date: event.target.value })}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-neutral-950/60 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  />
                </label>
                <label className="text-sm text-neutral-300">
                  Time
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(event) => setFormData({ ...formData, time: event.target.value })}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-neutral-950/60 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  />
                </label>
              </div>

              <button
                type="submit"
                className="mt-6 w-full rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-neutral-950 hover:bg-emerald-300"
              >
                Send to WhatsApp
              </button>
              <p className="mt-3 text-xs text-neutral-400">
                This opens WhatsApp with your message filled. We’ll confirm your slot quickly.
              </p>
            </form>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-400/10 via-transparent to-fuchsia-400/10 p-6">
              <h3 className="text-lg font-semibold">Fast confirmations</h3>
              <p className="mt-3 text-sm text-neutral-300">
                We respond quickly during opening hours. Same-day bookings can be confirmed instantly on WhatsApp.
              </p>
              <div className="mt-6 space-y-3 text-sm text-neutral-300">
                {["Share your preferred time", "We confirm availability", "Arrive and enjoy the glow"].map(
                  (item) => (
                    <div key={item} className="rounded-xl border border-white/10 bg-neutral-950/40 p-3">
                      {item}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </Container>
      </main>
    </div>
  );
}
