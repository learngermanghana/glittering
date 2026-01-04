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

          <div className="mt-10 rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm text-neutral-500">Testimonials</div>
                <div className="mt-1 text-lg font-semibold">Loved by our guests</div>
              </div>
              <div className="text-xs font-semibold uppercase tracking-wide text-brand-700">5.0 Average Rating</div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {[
                {
                  quote: "The massage was heavenly and the space felt so calming. I walked out glowing.",
                  name: "A. Mensah",
                  image:
                    "https://github.com/learngermanghana/glittering/blob/main/public/gallery/pexels-lombejr-5187969.jpg?raw=1",
                },
                {
                  quote: "Impeccable service and attention to detail. My nails have never looked better!",
                  name: "R. Owusu",
                  image:
                    "https://github.com/learngermanghana/glittering/blob/main/public/gallery/pexels-lombejr-5324588.jpg?raw=1",
                },
                {
                  quote: "Friendly team, beautiful ambience, and my facial left me radiant.",
                  name: "K. Boateng",
                  image:
                    "https://github.com/learngermanghana/glittering/blob/main/public/gallery/pexels-shvetsa-3852148.jpg?raw=1",
                },
              ].map((item) => (
                <div key={item.name} className="rounded-2xl border border-black/10 bg-neutral-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/70 shadow-sm">
                      <img src={item.image} alt={`${item.name} testimonial`} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <div className="text-brand-600 text-sm">★★★★★</div>
                      <div className="text-sm font-semibold text-neutral-900">{item.name}</div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-neutral-700 leading-6">“{item.quote}”</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}
