"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { WHATSAPP_LINK } from "@/lib/site";
import type { DisplayService } from "@/lib/services";

const priceFormatter = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  minimumFractionDigits: 2,
});

const DESCRIPTION_TRUNCATE_LENGTH = 140;

type ServicesCatalogClientProps = {
  services: DisplayService[];
};

export function ServicesCatalogClient({ services }: ServicesCatalogClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("featured");
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(services.map((service) => service.category).filter(Boolean)));
    return ["All", ...uniqueCategories.sort((a, b) => a.localeCompare(b))];
  }, [services]);

  const filteredServices = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = services.filter((service) => {
      const matchesCategory = selectedCategory === "All" || service.category === selectedCategory;

      const matchesSearch =
        normalizedSearch.length === 0 ||
        service.name.toLowerCase().includes(normalizedSearch) ||
        service.category.toLowerCase().includes(normalizedSearch) ||
        service.description.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });

    if (sortOrder === "price-low") {
      return [...filtered].sort((a, b) => a.price - b.price);
    }

    if (sortOrder === "price-high") {
      return [...filtered].sort((a, b) => b.price - a.price);
    }

    if (sortOrder === "name") {
      return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [searchTerm, selectedCategory, services, sortOrder]);

  const toggleDescription = (serviceKey: string) => {
    setExpandedDescriptions((current) => ({
      ...current,
      [serviceKey]: !current[serviceKey],
    }));
  };

  return (
    <>
      <div className="mt-4 rounded-3xl border border-black/10 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr]">
          <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
            Search services
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by service, category, or description"
              className="w-full rounded-2xl border border-neutral-300 px-3 py-2 text-sm font-normal text-neutral-900 outline-none transition focus:border-neutral-500"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
            Filter by category
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="w-full rounded-2xl border border-neutral-300 bg-white px-3 py-2 text-sm font-normal text-neutral-900 outline-none transition focus:border-neutral-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
            Sort
            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              className="w-full rounded-2xl border border-neutral-300 bg-white px-3 py-2 text-sm font-normal text-neutral-900 outline-none transition focus:border-neutral-500"
            >
              <option value="featured">Featured</option>
              <option value="name">Name (A-Z)</option>
              <option value="price-low">Price (Low to High)</option>
              <option value="price-high">Price (High to Low)</option>
            </select>
          </label>
        </div>

        <p className="mt-3 text-xs text-neutral-500">
          Showing {filteredServices.length} of {services.length} services
        </p>
      </div>

      {filteredServices.length ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service, index) => {
            const serviceKey = `${service.id ?? service.name}-${index}`;
            const hasLongDescription = service.description.length > DESCRIPTION_TRUNCATE_LENGTH;
            const isExpanded = !!expandedDescriptions[serviceKey];
            const displayDescription =
              hasLongDescription && !isExpanded
                ? `${service.description.slice(0, DESCRIPTION_TRUNCATE_LENGTH).trim()}...`
                : service.description;

            return (
              <article
                key={serviceKey}
                className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-100">
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>

                <div className="mt-4 flex items-start justify-between gap-3">
                  <h2 className="text-base font-semibold">{service.name}</h2>
                  <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-900">
                    {priceFormatter.format(service.price)}
                  </span>
                </div>

                <div className="mt-2 inline-flex rounded-full border border-black/10 bg-neutral-50 px-2.5 py-1 text-xs font-semibold text-neutral-700">
                  {service.category}
                </div>

                <div className="mt-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                  <p className="text-sm leading-relaxed text-neutral-700">
                    {displayDescription || "Contact the spa team for more service details."}
                  </p>

                  {hasLongDescription ? (
                    <button
                      type="button"
                      onClick={() => toggleDescription(serviceKey)}
                      className="mt-2 text-xs font-semibold text-neutral-800 underline-offset-2 hover:underline"
                    >
                      {isExpanded ? "Read less" : "Read more"}
                    </button>
                  ) : null}
                </div>

                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
                >
                  Book this service
                </a>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-600">
          No services match your current search and filters. Try a broader keyword or choose &quot;All&quot; categories.
        </div>
      )}
    </>
  );
}
