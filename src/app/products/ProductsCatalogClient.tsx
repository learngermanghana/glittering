"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { SALES_WHATSAPP_LINK, SITE } from "@/lib/site";
import type { DisplayProduct } from "@/lib/productsData";
import { EngagementPanel } from "@/components/EngagementPanel";

type AvailabilityFilter = "all" | "in-stock" | "out-of-stock";
const DESCRIPTION_PREVIEW_LENGTH = 180;
const SEARCH_HISTORY_KEY = "products-search-history";
const MAX_HISTORY_ITEMS = 6;
const MAX_SUGGESTIONS = 8;

const SEARCH_SYNONYMS: Record<string, string[]> = {
  sneakers: ["shoe", "shoes", "trainer", "trainers", "footwear"],
  sandals: ["slipper", "slippers", "flip flops", "slides"],
  adidas: ["adiddas", "addidas", "addidas", "adi das"],
  nike: ["naik", "nik", "nyke"],
  face: ["facial", "facials", "skincare", "skin care"],
};

function levenshteinDistance(first: string, second: string) {
  if (first === second) return 0;
  if (!first.length) return second.length;
  if (!second.length) return first.length;

  const previousRow = Array.from({ length: second.length + 1 }, (_, index) => index);

  for (let i = 0; i < first.length; i += 1) {
    let prevDiagonal = previousRow[0];
    previousRow[0] = i + 1;

    for (let j = 0; j < second.length; j += 1) {
      const temp = previousRow[j + 1];
      const substitutionCost = first[i] === second[j] ? 0 : 1;
      previousRow[j + 1] = Math.min(previousRow[j + 1] + 1, previousRow[j] + 1, prevDiagonal + substitutionCost);
      prevDiagonal = temp;
    }
  }

  return previousRow[second.length];
}

function stockText(quantity: number | null) {
  if (quantity === null) return "Out of stock";
  if (quantity <= 0) return "Out of stock";
  return `${quantity} in stock`;
}

export function ProductsCatalogClient({ products }: { products: DisplayProduct[] }) {
  const [search, setSearch] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const persistedSearches = globalThis.localStorage?.getItem(SEARCH_HISTORY_KEY);
      if (!persistedSearches) return [];
      const parsed = JSON.parse(persistedSearches) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        .slice(0, MAX_HISTORY_ITEMS);
    } catch {
      globalThis.localStorage?.removeItem(SEARCH_HISTORY_KEY);
      return [];
    }
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>("all");
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});

  const allProducts = useMemo(() => products.filter((product) => !product.isService), [products]);

  const searchableTokens = useMemo(() => {
    const tokens = new Set<string>();

    allProducts.forEach((product) => {
      product.name
        .toLowerCase()
        .split(/\s+/)
        .forEach((token) => {
          if (token.length > 2) tokens.add(token);
        });
    });

    Object.entries(SEARCH_SYNONYMS).forEach(([rootWord, synonyms]) => {
      tokens.add(rootWord);
      synonyms.forEach((synonym) => tokens.add(synonym.toLowerCase()));
    });

    return [...tokens];
  }, [allProducts]);

  function saveSearchToHistory(query: string) {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return;

    setRecentSearches((previous) => {
      const next = [normalizedQuery, ...previous.filter((item) => item.toLowerCase() !== normalizedQuery.toLowerCase())].slice(
        0,
        MAX_HISTORY_ITEMS
      );

      globalThis.localStorage?.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }

  const suggestions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return recentSearches;

    const exactProductMatches = allProducts
      .map((product) => product.name)
      .filter((name) => name.toLowerCase().includes(query));

    const synonymMatches = Object.entries(SEARCH_SYNONYMS)
      .filter(([rootWord, synonyms]) => rootWord.includes(query) || synonyms.some((synonym) => synonym.includes(query)))
      .map(([rootWord]) => rootWord);

    const typoSuggestions = searchableTokens
      .filter((token) => {
        if (token.length < 4 || query.length < 4) return false;
        return levenshteinDistance(query, token) <= 2;
      })
      .slice(0, 3);

    return [...new Set([...exactProductMatches, ...synonymMatches, ...typoSuggestions, ...recentSearches])].slice(0, MAX_SUGGESTIONS);
  }, [allProducts, recentSearches, search, searchableTokens]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const synonymExpandedQuery = new Set<string>([query]);
    Object.entries(SEARCH_SYNONYMS).forEach(([rootWord, synonyms]) => {
      if (query === rootWord || synonyms.some((synonym) => synonym.includes(query) || query.includes(synonym))) {
        synonymExpandedQuery.add(rootWord);
        synonyms.forEach((synonym) => synonymExpandedQuery.add(synonym));
      }
    });

    return allProducts.filter((product) => {
      const productName = product.name.toLowerCase();
      const productMatchByTypo = query.length < 4
        ? false
        : productName.split(/\s+/).some((token) => levenshteinDistance(query, token) <= 2);

      const matchesSearch =
        query.length === 0 ||
        [...synonymExpandedQuery].some((searchTerm) =>
          productName.includes(searchTerm) || stockText(product.quantity).toLowerCase().includes(searchTerm)
        ) ||
        productMatchByTypo;

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
          <div className="relative">
          <input
            id="product-search"
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              globalThis.setTimeout(() => {
                setShowSuggestions(false);
                saveSearchToHistory(search);
              }, 120);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                saveSearchToHistory(search);
                setShowSuggestions(false);
              }
            }}
            placeholder="Search by product name"
            className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm outline-none ring-brand-500 transition focus:ring-2"
          />
          {showSuggestions && suggestions.length > 0 ? (
            <div className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-2xl border border-neutral-200 bg-white p-1 shadow-lg">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setSearch(suggestion);
                    saveSearchToHistory(suggestion);
                    setShowSuggestions(false);
                  }}
                  className="block w-full rounded-xl px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          ) : null}
          </div>
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
                <EngagementPanel sourceProductId={product.id ?? cardKey} label={product.name} />
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
