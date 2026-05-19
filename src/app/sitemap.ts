import type { MetadataRoute } from "next";
import { getProductsCatalogData } from "@/lib/products";
import { getServicesCatalogData } from "@/lib/services";
import { getProductSlug } from "@/lib/productSeo";
import { getServiceSlug } from "@/lib/serviceSeo";

type StaticRoute = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

const baseUrl = new URL("https://www.glitteringmedspa.com");

const staticRoutes: StaticRoute[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/book", changeFrequency: "weekly", priority: 0.9 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.8 },
  { path: "/gallery", changeFrequency: "weekly", priority: 0.8 },
  { path: "/home", changeFrequency: "monthly", priority: 0.6 },
  { path: "/products", changeFrequency: "weekly", priority: 0.9 },
  { path: "/services", changeFrequency: "weekly", priority: 0.95 },
  { path: "/training", changeFrequency: "monthly", priority: 0.7 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.4 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.4 },
  { path: "/return-policy", changeFrequency: "yearly", priority: 0.4 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const [products, services] = await Promise.all([getProductsCatalogData(), getServicesCatalogData()]);

  const staticEntries = staticRoutes.map(({ path, changeFrequency, priority }) => ({
    url: new URL(path, baseUrl).toString(),
    lastModified,
    changeFrequency,
    priority,
  }));

  const productEntries = products
    .filter((product) => !product.isService)
    .map((product) => ({
      url: new URL(`/products/${getProductSlug(product)}`, baseUrl).toString(),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  const serviceEntries = services.map((service) => ({
    url: new URL(`/services/${getServiceSlug(service)}`, baseUrl).toString(),
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  return [...staticEntries, ...serviceEntries, ...productEntries];
}
