import Image from "next/image";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { SALES_WHATSAPP_LINK } from "@/lib/site";
import { productCatalog } from "@/lib/productCatalog";

function stockText(quantity: number | null) {
  if (quantity === null) return "Service item";
  if (quantity <= 0) return "Out of stock";
  return `${quantity} in stock`;
}

export default function ProductsPage() {
  return (
    <Container>
      <section className="py-12 sm:py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionTitle
            title="Products"
            subtitle="Ecommerce-ready catalog with prices and stock quantities. Message our sales team to place orders or confirm service availability."
          />
          <a
            href={SALES_WHATSAPP_LINK}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-2xl bg-brand-950 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-900 shadow-sm"
          >
            Talk to our sales team
          </a>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {productCatalog.map((product, index) => {
            const isOutOfStock = product.quantity !== null && product.quantity <= 0;

            return (
              <div key={`${product.product_name}-${index}`} className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-100">
                  <Image
                    src="/products/product.jpeg"
                    alt={product.product_name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div className="text-base font-semibold">{product.product_name}</div>
                  <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-900">
                    GHS {product.price.toFixed(2)}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-neutral-600">
                  <span
                    className={`inline-flex h-2.5 w-2.5 rounded-full ${
                      isOutOfStock ? "bg-red-500" : product.quantity === null ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                  />
                  {stockText(product.quantity)}
                </div>
                <a
                  href={SALES_WHATSAPP_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
                >
                  Ask about this product
                </a>
              </div>
            );
          })}
        </div>
      </section>
    </Container>
  );
}
