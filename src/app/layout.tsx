import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { organizationJsonLd } from "@/lib/seo";
import { TeamAreaChromeToggle } from "@/components/TeamAreaChromeToggle";
import { LiveActivityToast } from "@/components/LiveActivityToast";

export const metadata: Metadata = {
  title: "Glittering Med Spa & Academy | Spa Services, Products and Beauty Training in Accra",
  description:
    "Book spa and beauty services, shop skincare and beauty products, or join Glittering Academy for professional beauty training in Awoshie and Spintex, Accra.",
  metadataBase: new URL("https://www.glitteringmedspa.com"),
  verification: {
    google: "Lu17AMVwA5S5K4aKY-tdyJtZAHV_ofPldi5xFdo8fWc",
  },
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
    "Glittering Academy",
    "med spa",
    "beauty products Accra",
    "skincare products Ghana",
    "beauty school Ghana",
    "beauty academy Accra",
    "nail training Ghana",
    "makeup training Ghana",
    "beauty salon",
    "nail salon",
    "Awoshie spa",
    "Spintex spa",
    "spa in Ghana",
    "Accra med spa",
    "massage",
    "facials",
  ],
  openGraph: {
    title: "Glittering Med Spa & Academy | Spa Services, Products and Beauty Training in Accra",
    description:
      "Book spa and beauty services, shop skincare and beauty products, or register for professional beauty training at Glittering Academy.",
    url: "https://www.glitteringmedspa.com",
    siteName: "Glittering Med Spa & Academy",
    images: [
      {
        url: "/logo-glittering.svg",
        width: 1200,
        height: 630,
        alt: "Glittering Med Spa & Academy",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Glittering Med Spa & Academy | Spa Services, Products and Beauty Training in Accra",
    description:
      "Book spa and beauty services, shop skincare and beauty products, or register for professional beauty training at Glittering Academy.",
    images: ["/logo-glittering.svg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationSchema = organizationJsonLd();

  return (
    <html lang="en">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8991390842894141"
          crossOrigin="anonymous"
        ></script>
      </head>
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

        <LiveActivityToast />

        <div data-site-chrome="floating-book" className="fixed bottom-5 right-5 z-50 flex flex-row gap-2">
          <Link href="/spa/book" className="rounded-full bg-rose-700 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-rose-200 hover:bg-rose-800">
            Book
          </Link>
          <Link href="/spa/products" className="rounded-full border border-rose-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-rose-900 shadow-lg shadow-rose-200 hover:bg-rose-50">
            Shop
          </Link>
          <Link href="/academy/register" className="rounded-full bg-rose-950 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-rose-200 hover:bg-black">
            Register
          </Link>
        </div>
      </body>
    </html>
  );
}
