import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { getServicesCatalogData } from "@/lib/services";
import { buildPageMetadata, getAbsoluteUrl } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { buildServiceMetaDescription, findServiceBySlug, getServiceSlug } from "@/lib/serviceSeo";

function buildServiceJsonLd(service: Awaited<ReturnType<typeof getServicesCatalogData>>[number], slug: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description || `${service.name} at ${SITE.name}`,
    image: service.image,
    url: getAbsoluteUrl(`/services/${slug}`),
    serviceType: service.category,
    areaServed: ["Accra", "Awoshie", "Spintex", "Ghana"],
    provider: {
      "@type": "LocalBusiness",
      name: SITE.name,
      url: getAbsoluteUrl("/"),
      telephone: `+${SITE.phoneIntl}`,
      email: SITE.email,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Accra",
        addressCountry: "GH",
      },
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "GHS",
      price: service.price.toFixed(2),
      availability: "https://schema.org/InStock",
      url: getAbsoluteUrl(`/book?service=${encodeURIComponent(service.name)}`),
    },
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const services = await getServicesCatalogData();
  const service = findServiceBySlug(services, slug);

  if (!service) notFound();

  const serviceSchema = buildServiceJsonLd(service, slug);
  const relatedServices = services
    .filter((item) => item.name !== service.name && item.category === service.category)
    .slice(0, 3);

  return (
    <Container>
      <section className="py-12 sm:py-16">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />

        <Link href="/services" className="text-sm font-semibold text-brand-900 hover:underline">
          ← Back to services
        </Link>

        <div className="mt-4 grid gap-8 rounded-3xl border border-black/10 bg-white p-5 shadow-sm md:grid-cols-[1fr_1.15fr]">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-100">
            <Image src={service.image} alt={service.name} fill className="object-contain p-2" sizes="(max-width: 768px) 100vw, 40vw" />
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-800">{service.category}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">{service.name}</h1>
            <p className="mt-4 text-sm leading-7 text-neutral-700">{service.description}</p>
            <p className="mt-4 text-lg font-bold text-brand-950">GHS {service.price.toFixed(2)}</p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/book?service=${encodeURIComponent(service.name)}`}
                className="inline-flex items-center justify-center rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
              >
                Book this service
              </Link>
              <a
                href={`https://wa.me/${SITE.phoneIntl}?text=${encodeURIComponent(`Hi Glittering Spa! I want to ask about ${service.name}.`)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-2xl border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
              >
                Ask on WhatsApp
              </a>
            </div>

            <div className="mt-6 rounded-2xl border border-brand-100 bg-brand-50/40 p-4 text-sm leading-6 text-neutral-700">
              <p className="font-semibold text-neutral-950">Available in Accra</p>
              <p className="mt-1">Choose your preferred Glittering location during booking. Available services may differ by branch.</p>
            </div>
          </div>
        </div>

        {relatedServices.length ? (
          <div className="mt-10 rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-950">Related {service.category} services</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {relatedServices.map((item) => (
                <Link key={item.id ?? item.name} href={`/services/${getServiceSlug(item)}`} className="rounded-2xl border border-black/10 bg-neutral-50 p-4 hover:bg-white hover:shadow-sm">
                  <p className="text-sm font-semibold text-neutral-950">{item.name}</p>
                  <p className="mt-1 text-xs text-neutral-600">GHS {item.price.toFixed(2)}</p>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </Container>
  );
}

export async function generateStaticParams() {
  const services = await getServicesCatalogData();
  return services.map((service) => ({ slug: getServiceSlug(service) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const services = await getServicesCatalogData();
  const service = findServiceBySlug(services, slug);

  if (!service) {
    return buildPageMetadata({
      title: "Service Not Found | Glittering Med Spa",
      description: "The service you requested is not available.",
      path: `/services/${slug}`,
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: `${service.name} in Accra | Glittering Med Spa`,
    description: buildServiceMetaDescription(service),
    path: `/services/${slug}`,
    image: service.image,
  });
}
