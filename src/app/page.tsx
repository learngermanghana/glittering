import Link from "next/link";
import { Container } from "@/components/Container";
import { SITE, WHATSAPP_LINK, DIRECTIONS_LINK } from "@/lib/site";

export default function HomePage() {
  return (
    <div className="relative">
      {/* subtle background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-brand-200/40 blur-3xl" />
        <div className="absolute right-[-120px] top-[80px] h-[320px] w-[320px] rounded-full bg-gold-500/20 blur-3xl" />
      </div>

      <Container>
        <section className="py-12 sm:py-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-neutral-700 shadow-sm">
            <span className="inline-block h-2 w-2 rounded-full bg-brand-600" />
            Open Mon–Sat • {SITE.location}
          </div>

          <h1 className="mt-6 text-4xl sm:text-6xl font-semibold tracking-tight">
            Relax. Glow. Restore.
          </h1>

          <p className="mt-4 max-w-2xl text-neutral-700 text-base sm:text-lg leading-7">
            Welcome to <span className="font-semibold">{SITE.name}</span> — premium self-care with Spa, Beauty,
            Salon and Nails.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-brand-950 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-900 shadow-sm text-center"
            >
              Book on WhatsApp
            </a>
            <a
              href={DIRECTIONS_LINK}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-black/10 bg-white px-6 py-3 text-sm font-semibold hover:bg-neutral-50 shadow-sm text-center"
            >
              Get Directions
            </a>
          </div>

          {/* green band like your sample */}
          <div className="mt-10 rounded-3xl bg-brand-900 text-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="text-lg font-semibold">Need a quick booking?</div>
                <div className="text-white/80 text-sm">Message us and we’ll confirm time + service.</div>
              </div>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-brand-950 hover:bg-white/90 text-center"
              >
                Book Now
              </a>
            </div>
          </div>

          {/* cards */}
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
              <div className="text-sm text-neutral-500">Services</div>
              <div className="mt-1 text-lg font-semibold">Spa • Beauty • Salon • Nails</div>
              <Link className="mt-4 inline-block text-sm font-semibold text-brand-800 hover:underline" href="/services">
                View services →
              </Link>
            </div>

            <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
              <div className="text-sm text-neutral-500">Popular</div>
              <div className="mt-1 text-lg font-semibold">Packages for quick booking</div>
              <Link className="mt-4 inline-block text-sm font-semibold text-brand-800 hover:underline" href="/packages">
                View packages →
              </Link>
            </div>

            <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
              <div className="text-sm text-neutral-500">Gallery</div>
              <div className="mt-1 text-lg font-semibold">See our work</div>
              <Link className="mt-4 inline-block text-sm font-semibold text-brand-800 hover:underline" href="/gallery">
                Open gallery →
              </Link>
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}
