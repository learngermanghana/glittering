import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { SeoInternalLinks } from "@/components/SeoInternalLinks";
import { categories, SITE, WHATSAPP_LINK } from "@/lib/site";
import { getServicesCatalogData } from "@/lib/services";
import { buildPageMetadata, getAbsoluteUrl } from "@/lib/seo";
import { ServicesCatalogClient } from "@/app/services/ServicesCatalogClient";
import { getServiceSlug } from "@/lib/serviceSeo";

export const metadata: Metadata = buildPageMetadata({
  title: "Spa, Beauty, Massage, Waxing & Nails Services in Accra | Glittering Med Spa",
  description:
    "Book spa, beauty, massage, waxing, facials, nails, salon, and body treatment services at Glittering Med Spa in Awoshie and Spintex, Accra.",
  path: "/services",
});

export default async function ServicesPage() {
  const liveServices = await getServicesCatalogData();
  const catalogItems = liveServices.length ? liveServices.slice(0, 40) : [];

  const servicesSchema = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: "Glittering Med Spa Services in Accra",
    url: getAbsoluteUrl("/services"),
    itemListElement: catalogItems.map((service) => ({
      "@type": "Offer",
      priceCurrency: "GHS",
      price: service.price.toFixed(2),
      url: getAbsoluteUrl(`/services/${getServiceSlug(service)}`),
      itemOffered: {
        "@type": "Service",
        name: service.name,
        description: service.description,
        serviceType: service.category,
        image: service.image,
        provider: {
          "@type": "LocalBusiness",
          name: SITE.name,
          telephone: `+${SITE.phoneIntl}`,
          email: SITE.email,
          address: {
            "@type": "PostalAddress",
            addressLocality: "Accra",
            addressCountry: "GH",
          },
        },
      },
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What services can I book at Glittering Med Spa?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can book spa, beauty, salon, nail, facial, massage, waxing, and body treatment services at Glittering Med Spa in Accra.",
        },
      },
      {
        "@type": "Question",
        name: "Where is Glittering Med Spa located?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Glittering Med Spa serves clients from Awoshie and Spintex in Accra, Ghana. Choose your preferred branch during booking.",
        },
      },
      {
        "@type": "Question",
        name: "Can I pay online for a service booking?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The website supports online booking and secure Sedifex Checkout for service payments.",
        },
      },
    ],
  };

  return (
    <Container>
      <section className="py-12 sm:py-16">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

        <SectionTitle
          title="Spa, Beauty, Massage, Waxing & Nails Services in Accra"
          subtitle="Explore live Glittering Med Spa services from Sedifex. Search by treatment, category, or description, then book your preferred location online."
        />

        <div className="mb-6 rounded-3xl border border-black/10 bg-white p-5 text-sm leading-7 text-neutral-700 shadow-sm">
          <p>
            Glittering Med Spa offers facials, massage, waxing, nails, salon, beauty, spa, and body treatment services for clients in Awoshie, Spintex, and across Accra. Service availability can differ by branch, so choose your preferred location when booking.
          </p>
        </div>

        {liveServices.length ? (
          <ServicesCatalogClient services={liveServices} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <div key={c.title} className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
                <div className="text-lg font-semibold">{c.title}</div>
                <div className="mt-1 text-sm text-neutral-600">{c.desc}</div>

                <ul className="mt-4 space-y-2 text-sm text-neutral-700">
                  {c.items.map((it) => (
                    <li key={it} className="flex gap-2">
                      <span className="mt-2 h-2 w-2 rounded-full bg-neutral-900/20" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
                >
                  Book
                </a>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12">
          <SectionTitle
            title="See proof on social media"
            subtitle="Our services are showcased in photos and videos online."
          />

          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
              <div className="text-lg font-semibold">Instagram</div>
              <p className="mt-2 text-sm text-neutral-600">
                Browse recent transformations, client videos, and behind-the-scenes updates.
              </p>
              <a
                href={`https://instagram.com/${SITE.instagram}`}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
              >
                Visit Instagram @{SITE.instagram}
              </a>
            </div>
            <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
              <div className="text-lg font-semibold">Gallery</div>
              <p className="mt-2 text-sm text-neutral-600">
                See curated photo highlights from recent appointments and makeovers.
              </p>
              <a
                href="/gallery"
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
              >
                View photo gallery
              </a>
            </div>
          </div>
        </div>

        <SeoInternalLinks />
      </section>
    </Container>
  );
}
