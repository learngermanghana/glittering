import path from "path";
import { fileURLToPath } from "url";

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.cdninstagram.com" },
      { protocol: "https", hostname: "**.fbcdn.net" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "**.sedifex.com" },
    ],
  },
  turbopack: {
    root: path.dirname(fileURLToPath(import.meta.url)),
  },
  async redirects() {
    return [
      { source: "/index", destination: "/", permanent: true },
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/home", destination: "/", permanent: true },
      { source: "/home/", destination: "/", permanent: true },
      { source: "/about.html", destination: "/about", permanent: true },
      { source: "/book.html", destination: "/book", permanent: true },
      { source: "/contact.html", destination: "/contact", permanent: true },
      { source: "/gallery.html", destination: "/gallery", permanent: true },
      { source: "/products.html", destination: "/products", permanent: true },
      { source: "/services.html", destination: "/services", permanent: true },
      { source: "/training.html", destination: "/training", permanent: true },
      { source: "/the-story.html", destination: "/the-story", permanent: true },
    ];
  },
};

export default nextConfig;
