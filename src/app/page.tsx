import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/Container";
import { SITE, LOCATIONS } from "@/lib/site";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Glittering Med Spa & Academy | Spa Services, Products and Beauty Training in Accra",
  description:
    "Book spa and beauty services, shop skincare and beauty products, or join Glittering Academy for professional beauty training in Ghana.",
  path: "/",
  image: "/logo-glittering.svg",
});

const spaHighlights = ["Facials", "Massage", "Nails", "Waxing", "Body treatments", "Spa products"];
const academyHighlights = ["Nails", "Makeup", "Lashes", "Massage", "Facial treatment", "Hair & wigs"];

const quickActions = [
  {
    title: "Spa Services & Beauty Products",
    text: "Book treatments, explore salon and spa services, or shop skincare and beauty products.",
    image: "/gallery/pexels-didsss-1830447.jpg",
    alt: "Relaxing spa treatment room",
    chips: spaHighlights,
    actions: [
      { href: "/spa/book", label: "Book Service", primary: true },
      { href: "/spa/services", label: "View Services" },
      { href: "/spa/products", label: "Shop Products" },
    ],
  },
  {
    title: "Glittering Beauty Academy",
    text: "Explore practical beauty courses, fees, starter items, and registration information for new students.",
    image: "/training/1.jpeg",
    alt: "Students receiving practical beauty training",
    chips: academyHighlights,
    actions: [
      { href: "/academy/register", label: "Register Now", primary: true },
      { href: "/academy/courses", label: "View Courses" },
      { href: "/academy/fees", label: "Fees & Rules" },
    ],
  },
];

export default function HomePage() {
  const [awoshie, spintex] = LOCATIONS;

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-160px] top-[-160px] h-[360px] w-[360px] rounded-full bg-rose-300/40 blur-3xl" />
        <div className="absolute right-[-160px] top-[120px] h-[360px] w-[360px] rounded-full bg-amber-200/50 blur-3xl" />
      </div>

      <Container>
        <section className="py-12 sm:py-16">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-800">{SITE.location} • Spa • Products • Beauty Training</p>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-rose-950 sm:text-6xl">
                Book beauty services, shop products, or train at Glittering Academy.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-rose-900/80 sm:text-lg">
                Choose what you need today: book a treatment, browse spa and salon services, shop skincare and beauty products, or explore professional courses and register as a student.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href="/spa/book" className="rounded-2xl bg-rose-800 px-6 py-3 text-center text-sm font-semibold text-white shadow-sm shadow-rose-200 hover:bg-rose-900">
                  Book a Service
                </Link>
                <Link href="/spa/products" className="rounded-2xl bg-rose-700 px-6 py-3 text-center text-sm font-semibold text-white shadow-sm shadow-rose-200 hover:bg-rose-800">
                  Shop Products
                </Link>
                <Link href="/academy/register" className="rounded-2xl bg-rose-950 px-6 py-3 text-center text-sm font-semibold text-white shadow-sm shadow-rose-200 hover:bg-black">
                  Register for a Course
                </Link>
                <a href="#explore-options" className="rounded-2xl border border-rose-300 bg-white/70 px-6 py-3 text-center text-sm font-semibold text-rose-950 hover:bg-white">
                  Explore Services & Courses
                </a>
              </div>
            </div>

            <div id="explore-options" className="grid scroll-mt-24 gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {quickActions.map((item) => (
                <article key={item.title} className="group overflow-hidden rounded-3xl border border-rose-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                  <div className="grid min-h-[270px] sm:grid-cols-[0.9fr_1.1fr] lg:grid-cols-[0.85fr_1.15fr]">
                    <div className="relative min-h-[180px]">
                      <Image src={item.image} alt={item.alt} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 1024px) 50vw, 24vw" />
                    </div>
                    <div className="flex flex-col p-5">
                      <h2 className="text-xl font-semibold tracking-tight text-rose-950">{item.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-rose-900/75">{item.text}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.chips.map((chip) => (
                          <span key={chip} className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-900">
                            {chip}
                          </span>
                        ))}
                      </div>
                      <div className="mt-auto flex flex-wrap gap-2 pt-5">
                        {item.actions.map((action) => (
                          <Link
                            key={action.href}
                            href={action.href}
                            className={
                              action.primary
                                ? "rounded-xl bg-rose-800 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-900"
                                : "rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-900 hover:bg-white"
                            }
                          >
                            {action.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-4 rounded-3xl border border-rose-200 bg-white/80 p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">Branches</p>
              <p className="mt-2 text-sm text-rose-900">Awoshie and Spintex locations for spa services and enquiries.</p>
            </div>
            <a href={awoshie?.directionsLink} target="_blank" rel="noreferrer" className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm hover:bg-white">
              <span className="font-semibold text-rose-950">Awoshie</span>
              <span className="mt-1 block text-rose-800/80">Get directions →</span>
            </a>
            <a href={spintex?.directionsLink} target="_blank" rel="noreferrer" className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm hover:bg-white">
              <span className="font-semibold text-rose-950">Spintex</span>
              <span className="mt-1 block text-rose-800/80">Get directions →</span>
            </a>
            <Link href="/contact" className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm hover:bg-white">
              <span className="font-semibold text-rose-950">Need help choosing?</span>
              <span className="mt-1 block text-rose-800/80">Contact the team →</span>
            </Link>
          </div>
        </section>
      </Container>
    </div>
  );
}
