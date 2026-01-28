import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.cdninstagram.com" },
      { protocol: "https", hostname: "**.fbcdn.net" },
    ],
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
