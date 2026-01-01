import Image from "next/image";
import Link from "next/link";
import {
  INSTAGRAM,
  LOCATION,
  PHONE_INTL,
  galleryImages,
  highlights,
  packages,
  services,
  testimonials,
} from "./data";

const WHATSAPP_LINK = `https://wa.me/${PHONE_INTL}?text=${encodeURIComponent(
  "Hi Glittering Spa! I want to book a session."
)}`;

function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>;
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <p className="text-xs uppercase tracking-[0.35em] text-emerald-300">Glittering Spa</p>
      <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-white">{title}</h2>
      {subtitle ? <p className="mt-2 text-neutral-300">{subtitle}</p> : null}
    </div>
  );
}

export default function Page() {
  return (
    <div className="relative min-h-screen bg-neutral-950 text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                ✨
              </span>
              <div className="leading-tight">
                <div className="font-semibold tracking-tight">Glittering Spa</div>
                <div className="text-xs text-neutral-300">Spa • Beauty • Salon • Nails</div>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-200">
              <Link className="hover:text-white" href="/packages">
                Packages
              </Link>
              <Link className="hover:text-white" href="/services">
                Services
              </Link>
              <Link className="hover:text-white" href="/gallery">
                Gallery
              </Link>
              <Link className="hover:text-white" href="/contact">
                Contact
              </Link>
            </nav>

            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-neutral-200"
            >
              Book on WhatsApp
            </a>
          </div>
        </Container>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.35),transparent_60%)]" />
          <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-[120px]" />
          <Container>
            <div className="py-16 sm:py-24">
              <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-200">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Open Mon–Sat • {LOCATION}
                  </div>

                  <h1 className="mt-5 text-4xl sm:text-6xl font-semibold tracking-tight">
                    Relax, glow, and feel renewed.
                  </h1>
                  <p className="mt-4 text-neutral-300 text-base sm:text-lg">
                    Glittering Spa is your professional beauty lounge for spa therapy, nails, salon styling, and glow
                    facials. Calm vibes, clean space, premium care.
                  </p>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/packages"
                      className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-neutral-950 hover:bg-emerald-300"
                    >
                      View Packages
                    </Link>
                    <Link
                      href="/contact"
                      className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
                    >
                      Book a Visit
                    </Link>
                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-3 text-sm text-neutral-300">
                    {highlights.map((item) => (
                      <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <div className="text-white text-lg font-semibold">{item.value}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.2em] text-neutral-400">
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-emerald-400/20 via-transparent to-fuchsia-500/20 blur-2xl" />
                  <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                      <Image
                        src={galleryImages[0].src}
                        alt={galleryImages[0].alt}
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                    <div className="mt-5 rounded-2xl border border-white/10 bg-neutral-950/60 p-4">
                      <div className="text-sm text-neutral-300">Today’s spotlight</div>
                      <div className="text-lg font-semibold">Fresh nails + spa finish</div>
                      <div className="mt-2 text-xs text-neutral-400">See more on the gallery page.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="border-t border-white/10 py-12 sm:py-16">
          <Container>
            <SectionTitle title="Professional care, premium results" subtitle="Everything you need to feel restored." />

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Expert team",
                  desc: "Certified therapists and stylists with a gentle, detailed touch.",
                },
                {
                  title: "Clean environment",
                  desc: "Sterilized tools, fresh linens, and a relaxing atmosphere.",
                },
                {
                  title: "Premium products",
                  desc: "We use high-quality skincare and nail products for lasting glow.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-6"
                >
                  <div className="text-lg font-semibold">{item.title}</div>
                  <p className="mt-3 text-sm text-neutral-300 leading-6">{item.desc}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="border-t border-white/10 py-12 sm:py-16">
          <Container>
            <SectionTitle title="Top Packages" subtitle="Our most booked experiences for instant glow." />

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {packages.slice(0, 3).map((pkg) => (
                <div key={pkg.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold">{pkg.title}</div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300">
                      {pkg.duration}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-neutral-300 leading-6">{pkg.description}</p>
                  <Link
                    href="/packages"
                    className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-300"
                  >
                    See All Packages
                  </Link>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="border-t border-white/10 py-12 sm:py-16">
          <Container>
            <SectionTitle title="Services preview" subtitle="A quick look at our most-requested categories." />

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((cat) => (
                <div key={cat.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold">{cat.title}</div>
                    <span className="text-2xl">{cat.icon}</span>
                  </div>
                  <p className="mt-2 text-sm text-neutral-300">{cat.description}</p>
                  <p className="mt-4 text-xs uppercase tracking-[0.2em] text-neutral-400">Top requests</p>
                  <p className="mt-2 text-sm text-neutral-300">{cat.items.slice(0, 2).join(" • ")}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <Link
                href="/services"
                className="rounded-xl border border-white/15 bg-white/5 px-5 py-2 text-sm font-semibold hover:bg-white/10"
              >
                View Full Services
              </Link>
            </div>
          </Container>
        </section>

        <section className="border-t border-white/10 py-12 sm:py-16">
          <Container>
            <SectionTitle title="Gallery highlight" subtitle="Real client glow-ups and salon moments." />

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {galleryImages.map((image) => (
                    <div key={image.src} className="relative overflow-hidden rounded-xl border border-white/10">
                      <div className="relative aspect-[4/3]">
                        <Image src={image.src} alt={image.alt} fill className="object-cover" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-400/10 via-transparent to-fuchsia-400/10 p-6">
                <h3 className="text-lg font-semibold">Tap to zoom on every photo</h3>
                <p className="mt-3 text-sm text-neutral-300">
                  Browse our full gallery to see nails, facials, and spa moments in detail.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/gallery"
                    className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-300"
                  >
                    Open Gallery
                  </Link>
                  <a
                    href={`https://instagram.com/${INSTAGRAM}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
                  >
                    Instagram @{INSTAGRAM}
                  </a>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="border-t border-white/10 py-12 sm:py-16">
          <Container>
            <SectionTitle title="Client reviews" subtitle="Five-star energy from clients who glow with us." />

            <div className="grid gap-5 md:grid-cols-3">
              {testimonials.slice(0, 3).map((testimonial) => (
                <div key={testimonial.name} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <p className="text-sm text-neutral-300 leading-6">“{testimonial.quote}”</p>
                  <div className="mt-4 text-sm font-semibold text-white">{testimonial.name}</div>
                  <div className="text-xs text-neutral-400">{testimonial.service}</div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="border-t border-white/10 py-12 sm:py-16">
          <Container>
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg font-semibold">Visit us</h3>
                <p className="mt-2 text-sm text-neutral-300">{LOCATION}</p>

                <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
                  <iframe
                    title="Glittering Spa Location"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(LOCATION)}&output=embed`}
                    className="h-64 w-full"
                    loading="lazy"
                  />
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/contact"
                    className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-neutral-950 hover:bg-emerald-300 text-center"
                  >
                    Book a Visit
                  </Link>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(LOCATION)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold hover:bg-white/10 text-center"
                  >
                    Get Directions
                  </a>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-400/10 via-transparent to-fuchsia-400/10 p-6">
                <h3 className="text-lg font-semibold">Quick booking</h3>
                <p className="mt-3 text-sm text-neutral-300">
                  Send your preferred service, date, and time. We’ll confirm quickly on WhatsApp.
                </p>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-neutral-950 hover:bg-emerald-300"
                >
                  Start WhatsApp Booking
                </a>
              </div>
            </div>

            <footer className="mt-10 border-t border-white/10 pt-6 text-xs text-neutral-400">
              © {new Date().getFullYear()} Glittering Spa • {LOCATION}
            </footer>
          </Container>
        </section>
      </main>
    </div>
  );
}
