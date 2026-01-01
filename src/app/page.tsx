import Link from "next/link";

const PHONE_INTL = "233241094206";
const EMAIL = "giftysaforo8@gmail.com";
const INSTAGRAM = "glittering_spa";
const LOCATION = "Awoshie, Baah Yard";

const WHATSAPP_LINK = `https://wa.me/${PHONE_INTL}?text=${encodeURIComponent(
  "Hi Glittering Spa! I want to book a session.\nService: ____\nDate: ____\nTime: ____"
)}`;

const services = [
  {
    title: "Spa",
    items: ["Swedish Massage", "Deep Tissue Massage", "Hot Stone Massage", "Body Scrub", "Body Wrap"],
  },
  {
    title: "Beauty",
    items: ["Facials", "Skincare Consultation", "Lash Services", "Brow Shaping", "Makeup (On request)"],
  },
  {
    title: "Salon",
    items: ["Wash & Blow Dry", "Braids", "Wig Install", "Treatment", "Styling"],
  },
  {
    title: "Nails",
    items: ["Manicure", "Pedicure", "Gel Nails", "Acrylic Nails", "Nail Art"],
  },
];

function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>;
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h2>
      {subtitle ? <p className="mt-2 text-neutral-300">{subtitle}</p> : null}
    </div>
  );
}

export default function Page() {
  return (
    <div className="relative">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <Link href="#" className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                ✨
              </span>
              <div className="leading-tight">
                <div className="font-semibold tracking-tight">Glittering Spa</div>
                <div className="text-xs text-neutral-300">Spa • Beauty • Salon • Nails</div>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-200">
              <a className="hover:text-white" href="#services">
                Services
              </a>
              <a className="hover:text-white" href="#gallery">
                Gallery
              </a>
              <a className="hover:text-white" href="#about">
                About
              </a>
              <a className="hover:text-white" href="#contact">
                Contact
              </a>
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
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.12),transparent_60%)]" />
          <Container>
            <div className="py-14 sm:py-20">
              <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-200">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Open Mon–Sat • {LOCATION}
                  </div>

                  <h1 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight">
                    Relax. Glow. Restore.
                  </h1>
                  <p className="mt-4 text-neutral-300 text-base sm:text-lg">
                    Welcome to <span className="text-white font-semibold">Glittering Spa</span> — your calm
                    space for premium spa, beauty, salon and nail services in Awoshie (Baah Yard).
                  </p>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <a
                      href={WHATSAPP_LINK}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-neutral-950 hover:bg-neutral-200"
                    >
                      Book Now (WhatsApp)
                    </a>
                    <a
                      href="#services"
                      className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
                    >
                      View Services
                    </a>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-neutral-300">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="text-white font-semibold">Location</div>
                      <div className="mt-1">{LOCATION}</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="text-white font-semibold">Bookings</div>
                      <div className="mt-1">WhatsApp / Call</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-semibold">Quick Booking</div>
                      <div className="text-sm text-neutral-300">Send us your preferred details.</div>
                    </div>
                    <div className="text-2xl">💆🏾‍♀️</div>
                  </div>

                  <div className="mt-6 space-y-3 text-sm">
                    {[
                      { step: "Step 1", title: "Choose a service", desc: "Spa / Beauty / Salon / Nails" },
                      { step: "Step 2", title: "Pick date & time", desc: "Mon–Sat (hours can be added later)" },
                      { step: "Step 3", title: "Confirm on WhatsApp", desc: "We’ll reply quickly to confirm" },
                    ].map((x) => (
                      <div key={x.step} className="rounded-xl border border-white/10 bg-neutral-950/40 p-4">
                        <div className="text-neutral-300">{x.step}</div>
                        <div className="text-white font-semibold">{x.title}</div>
                        <div className="text-neutral-300">{x.desc}</div>
                      </div>
                    ))}
                  </div>

                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-neutral-950 hover:bg-emerald-300"
                  >
                    Book on WhatsApp
                  </a>

                  <div className="mt-4 text-center text-xs text-neutral-400">
                    Phone: +{PHONE_INTL} • Email: {EMAIL}
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section id="services" className="border-t border-white/10 py-14 sm:py-20">
          <Container>
            <SectionTitle
              title="Services"
              subtitle="No prices yet — we can add them later. For now, bookings are quick on WhatsApp."
            />

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((cat) => (
                <div key={cat.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="text-lg font-semibold">{cat.title}</div>
                  <ul className="mt-4 space-y-2 text-sm text-neutral-300">
                    {cat.items.map((it) => (
                      <li key={it} className="flex gap-2">
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-white/30" />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section id="gallery" className="border-t border-white/10 py-14 sm:py-20">
          <Container>
            <SectionTitle title="Gallery" subtitle="See our latest work on Instagram." />

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <a
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-neutral-950 hover:bg-neutral-200"
                href={`https://instagram.com/${INSTAGRAM}`}
                target="_blank"
                rel="noreferrer"
              >
                Visit Instagram: @{INSTAGRAM} <span aria-hidden>↗</span>
              </a>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-xl border border-white/10 bg-neutral-950/50"
                    title="Add a photo here"
                  />
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section id="about" className="border-t border-white/10 py-14 sm:py-20">
          <Container>
            <SectionTitle title="About Glittering Spa" subtitle="A calm, clean, welcoming space for your self-care." />

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg font-semibold">Our Promise</h3>
                <p className="mt-3 text-sm text-neutral-300 leading-6">
                  At Glittering Spa, we combine comfort, cleanliness, and professional care to give you results
                  you can see and relaxation you can feel.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg font-semibold">Opening Days</h3>
                <div className="mt-3 text-sm text-neutral-300">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d, idx) => (
                    <div
                      key={d}
                      className={`flex items-center justify-between py-2 ${
                        idx < 5 ? "border-b border-white/10" : ""
                      }`}
                    >
                      <span>{d}</span>
                      <span>Open</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section id="contact" className="border-t border-white/10 py-14 sm:py-20">
          <Container>
            <SectionTitle title="Contact & Booking" subtitle="We reply fast on WhatsApp." />

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold">Find us</h3>
                <p className="mt-2 text-sm text-neutral-300">{LOCATION}</p>

                <div className="mt-4 aspect-video rounded-xl border border-white/10 bg-neutral-950/50 grid place-items-center text-neutral-400 text-sm">
                  Map embed goes here (Google Maps)
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-neutral-950 hover:bg-emerald-300 text-center"
                  >
                    Book on WhatsApp
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

            <footer className="mt-10 border-t border-white/10 pt-6 text-xs text-neutral-400">
              © {new Date().getFullYear()} Glittering Spa • {LOCATION}
            </footer>
          </Container>
        </section>
      </main>

      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 z-50 rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-neutral-950 shadow-lg hover:bg-emerald-300"
      >
        WhatsApp Booking
      </a>
    </div>
  );
}
