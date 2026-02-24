import Image from "next/image";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { SALES_WHATSAPP_LINK } from "@/lib/site";
import { getProducts } from "@/lib/crm";

export default async function ProductsPage() {
  const products = await getProducts();
  return (
    <Container>
      <section className="py-12 sm:py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionTitle title="Products" subtitle="Shop our glow essentials and best-sellers." />
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
          {products.map((product) => (
            <div key={product.name} className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-100">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
              <div className="mt-4 text-base font-semibold">{product.name}</div>
              <p className="mt-2 text-sm text-neutral-600 leading-6">{product.description}</p>
              <a
                href={SALES_WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
              >
                Ask about this product
              </a>
            </div>
          ))}
        </div>
      </section>
    </Container>
  );
}
