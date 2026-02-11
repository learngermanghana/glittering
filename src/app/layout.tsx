import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Glittering Spa | Awoshie & Spintex",
  description: "Spa • Beauty • Salon • Nails in Awoshie and Spintex. Book on WhatsApp.",
  metadataBase: new URL("https://www.glitteringmedspa.com"),
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  keywords: [
    "Glittering Spa",
    "med spa",
    "beauty salon",
    "nail salon",
    "Awoshie spa",
    "Spintex spa",
    "massage",
    "facials",
  ],
  openGraph: {
    title: "Glittering Spa | Awoshie & Spintex",
    description: "Spa • Beauty • Salon • Nails in Awoshie and Spintex. Book on WhatsApp.",
    url: "https://www.glitteringmedspa.com",
    siteName: "Glittering Spa",
    images: [
      {
        url: "/globe.svg",
        width: 1200,
        height: 630,
        alt: "Glittering Spa",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Glittering Spa | Awoshie & Spintex",
    description: "Spa • Beauty • Salon • Nails in Awoshie and Spintex. Book on WhatsApp.",
    images: ["/globe.svg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-rose-100 text-rose-950 antialiased">
        <Navbar />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />

        <Link
          href="https://www.glitteringmedspa.com/book"
          className="fixed bottom-5 right-5 z-50 rounded-full bg-rose-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-200 hover:bg-rose-800"
        >
          Book Now
        </Link>
      </body>
    </html>
  );
}
