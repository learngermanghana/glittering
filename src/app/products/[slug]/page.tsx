import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EngagementPanel } from "@/components/EngagementPanel";
import { Container } from "@/components/Container";
import { getProductsCatalogData } from "@/lib/products";
import { buildPageMetadata, getAbsoluteUrl } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { buildProductMetaDescription, findProductBySlug, getProductSlug } from "@/lib/productSeo";

function buildWhatsAppProductLink(productName: string) {
  return `https://wa.me/${SITE.phoneIntl}?text=${encodeURIComponent(
    `Hi Glittering Spa! I want to ask about ${productName}.\nName: ____\nQuestion: ____`
  )}`;
}

function buildProductJsonLd(product: Awaited<ReturnType<typeof getProductsCatalogData>>[number], slug: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `${product.name} available at ${SITE.name}`,
    image: product.image,
    url: getAbsoluteUrl(`/products/${slug}`),
    brand: {
      "@type": "Brand",
      name: SITE.name,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "GHS",
      price: product.price.toFixed(2),
      availability: "https://schema.org/InStock",
      url: getAbsoluteUrl(`/products/${slug}`),
      seller: {
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
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const products = await getProductsCatalogData();
  const product = findProductBySlug(products.filter((item) => !item.isService), slug);

  if (!product) notFound();

  const productSchema = buildProductJsonLd(product, slug);

  return (
    <Container>
      <section className="py-12 sm:py-16">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />

        <Link href="/products" className="text-sm font-semibold text-brand-900 hover:underline">
          ← Back to products
        </Link>

        <div className="mt-4 grid gap-8 rounded-3xl border border-black/10 bg-white p-5 shadow-sm md:grid-cols-[1fr_1.2fr]">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-100">
            <Image src={product.image} alt={product.name} fill className="object-contain p-2" />
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-800">Glittering Med Spa Product</p>
            <h1 className="mt-2 text-2xl font-semibold">{product.name}</h1>
            <p className="mt-2 text-sm leading-7 text-neutral-700">{product.description}</p>
            <p className="mt-3 text-lg font-bold text-brand-900">GHS {product.price.toFixed(2)}</p>

            <div id="comments">
              <EngagementPanel sourceProductId={product.id ?? slug} label={product.name} />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-2xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
              >
                Buy from products page
              </Link>
              <a
                href={buildWhatsAppProductLink(product.name)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-2xl border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
              >
                Ask on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}

export async function generateStaticParams() {
  const products = await getProductsCatalogData();
  return products.filter((product) => !product.isService).map((product) => ({ slug: getProductSlug(product) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const products = await getProductsCatalogData();
  const product = findProductBySlug(products.filter((item) => !item.isService), slug);

  if (!product) {
    return buildPageMetadata({
      title: "Product Not Found | Glittering Med Spa",
      description: "The product you requested is not available.",
      path: `/products/${slug}`,
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: `${product.name} in Accra | Glittering Med Spa Products`,
    description: buildProductMetaDescription(product),
    path: `/products/${slug}`,
    image: product.image,
  });
}
