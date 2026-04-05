"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { SALES_WHATSAPP_LINK } from "@/lib/site";
import type { DisplayProduct } from "@/lib/productsData";

type AvailabilityFilter = "all" | "in-stock" | "out-of-stock";

function stockText(quantity: number | null) {
  if (quantity === null) return "Out of stock";
  if (quantity <= 0) return "Out of stock";
  return `${quantity} in stock`;
}

export function ProductsCatalogClient({ products }: { products: DisplayProduct[] }) {
  const [search, setSearch] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>("all");

  const allProducts = useMemo(() => products.filter((product) => !product.isService), [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return allProducts.filter((product) => {
      const matchesSearch =
        query.length === 0 ||
        product.name.toLowerCase().includes(query) ||
        stockText(product.quantity).toLowerCase().includes(query);

      const quantity = product.quantity ?? 0;
      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "in-stock" && quantity > 0) ||
        (availabilityFilter === "out-of-stock" && quantity <= 0);

      return matchesSearch && matchesAvailability;
    });
  }, [allProducts, availabilityFilter, search]);

  return (
    <>
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
            const isSedifexImage = product.image.startsWith("http");

            return (
              <article
                key={`${product.id ?? product.name}-${index}`}
                className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm"
                aria-label={product.name}
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-100">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className={isSedifexImage ? "object-contain p-2" : "object-cover"}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <h2 className="text-base font-semibold">{product.name}</h2>
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
                    This listing is synced from Sedifex inventory data.
                  </p>
                  <p className="mt-1">
                    Contact the spa team for verified ingredients, usage directions, contraindications, and treatment suitability.
                  </p>
                </div>
                <a
                  href={SALES_WHATSAPP_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
                >
                  Ask about this product
                </a>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
