import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/Container";
import { LOCATIONS, topSellingProducts, topSellingServices } from "@/lib/site";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Spa & Beauty Services | Glittering Med Spa Ghana",
  description:
    "Book spa, beauty, salon, nails, facials, massage, waxing, body treatment, and shop spa products from Glittering Med Spa in Awoshie and Spintex, Accra.",
  path: "/spa",
  image: "/logo-glittering.svg",
});

const serviceAreas = [
  "Facial Treatment",
  "Massage",
  "Waxing",
  "Nails",
  "Brows & Lashes",
  "Hair & Makeup",
  "Body Scrub / Polish / Wrap",
  "Skin & Body Treatments",
];

export default function SpaPage() {
  return (
    <Container>
      <section className="py-12 sm:py-16">
        <div className="overflow-hidden rounded-3xl border border-rose-200 bg-rose-950 text-white shadow-lg">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-6 sm:p-8 lg:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">Spa & Beauty</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">Book beauty, wellness, and salon services online.</h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-rose-100 sm:text-lg">
                Choose your branch, select a service, and continue with secure checkout. This section is for clients who want treatments, products, and spa support.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href="/spa/book" className="rounded-2xl bg-white px-6 py-3 text-center text-sm font-semibold text-rose-950 hover:bg-white/90">
                  Book a Service
                </Link>
                <Link href="/spa/services" className="rounded-2xl bg-amber-300 px-6 py-3 text-center text-sm font-semibold text-rose-950 hover:bg-amber-200">
                  View Services
                </Link>
                <Link href="/spa/products" className="rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-center text-sm font-semibold hover:bg-white/20">
                  Shop Products
                </Link>
              </div>
            </div>
            <div className="relative min-h-[300px]">
              <Image src="/gallery/pexels-didsss-1830447.jpg" alt="Glittering Med Spa treatment room" fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 45vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-rose-950/70 via-rose-950/10 to-transparent lg:bg-gradient-to-l" />
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {LOCATIONS.map((location) => (
            <a key={location.name} href={location.directionsLink} target="_blank" rel="noreferrer" className="rounded-3xl border border-rose-200 bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-lg font-semibold text-rose-950">{location.name}</p>
              <p className="mt-2 text-sm leading-6 text-rose-900/75">{location.address}</p>
              <span className="mt-4 inline-flex text-sm font-semibold text-rose-800">Get directions →</span>
            </a>
          ))}
          <Link href="/contact" className="rounded-3xl border border-rose-200 bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-lg font-semibold text-rose-950">Need help?</p>
            <p className="mt-2 text-sm leading-6 text-rose-900/75">Contact the team before booking if you are not sure which service to choose.</p>
            <span className="mt-4 inline-flex text-sm font-semibold text-rose-800">Contact us →</span>
          </Link>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl border border-rose-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-700">What clients can book</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-rose-950">Popular spa and beauty service areas</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {serviceAreas.map((item) => (
                <Link key={item} href="/spa/services" className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-950 hover:bg-white">
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-rose-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-700">Top picks</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-rose-950">Services and products people ask for</h2>
            <div className="mt-5 space-y-4 text-sm text-rose-900/80">
              {topSellingServices.map((service) => (
                <div key={service.name} className="rounded-2xl bg-rose-50 p-4">
                  <p className="font-semibold text-rose-950">{service.name}</p>
                  <p className="mt-1">{service.summary}</p>
                </div>
              ))}
              <div className="rounded-2xl border border-rose-100 p-4">
                <p className="font-semibold text-rose-950">Product favourites</p>
                <p className="mt-1">{topSellingProducts.join(" • ")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}
