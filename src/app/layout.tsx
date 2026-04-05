import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { organizationJsonLd } from "@/lib/seo";
import { TeamAreaChromeToggle } from "@/components/TeamAreaChromeToggle";

export const metadata: Metadata = {
  title: "Glittering Spa Ghana | Med Spa in Awoshie & Spintex, Accra",
  description: "Glittering Spa is a premium med spa in Ghana with branches in Awoshie and Spintex, Accra. Book spa, beauty, salon, nails, facials, massage, and wellness services on WhatsApp.",
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
  keywords: [
    "Glittering Spa",
    "med spa",
    "beauty salon",
    "nail salon",
    "Awoshie spa",
    "Spintex spa",
    "spa in Ghana",
    "Accra med spa",
    "beauty salon Accra",
    "massage",
    "facials",
  ],
  openGraph: {
    title: "Glittering Spa Ghana | Med Spa in Awoshie & Spintex, Accra",
    description: "Glittering Spa is a premium med spa in Ghana with branches in Awoshie and Spintex, Accra. Book spa, beauty, salon, nails, facials, massage, and wellness services on WhatsApp.",
    url: "https://www.glitteringmedspa.com",
    siteName: "Glittering Spa",
    images: [
      {
        url: "/logo-glittering.svg",
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
    title: "Glittering Spa Ghana | Med Spa in Awoshie & Spintex, Accra",
    description: "Glittering Spa is a premium med spa in Ghana with branches in Awoshie and Spintex, Accra. Book spa, beauty, salon, nails, facials, massage, and wellness services on WhatsApp.",
    images: ["/logo-glittering.svg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationSchema = organizationJsonLd();

  return (
    <html lang="en">
      <body className="min-h-screen bg-rose-100 text-rose-950 antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <TeamAreaChromeToggle />
        <div data-site-chrome="navbar">
          <Navbar />
        </div>
        <main className="min-h-[70vh]">{children}</main>
        <div data-site-chrome="footer">
          <Footer />
        </div>

        <Link
          data-site-chrome="floating-book"
          href="https://www.glitteringmedspa.com/book"
          className="fixed bottom-5 right-5 z-50 rounded-full bg-rose-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-200 hover:bg-rose-800"
        >
          Book Now
        </Link>
      </body>
    </html>
  );
}
