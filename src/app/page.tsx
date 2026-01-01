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
    title: "Spa Therapy",
    description: "Slow, restorative bodywork for full-body renewal.",
    icon: "💆🏾‍♀️",
    items: ["Swedish Massage", "Deep Tissue Massage", "Hot Stone Massage", "Body Scrub", "Body Wrap"],
  },
  {
    title: "Beauty & Glow",
    description: "Skincare and makeup that leaves you luminous.",
    icon: "✨",
    items: ["Facials", "Skincare Consultation", "Lash Services", "Brow Shaping", "Makeup (On request)"],
  },
  {
    title: "Hair Studio",
    description: "Protective styles, treatments, and polished looks.",
    icon: "💇🏾‍♀️",
    items: ["Wash & Blow Dry", "Braids", "Wig Install", "Treatment", "Styling"],
  },
  {
    title: "Nail Lounge",
    description: "Fresh sets, clean care, and artful finishing.",
    icon: "💅🏾",
    items: ["Manicure", "Pedicure", "Gel Nails", "Acrylic Nails", "Nail Art"],
  },
];

const highlights = [
  { label: "Happy Clients", value: "500+" },
  { label: "Years of Care", value: "8+" },
  { label: "Services Weekly", value: "120" },
  { label: "Weekend Slots", value: "Sat Only" },
];

const rituals = [
  {
    title: "Glow Reset",
    time: "90 min",
    desc: "A facial + back massage ritual to brighten and reset skin.",
    includes: ["Deep cleanse", "Hydrating mask", "Aromatherapy massage"],
  },
  {
    title: "Royal Relax",
    time: "120 min",
    desc: "Full body scrub followed by a hot stone release massage.",
    includes: ["Body polish", "Hot stones", "Herbal tea"],
  },
  {
    title: "Polish & Poise",
    time: "75 min",
    desc: "Signature mani-pedi with gel finish and nail art accents.",
    includes: ["Cuticle care", "Gel polish", "Nail art"],
  },
];

const testimonials = [
  {
    name: "Akosua B.",
    service: "Hot Stone Massage",
    quote:
      "The calmest massage I have ever had. The space is clean, and the team made me feel so relaxed.",
  },
  {
    name: "Esi M.",
    service: "Gel Manicure",
    quote: "My nails lasted for weeks and the attention to detail was amazing. I keep coming back.",
  },
  {
    name: "Naa D.",
    service: "Makeup Session",
    quote: "Flawless makeup for my event. They listened to exactly what I wanted.",
  },
];

const gallery = [
  { title: "Spa Suites", tag: "Relaxing space", color: "from-emerald-400/30 via-transparent" },
  { title: "Skin Glow", tag: "Facials", color: "from-amber-300/30 via-transparent" },
  { title: "Nail Art", tag: "Creative sets", color: "from-pink-400/30 via-transparent" },
  { title: "Braids", tag: "Protective styles", color: "from-indigo-400/30 via-transparent" },
  { title: "Bridal", tag: "Makeup", color: "from-rose-400/30 via-transparent" },
  { title: "Wellness", tag: "Self-care", color: "from-cyan-400/30 via-transparent" },
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
              <a className="hover:text-white" href="#rituals">
                Signature Rituals
              </a>
              <a className="hover:text-white" href="#gallery">
                Gallery
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
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.14),transparent_60%)]" />
          <div className="pointer-events-none absolute left-1/2 top-24 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />
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
                    Welcome to <span className="text-white font-semibold">Glittering Spa</span> — your calm space for
                    premium spa, beauty, salon and nail services in Awoshie (Baah Yard).
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

                  <div className="mt-6 rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-sm text-neutral-200">
                    <div className="font-semibold text-white">Same-day bookings available</div>
                    <div className="text-xs text-neutral-300">Chat with us on WhatsApp to confirm availability.</div>
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

        <section className="border-t border-white/10 py-14 sm:py-20">
          <Container>
            <SectionTitle
              title="Why clients love Glittering Spa"
              subtitle="Calm vibes, premium products, and a welcoming team that listens."
            />

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Thoughtful Experience",
                  desc: "Every visit is customized, from scent and music to the pressure you prefer.",
                },
                {
                  title: "Clean + Serene",
                  desc: "We keep our studio spotless so you can fully relax and enjoy your treatment.",
                },
                {
                  title: "Skilled Specialists",
                  desc: "Our team focuses on detailed care, gentle touch, and noticeable results.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="text-lg font-semibold">{item.title}</div>
                  <p className="mt-3 text-sm text-neutral-300 leading-6">{item.desc}</p>
                </div>
              ))}
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
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold">{cat.title}</div>
                    <span className="text-2xl">{cat.icon}</span>
                  </div>
                  <p className="mt-2 text-sm text-neutral-300">{cat.description}</p>
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

        <section id="rituals" className="border-t border-white/10 py-14 sm:py-20">
          <Container>
            <SectionTitle title="Signature Rituals" subtitle="Curated experiences designed for deep rest and glow." />

            <div className="grid gap-6 lg:grid-cols-3">
              {rituals.map((ritual) => (
                <div key={ritual.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{ritual.title}</h3>
                    <span className="text-xs uppercase tracking-[0.2em] text-neutral-400">{ritual.time}</span>
                  </div>
                  <p className="mt-3 text-sm text-neutral-300 leading-6">{ritual.desc}</p>
                  <ul className="mt-4 space-y-2 text-sm text-neutral-300">
                    {ritual.includes.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        <span>{item}</span>
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
            <SectionTitle title="Gallery" subtitle="A glimpse of our glow-ups and calming spaces." />

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <a
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-neutral-950 hover:bg-neutral-200"
                href={`https://instagram.com/${INSTAGRAM}`}
                target="_blank"
                rel="noreferrer"
              >
                Visit Instagram: @{INSTAGRAM} <span aria-hidden>↗</span>
              </a>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {gallery.map((item) => (
                  <div
                    key={item.title}
                    className={`relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br ${item.color} to-neutral-950/60 p-5`}
                  >
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.3),transparent_60%)]" />
                    <div className="relative">
                      <div className="text-sm uppercase tracking-[0.25em] text-neutral-300">{item.tag}</div>
                      <div className="mt-2 text-lg font-semibold">{item.title}</div>
                      <div className="mt-12 text-xs text-neutral-400">Add your photo here</div>
                    </div>
                  </div>
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
                  At Glittering Spa, we combine comfort, cleanliness, and professional care to give you results you
                  can see and relaxation you can feel.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2 text-sm text-neutral-300">
                  {["Premium products", "Gentle techniques", "Warm hospitality", "Clean environment"].map((item) => (
                    <div key={item} className="rounded-xl border border-white/10 bg-neutral-950/40 p-3">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg font-semibold">Opening Days</h3>
                <div className="mt-3 text-sm text-neutral-300">
                  {[
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                  ].map((d, idx) => (
                    <div
                      key={d}
                      className={`flex items-center justify-between py-2 ${idx < 5 ? "border-b border-white/10" : ""}`}
                    >
                      <span>{d}</span>
                      <span>Open</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-xl border border-white/10 bg-neutral-950/40 p-4 text-xs text-neutral-300">
                  Hours can be shared on WhatsApp — we’ll confirm your preferred time quickly.
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="border-t border-white/10 py-14 sm:py-20">
          <Container>
            <SectionTitle title="Client Love" subtitle="Words from clients who glow with us." />

            <div className="grid gap-5 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div key={testimonial.name} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <p className="text-sm text-neutral-300 leading-6">“{testimonial.quote}”</p>
                  <div className="mt-4 text-sm font-semibold text-white">{testimonial.name}</div>
                  <div className="text-xs text-neutral-400">{testimonial.service}</div>
                </div>
              ))}
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
