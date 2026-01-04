import type { MetadataRoute } from "next";

const baseUrl = new URL("https://www.glitteringmedspa.com");

const routes = [
  "",
  "/about",
  "/book",
  "/contact",
  "/gallery",
  "/packages",
  "/services",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: new URL(route, baseUrl).toString(),
    lastModified: new Date(),
  }));
}
