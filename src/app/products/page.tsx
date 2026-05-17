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

        <div className="mt-6 rounded-3xl border border-brand-200 bg-brand-50/40 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-brand-950">Checkout pricing + fulfillment contract (Website ↔ Sedifex)</h2>
          <p className="mt-3 text-sm text-neutral-700">
            Sedifex is the source of truth for checkout totals. All amounts must be sent and stored as integer minor units.
          </p>
          <div className="mt-4 grid gap-4 text-sm text-neutral-700 md:grid-cols-2">
            <div>
              <p className="font-semibold text-neutral-900">Canonical fields</p>
              <p>fulfillment_type, subtotal, tax_total, delivery_fee, pre_processing_total, processing_fee_to_add, final_total, pricing_snapshot, payment_reference, payment_status, order_status.</p>
            </div>
            <div>
              <p className="font-semibold text-neutral-900">Required sequence</p>
              <p>POST /checkout/preview → POST /checkout/create → POST /payments/paystack/webhook → GET /orders/{`{order_id}`}</p>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-black/10 bg-white p-4 text-sm text-neutral-700">
            <p className="font-semibold text-neutral-900">MVP decisions in use</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Refunds are currently out of scope.</li>
              <li>Paystack processing fee is recovered via processing_fee_to_add.</li>
              <li>PICKUP has no delivery fee; DELIVERY adds a configured delivery fee.</li>
              <li>Tax is pulled from item configuration, and totals are recalculated server-side on checkout/create.</li>
            </ul>
          </div>
          <div className="mt-4 rounded-2xl border border-black/10 bg-white p-4 text-sm text-neutral-700">
            <p className="font-semibold text-neutral-900">Critical item ID mapping before checkout/create</p>
            <p className="mt-2">
              Sometimes Sedifex cannot find an item when the website sends a store-prefixed ID. Always map to raw Sedifex
              item IDs before checkout (example: store_123_draft-abc → draft-abc), and keep originalProductId only for
              debugging.
            </p>
          </div>
        </div>

        <ProductsCatalogClient products={products} />
      </section>
    </Container>
  );
}
