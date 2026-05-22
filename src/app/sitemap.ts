import type { MetadataRoute } from "next";
import { getProductsCatalogData } from "@/lib/products";
import { getProductSlug } from "@/lib/productSeo";

type StaticRoute = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

const baseUrl = new URL("https://www.glitteringmedspa.com");

const staticRoutes: StaticRoute[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/spa", changeFrequency: "weekly", priority: 0.95 },
  { path: "/spa/book", changeFrequency: "weekly", priority: 0.9 },
  { path: "/spa/services", changeFrequency: "weekly", priority: 0.9 },
  { path: "/spa/products", changeFrequency: "weekly", priority: 0.9 },
  { path: "/spa/gallery", changeFrequency: "weekly", priority: 0.8 },
  { path: "/academy", changeFrequency: "weekly", priority: 0.95 },
  { path: "/academy/courses", changeFrequency: "weekly", priority: 0.9 },
  { path: "/academy/register", changeFrequency: "monthly", priority: 0.85 },
  { path: "/academy/fees", changeFrequency: "monthly", priority: 0.75 },
  { path: "/academy/gallery", changeFrequency: "monthly", priority: 0.75 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.8 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.4 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.4 },
  { path: "/return-policy", changeFrequency: "yearly", priority: 0.4 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const products = await getProductsCatalogData();

  const staticEntries = staticRoutes.map(({ path, changeFrequency, priority }) => ({
    url: new URL(path, baseUrl).toString(),
    lastModified,
    changeFrequency,
    priority,
  }));

  const productEntries = products
    .filter((product) => !product.isService)
    .map((product) => ({
      url: new URL(`/spa/products/${getProductSlug(product)}`, baseUrl).toString(),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  return [...staticEntries, ...productEntries];
}
