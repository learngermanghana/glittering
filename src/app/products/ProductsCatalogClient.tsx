"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { SALES_WHATSAPP_LINK, SITE } from "@/lib/site";
import type { DisplayProduct } from "@/lib/productsData";

type AvailabilityFilter = "all" | "in-stock" | "out-of-stock";
const DESCRIPTION_PREVIEW_LENGTH = 180;

function stockText(quantity: number | null) {
  if (quantity === null) return "Out of stock";
  if (quantity <= 0) return "Out of stock";
  return `${quantity} in stock`;
}

export function ProductsCatalogClient({ products }: { products: DisplayProduct[] }) {
  const [search, setSearch] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>("all");
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});

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

  const notFoundWhatsappLink = useMemo(() => {
    const requestedProduct = search.trim();
    if (!requestedProduct) return SALES_WHATSAPP_LINK;

    return `https://wa.me/${SITE.phoneIntl}?text=${encodeURIComponent(
      `Hi Glittering Spa! I searched for "${requestedProduct}" on your website but could not find it. Please can you confirm if it is available in-store?`
    )}`;
  }, [search]);

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
          <p>No products matched your search. Try another keyword or filter.</p>
          <p className="mt-2">
            Some products may still be available in-store even if they are not listed online.
          </p>
          <a
            href={notFoundWhatsappLink}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center justify-center rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
          >
            Contact store on WhatsApp
          </a>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product, index) => {
            const cardKey = `${product.id ?? product.name}-${index}`;
            const isOutOfStock = product.quantity !== null && product.quantity <= 0;
            const productImages = (product.images.length ? product.images : [product.image]).slice(0, 3);
            const isSedifexImage = productImages[0]?.startsWith("http") ?? false;
            const description = product.description.trim();
            const hasLongDescription = description.length > DESCRIPTION_PREVIEW_LENGTH;
            const isExpanded = expandedDescriptions[cardKey] ?? false;
            const descriptionToShow = hasLongDescription && !isExpanded
              ? `${description.slice(0, DESCRIPTION_PREVIEW_LENGTH).trimEnd()}…`
              : description;

            return (
              <article
                key={cardKey}
                className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm"
                aria-label={product.name}
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-100">
                  <Image
                    src={productImages[0] ?? product.image}
                    alt={product.name}
                    fill
                    className={isSedifexImage ? "object-contain p-2" : "object-cover"}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                {productImages.length > 1 ? (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {productImages.map((imageSrc, imageIndex) => {
                      const isRemoteImage = imageSrc.startsWith("http");
                      return (
                        <div
                          key={`${product.id ?? product.name}-${imageSrc}-${imageIndex}`}
                          className="relative aspect-square overflow-hidden rounded-lg border border-black/10 bg-neutral-100"
                        >
                          <Image
                            src={imageSrc}
                            alt={`${product.name} photo ${imageIndex + 1}`}
                            fill
                            className={isRemoteImage ? "object-contain p-1" : "object-cover"}
                            sizes="80px"
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : null}
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
                  {description ? (
                    <>
                      <p className="leading-relaxed">{descriptionToShow}</p>
                      {hasLongDescription ? (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedDescriptions((previous) => ({
                              ...previous,
                              [cardKey]: !isExpanded,
                            }))
                          }
                          className="mt-2 inline-flex text-xs font-semibold text-brand-900 underline-offset-2 hover:underline"
                          aria-expanded={isExpanded}
                        >
                          {isExpanded ? "View less" : "View more"}
                        </button>
                      ) : null}
                    </>
                  ) : (
                    <p>
                      Contact the spa team for verified ingredients, usage directions, contraindications, and treatment suitability.
                    </p>
                  )}
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
