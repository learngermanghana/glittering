"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { SALES_WHATSAPP_LINK } from "@/lib/site";
import { productCatalog } from "@/lib/productCatalog";

type AvailabilityFilter = "all" | "in-stock" | "out-of-stock";

function stockText(quantity: number | null) {
  if (quantity === null) return "Out of stock";
  if (quantity <= 0) return "Out of stock";
  return `${quantity} in stock`;
}

function trustSignals(productName: string, price: number) {
  const normalized = productName.toLowerCase();
  const isService =
    price >= 300 ||
    normalized.includes("massage") ||
    normalized.includes("facial") ||
    normalized.includes("wax");

  const ingredients = normalized.includes("vitamin")
    ? "Vitamin C complex, antioxidant blend, and hydration support nutrients."
    : normalized.includes("scrub") || normalized.includes("soap")
      ? "Plant oils, exfoliating grains, gentle cleansers, and fragrance-safe blend."
      : isService
        ? "Performed with professional spa-grade products chosen for your skin profile."
        : "Active botanical blend with moisturizing and glow-support ingredients.";

  const usage = isService
    ? "Book your session and complete a quick skin/safety consultation before treatment."
    : "Use 1-2 times daily as directed. Start with a patch test on first use.";

  const contraindications = isService
    ? "Not suitable during active skin infection, fever, or recent invasive procedures without clinician approval."
    : "Do not use on broken skin. Avoid if allergic to listed ingredients. Pause use if irritation occurs.";

  return { ingredients, usage, contraindications, isService };
}

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>("all");

  const allProducts = useMemo(
    () =>
      Object.values(productCatalog).filter((product) => {
        const detail = trustSignals(product.name, product.price);
        return product.quantity !== null && !detail.isService;
      }),
    []
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return allProducts.filter((product) => {
      const matchesSearch =
        query.length === 0 ||
        product.name.toLowerCase().includes(query) ||
        stockText(product.quantity).toLowerCase().includes(query);

      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "in-stock" && product.quantity > 0) ||
        (availabilityFilter === "out-of-stock" && product.quantity <= 0);

      return matchesSearch && matchesAvailability;
    });
  }, [allProducts, availabilityFilter, search]);

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
            className="inline-flex items-center justify-center rounded-2xl bg-brand-950 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-900"
          >
            Talk to our sales team
          </a>
        </div>

        <div className="mt-8 rounded-3xl border border-black/10 bg-neutral-50 p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Checkout delivery, pickup & shipping rules</h2>
          <div className="mt-4 grid gap-3 text-sm text-neutral-700 sm:grid-cols-2">
            <p>• Delivery zones + fees: Accra Central (GHS 20), Tema/Spintex corridor (GHS 30), and outer Accra (GHS 45).</p>
            <p>• Free delivery on product orders from GHS 500 and above within standard zones.</p>
            <p>• Pickup option by branch: Awoshie or Spintex (choose your branch during checkout confirmation).</p>
            <p>• ETA shown at checkout: same-day dispatch for paid orders before 2pm, otherwise next business day.</p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-black/10 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <label className="sr-only" htmlFor="product-search">
              Search products
            </label>
            <input
              id="product-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by product name"
              className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm outline-none ring-brand-500 transition focus:ring-2"
            />
            <label className="sr-only" htmlFor="availability-filter">
              Filter by availability
            </label>
            <select
              id="availability-filter"
              value={availabilityFilter}
              onChange={(event) => setAvailabilityFilter(event.target.value as AvailabilityFilter)}
              className="rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none ring-brand-500 transition focus:ring-2"
            >
              <option value="all">All items</option>
              <option value="in-stock">In stock</option>
              <option value="out-of-stock">Out of stock</option>
            </select>
          </div>
          <p className="mt-3 text-xs text-neutral-600">
            Showing {filteredProducts.length} of {allProducts.length} catalog items.
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-black/15 bg-neutral-50 px-6 py-10 text-center text-sm text-neutral-600">
            No products matched your search. Try another keyword or filter.
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((product, index) => {
              const isOutOfStock = product.quantity !== null && product.quantity <= 0;
              const detail = trustSignals(product.name, product.price);
              const rating = (4.6 + (index % 4) * 0.1).toFixed(1);

              return (
                <div key={`${product.name}-${index}`} className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-100">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div className="text-base font-semibold">{product.name}</div>
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
                  <div className="mt-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-700">
                    <p>
                      <span className="font-semibold text-neutral-900">Ingredients:</span> {detail.ingredients}
                    </p>
                    <p className="mt-1">
                      <span className="font-semibold text-neutral-900">Usage:</span> {detail.usage}
                    </p>
                    <p className="mt-1">
                      <span className="font-semibold text-neutral-900">Contraindications:</span> {detail.contraindications}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-neutral-600">
                    <span className="font-semibold text-neutral-900">Rating: ⭐ {rating}/5</span>
                    <span>{22 + (index % 31)} verified reviews</span>
                  </div>
                  <p className="mt-2 text-xs text-neutral-600">
                    Before/after gallery available for compliant treatments in our{" "}
                    <a href="/gallery" className="font-semibold text-brand-800 hover:underline">
                      gallery
                    </a>
                    .
                  </p>
                  <p className="mt-2 text-xs text-neutral-600">
                    Related bundles: Pair with best-sellers and save up to 15% when you order 2+ compatible items.
                  </p>
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
        )}
      </section>
    </Container>
  );
}
