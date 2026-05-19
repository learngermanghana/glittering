import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/Container";
import { SITE, ENQUIRIES_WHATSAPP_LINK, LOCATIONS } from "@/lib/site";
import { getGalleryImages } from "@/lib/gallery";
import { SeoInternalLinks } from "@/components/SeoInternalLinks";
import { buildPageMetadata } from "@/lib/seo";
import { fetchFirestoreDocument } from "@/lib/firebase";
import { getProductsCatalogData } from "@/lib/products";
import { getServicesCatalogData } from "@/lib/services";

export const metadata: Metadata = buildPageMetadata({
  title: "Glittering Spa Ghana | Med Spa in Awoshie & Spintex, Accra",
  description:
    "Glittering Spa is a premium med spa in Ghana with branches in Awoshie and Spintex, Accra. Book spa, beauty, salon, nails, facials, massage, and wellness services online.",
  path: "/",
});

type StorePromoDoc = {
  promoTitle?: string;
  promoSummary?: string;
  promoStartDate?: string;
  promoEndDate?: string;
  promoWebsiteUrl?: string;
  promoImageUrl?: string;
  promoImageAlt?: string;
};

const PROMO_STORE_ID = "37mJqg20MjOriggaIaOOuahDsgj1";
const FALLBACK_PROMO_IMAGE_URL =
  "https://storage.googleapis.com/sedifeximage/product-images/1775413546139-IMG_1076.jpg";
const FALLBACK_PROMO_IMAGE_ALT = "Glittering Med Spa promotional offer";

const moneyFormatter = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
});

const branchCards = [
  {
    name: "Main Awoshie",
    value: "Glittering Med Spa Main (Awoshie)",
    description: "Choose this branch for main Awoshie services and bookings.",
  },
  {
    name: "Annex Awoshie",
    value: "Glittering Spa Annex (Awoshie)",
    description: "Pick the annex when you want services available at that location.",
  },
  {
    name: "Spintex",
    value: "Glittering Spa Spintex",
    description: "Select Spintex to view and book services available there.",
  },
];

const trustItems = [
  {
    title: "Secure checkout",
    text: "Payments go through Sedifex Checkout, not manual reference typing.",
  },
  {
    title: "Live prices",
    text: "Homepage services and products are pulled from the live catalog.",
  },
  {
    title: "Branch-aware booking",
    text: "Your selected location controls the available services shown at booking.",
  },
  {
    title: "Verified status",
    text: "Payment confirmation depends on Sedifex payment status, not browser return alone.",
  },
];

function asPromoText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parsePromoDate(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatPromoDate(value?: string | null) {
  if (!value) return null;
  const parsed = parsePromoDate(value);
  if (!parsed) return value;
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric" }).format(parsed);
}

function truncateText(value: string, length = 120) {
  const normalized = value.trim();
  if (normalized.length <= length) return normalized;
  return `${normalized.slice(0, length).trimEnd()}…`;
}

export default async function HomePage() {
  const [galleryImages, promoStore, homepageProducts, homepageServices] = await Promise.all([
    getGalleryImages(),
    fetchFirestoreDocument<StorePromoDoc>("stores", PROMO_STORE_ID).catch(() => null),
    getProductsCatalogData(),
    getServicesCatalogData(),
  ]);

  const featuredImages = galleryImages.slice(0, 3);
  const [awoshie, spintex] = LOCATIONS;
  const featuredProducts = homepageProducts.filter((product) => !product.isService).slice(0, 3);
  const featuredServices = homepageServices.filter((service) => service.price > 0).slice(0, 3);

  const fallbackPromoStartDate = "2026-04-01";
  const fallbackPromoEndDate = "2026-04-15";
  const promoStartDateRaw = asPromoText(promoStore?.promoStartDate) ?? fallbackPromoStartDate;
  const promoEndDateRaw = asPromoText(promoStore?.promoEndDate) ?? fallbackPromoEndDate;
  const promoEndDate = parsePromoDate(promoEndDateRaw);
  const now = new Date();
  const endOfPromoDate = promoEndDate ? new Date(promoEndDate) : null;
  if (endOfPromoDate) endOfPromoDate.setHours(23, 59, 59, 999);

  const promoIsExpired = endOfPromoDate ? now > endOfPromoDate : false;
  const promoTitle = asPromoText(promoStore?.promoTitle) ?? "Current Promo";
  const promoSummary = asPromoText(promoStore?.promoSummary) ?? "Glittering Med Spa service offer";
  const promoStart = formatPromoDate(promoStartDateRaw);
  const promoEnd = formatPromoDate(promoEndDateRaw);
  const promoWindow = promoStart && promoEnd ? `${promoStart} - ${promoEnd}` : promoStart ?? promoEnd ?? "Limited-time offer";
  const promoWebsiteUrl = asPromoText(promoStore?.promoWebsiteUrl);
  const promoImageUrl = asPromoText(promoStore?.promoImageUrl) ?? FALLBACK_PROMO_IMAGE_URL;
  const promoImageAlt = asPromoText(promoStore?.promoImageAlt) ?? FALLBACK_PROMO_IMAGE_ALT;

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-brand-200/40 blur-3xl" />
        <div className="absolute right-[-120px] top-[80px] h-[320px] w-[320px] rounded-full bg-gold-500/20 blur-3xl" />
      </div>

      <Container>
        <section className="py-12 sm:py-16">
          <div className="overflow-hidden rounded-3xl border border-brand-900/20 bg-brand-950 text-white shadow-lg">
            <div className="grid gap-0 lg:grid-cols-[1.12fr_0.88fr]">
              <div className="p-6 sm:p-8 lg:p-10">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">Glittering Med Spa Ghana</p>
                <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">Book beauty services and shop spa products online.</h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-brand-100 sm:text-lg">
                  Choose a service, select your branch, or shop products with secure Sedifex Checkout. WhatsApp remains available for support, but the main action is now booking and checkout.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link
                    href="/book"
                    className="rounded-2xl bg-white px-6 py-3 text-center text-sm font-semibold text-brand-950 hover:bg-white/90"
                  >
                    Book a Service
                  </Link>
                  <Link
                    href="/products"
                    className="rounded-2xl bg-gold-400 px-6 py-3 text-center text-sm font-semibold text-brand-950 hover:bg-gold-300"
                  >
                    Shop Products
                  </Link>
                  <a
                    href={ENQUIRIES_WHATSAPP_LINK}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl border border-white/40 bg-white/10 px-6 py-3 text-center text-sm font-semibold hover:bg-white/20"
                  >
                    Ask on WhatsApp
                  </a>
                </div>

                <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium text-brand-100">
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">Awoshie</span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">Spintex</span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">Secure checkout</span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">Live catalog</span>
                </div>
              </div>
              <div className="relative min-h-[280px]">
                <Image
                  src="/gallery/pexels-didsss-1830447.jpg"
                  alt="Luxury spa treatment room with warm lighting"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-950/70 via-brand-950/20 to-transparent lg:bg-gradient-to-l" />
              </div>
            </div>
          </div>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-neutral-700 shadow-sm">
            <span className="inline-block h-2 w-2 rounded-full bg-brand-600" />
            Open Mon–Sat 7am–8pm • Sun 12–8pm • {SITE.location}
          </div>

          <div className="mt-10 rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-sm text-neutral-500">Choose your branch</div>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">Start with the location you want to visit</h2>
                <p className="mt-2 max-w-2xl text-sm text-neutral-600">
                  Each location can have different available services. Pick a branch, then continue to booking.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-neutral-600">
                <a href={awoshie.directionsLink} target="_blank" rel="noreferrer" className="font-semibold text-brand-800 hover:underline">Awoshie directions</a>
                <span>•</span>
                <a href={spintex.directionsLink} target="_blank" rel="noreferrer" className="font-semibold text-brand-800 hover:underline">Spintex directions</a>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {branchCards.map((branch) => (
                <Link
                  key={branch.value}
                  href={`/book?branch=${encodeURIComponent(branch.value)}`}
                  className="rounded-3xl border border-brand-100 bg-brand-50/40 p-5 transition hover:-translate-y-0.5 hover:border-brand-300 hover:bg-white hover:shadow-sm"
                >
                  <p className="text-base font-semibold text-neutral-950">{branch.name}</p>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">{branch.description}</p>
                  <span className="mt-4 inline-flex text-sm font-semibold text-brand-800">Choose this branch →</span>
                </Link>
              ))}
            </div>
          </div>

          {!promoIsExpired ? (
            <div className="mt-10 overflow-hidden rounded-3xl border border-gold-500/40 bg-gradient-to-r from-brand-900 via-brand-900 to-brand-950 text-white shadow-sm">
              <div className="grid gap-0 lg:grid-cols-[1.25fr_0.75fr]">
                <div className="p-6 sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">{promoTitle}</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{promoSummary}</h2>
                  <p className="mt-2 text-sm text-brand-100 sm:text-base">
                    Offer runs from <span className="font-semibold text-white">{promoWindow}</span>. View services and complete your booking online.
                  </p>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    {promoWebsiteUrl ? (
                      <a
                        href={promoWebsiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-brand-950 hover:bg-white/90"
                      >
                        View promo
                      </a>
                    ) : (
                      <Link
                        href="/services"
                        className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-brand-950 hover:bg-white/90"
                      >
                        View services
                      </Link>
                    )}
                    <Link
                      href="/book"
                      className="rounded-2xl border border-white/40 bg-white/10 px-5 py-2.5 text-center text-sm font-semibold hover:bg-white/20"
                    >
                      Book with checkout
                    </Link>
                  </div>
                </div>
                <div className="relative min-h-[260px]">
                  <Image
                    src={promoImageUrl}
                    alt={promoImageAlt}
                    fill
                    className="object-contain p-3"
                    sizes="(max-width: 1024px) 100vw, 30vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-950/50 to-transparent lg:bg-gradient-to-l" />
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-10 rounded-3xl border border-brand-200/70 bg-gradient-to-br from-white via-rose-50/40 to-brand-50 p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-sm text-neutral-600">Live catalog</div>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">Featured services and products</h2>
                <p className="mt-2 text-sm text-neutral-600">
                  These cards are pulled from live service and product data. Book services or shop products directly.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
                >
                  View all services
                </Link>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-2xl bg-brand-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-900"
                >
                  Shop products
                </Link>
              </div>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <div className="rounded-3xl border border-black/10 bg-white p-5">
                <div className="text-sm font-semibold text-brand-900">Top Services</div>
                <div className="mt-4 grid gap-4">
                  {featuredServices.length ? (
                    featuredServices.map((service) => (
                      <div key={service.id ?? service.name} className="overflow-hidden rounded-2xl border border-rose-100 bg-rose-50/40 sm:grid sm:grid-cols-[110px_1fr]">
                        <div className="relative min-h-[120px] bg-white sm:min-h-full">
                          <Image
                            src={service.image}
                            alt={service.name}
                            fill
                            className="object-contain p-2"
                            sizes="110px"
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-neutral-900">{service.name}</p>
                              <p className="text-xs text-brand-800">{service.category}</p>
                            </div>
                            <p className="text-sm font-bold text-brand-950">{moneyFormatter.format(service.price)}</p>
                          </div>
                          <p className="mt-2 text-xs leading-5 text-neutral-600">{truncateText(service.description || "Book this service online.")}</p>
                          <Link
                            href={`/book?service=${encodeURIComponent(service.name)}`}
                            className="mt-3 inline-flex rounded-xl bg-brand-950 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-900"
                          >
                            Book this service
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-2xl border border-dashed border-rose-100 bg-rose-50/40 p-4 text-sm text-neutral-600">No live services are available right now.</p>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-black/10 bg-white p-5">
                <div className="text-sm font-semibold text-brand-900">Top Products</div>
                <div className="mt-4 grid gap-4">
                  {featuredProducts.length ? (
                    featuredProducts.map((product) => {
                      const isSedifexImage = product.image.startsWith("http");
                      return (
                        <div key={product.id ?? product.name} className="overflow-hidden rounded-2xl border border-rose-100 bg-rose-50/40 sm:grid sm:grid-cols-[110px_1fr]">
                          <div className="relative min-h-[120px] bg-white sm:min-h-full">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className={isSedifexImage ? "object-contain p-2" : "object-cover"}
                              sizes="110px"
                            />
                          </div>
                          <div className="p-4">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                              <p className="text-sm font-semibold text-neutral-900">{product.name}</p>
                              <p className="text-sm font-bold text-brand-950">{moneyFormatter.format(product.price)}</p>
                            </div>
                            <p className="mt-2 text-xs leading-5 text-neutral-600">{truncateText(product.description || "Available from the live product catalog.")}</p>
                            <Link
                              href="/products"
                              className="mt-3 inline-flex rounded-xl bg-brand-950 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-900"
                            >
                              Buy product
                            </Link>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="rounded-2xl border border-dashed border-rose-100 bg-rose-50/40 p-4 text-sm text-neutral-600">No live products are available right now.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {trustItems.map((item) => (
              <div key={item.title} className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-950 text-sm font-bold text-white">✓</div>
                <p className="mt-4 text-sm font-semibold text-neutral-950">{item.title}</p>
                <p className="mt-2 text-xs leading-5 text-neutral-600">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
            {featuredImages.length ? (
              <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm text-neutral-500">Gallery</div>
                    <div className="mt-1 text-lg font-semibold">A peek at our latest looks</div>
                  </div>
                  <Link className="text-sm font-semibold text-brand-800 hover:underline" href="/gallery">
                    View gallery →
                  </Link>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {featuredImages.map((src, index) => (
                    <div key={`${src}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-black/10 bg-neutral-50">
                      <Image
                        src={src}
                        alt={`Featured gallery image ${index + 1}`}
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 640px) 100vw, 20vw"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
              <div className="text-sm text-neutral-500">Training School</div>
              <div className="mt-1 text-lg font-semibold">Admissions now open</div>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                Learn beauty and wellness skills with hands-on practice at Glittering Spa. Registration captures student data and sends it to the team fast.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  className="inline-flex items-center justify-center rounded-2xl bg-brand-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-900"
                  href="/training"
                >
                  Register Now
                </Link>
                <a
                  href={ENQUIRIES_WHATSAPP_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
                >
                  Ask a question
                </a>
              </div>
            </div>
          </div>

          <SeoInternalLinks />
        </section>
      </Container>
    </div>
  );
}
