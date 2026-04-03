import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { SALES_WHATSAPP_LINK } from "@/lib/site";
import { buildPageMetadata } from "@/lib/seo";
import { getProductsCatalogData } from "@/lib/products";
import { ProductsCatalogClient } from "./ProductsCatalogClient";
import type { DisplayProduct } from "@/lib/productsData";

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
          <SectionTitle
            title="Products"
            subtitle="Shop skincare and wellness essentials with live pricing and stock visibility. Message our team on WhatsApp for fast checkout support in Accra."
          />
          <a
            href={SALES_WHATSAPP_LINK}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-2xl bg-brand-950 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-900"
          >
            Talk to our sales team
          </a>
        </div>

        <p className="-mt-4 max-w-3xl text-sm text-neutral-700">
          Looking for facials, body care, or supplements? Browse our curated product catalog, then continue to our{" "}
          <a href="/services" className="font-semibold text-brand-800 hover:underline">
            spa services
          </a>{" "}
          and{" "}
          <a href="/gallery" className="font-semibold text-brand-800 hover:underline">
            treatment gallery
          </a>{" "}
          to compare options before you order.
        </p>

        <div className="mt-8 rounded-3xl border border-black/10 bg-neutral-50 p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Checkout delivery, pickup & shipping rules</h2>
          <div className="mt-4 grid gap-3 text-sm text-neutral-700 sm:grid-cols-2">
            <p>• Delivery zones + fees: Accra Central (GHS 20), Tema/Spintex corridor (GHS 30), and outer Accra (GHS 45).</p>
            <p>• Free delivery on product orders from GHS 500 and above within standard zones.</p>
            <p>• Pickup option by branch: Awoshie or Spintex (choose your branch during checkout confirmation).</p>
            <p>• ETA shown at checkout: same-day dispatch for paid orders before 2pm, otherwise next business day.</p>
          </div>
        </div>

        <ProductsCatalogClient products={products} />
      </section>
    </Container>
  );
}

function buildProductsItemListJsonLd(products: DisplayProduct[]) {
  const offers = products.slice(0, 30).map((product, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "Product",
      name: product.name,
      image: product.image.startsWith("http") ? product.image : `https://www.glitteringmedspa.com${product.image}`,
      offers: {
        "@type": "Offer",
        priceCurrency: "GHS",
        price: product.price.toFixed(2),
        availability: product.quantity !== null && product.quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        url: "https://www.glitteringmedspa.com/products",
      },
    },
  }));

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Glittering Med Spa products",
    itemListElement: offers,
  };
}
