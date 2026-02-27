import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { SeoInternalLinks } from "@/components/SeoInternalLinks";
import { categories, packages, SITE, WHATSAPP_LINK } from "@/lib/site";
import { buildPageMetadata, getAbsoluteUrl } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Services | Glittering Med Spa",
  description: "Explore spa, beauty, salon, and nail services at Glittering Med Spa.",
  path: "/services",
});

export default function ServicesPage() {
  const servicesSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    provider: {
      "@type": "Organization",
      name: SITE.name,
      url: getAbsoluteUrl("/"),
    },
    serviceType: "Spa, beauty, salon, and nails",
    areaServed: "Accra, Ghana",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Glittering Med Spa Services",
      itemListElement: categories.slice(0, 8).map((category) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: category.title,
          description: category.desc,
        },
      })),
    },
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
          text: "You can book spa, beauty, salon, nail, facial, massage, waxing, and body treatment services.",
        },
      },
      {
        "@type": "Question",
        name: "How do I make a booking?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Use the WhatsApp booking buttons on the page to send your preferred service, date, and time.",
        },
      },
      {
        "@type": "Question",
        name: "Do you have package options?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, we offer popular bundles such as Relax & Reset, Glow Facial, Nails & Toes Combo, and Self-Care Day.",
        },
      },
    ],
  };

  return (
    <Container>
      <section className="py-12 sm:py-16">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

        <SectionTitle title="Services" />

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

        <div className="mt-12">
          <SectionTitle title="Popular Packages" subtitle="Quick booking options bundled for you." />

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {packages.map((p) => (
              <div key={p.title} className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-lg font-semibold">{p.title}</div>
                  <span className="text-xs rounded-full border border-black/10 bg-neutral-50 px-2 py-1 text-neutral-700">
                    {p.tag}
                  </span>
                </div>

                <p className="mt-3 text-sm text-neutral-700 leading-6">{p.desc}</p>

                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
                >
                  Book this
                </a>
              </div>
            ))}
          </div>
        </div>

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
