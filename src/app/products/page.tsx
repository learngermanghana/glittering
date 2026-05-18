import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { SALES_WHATSAPP_LINK } from "@/lib/site";
import { buildPageMetadata } from "@/lib/seo";
import { getProductsCatalogData } from "@/lib/products";
import { ProductsCatalogClient } from "./ProductsCatalogClient";
import { buildProductsItemListJsonLd } from "./productsJsonLd";

export const metadata: Metadata = buildPageMetadata({
  title: "Spa Products in Accra | Skincare, Wellness & Beauty | Glittering Med Spa",
  description:
    "Shop skincare, wellness, and beauty products in Accra with stock visibility, pricing, and quick WhatsApp ordering from Glittering Med Spa.",
  path: "/products",
  image: "/logo-glittering.svg",
});

export default async function ProductsPage() {
  const products = await getProductsCatalogData();
  const productsItemListJsonLd = buildProductsItemListJsonLd(products);

  return (
    <Container>
      <section className="py-12 sm:py-16">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productsItemListJsonLd) }} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionTitle title="Products" subtitle="Browse, add to cart, and checkout with live Sedifex pricing." />
          <a
            href={SALES_WHATSAPP_LINK}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-2xl bg-brand-950 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-900"
          >
            Talk to our sales team
          </a>
        </div>

        <ProductsCatalogClient products={products} />
      </section>
    </Container>
  );
}
