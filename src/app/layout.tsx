import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WHATSAPP_LINK } from "@/lib/site";

export const metadata: Metadata = {
  title: "Glittering Spa | Awoshie",
  description: "Spa • Beauty • Salon • Nails in Awoshie (Baah Yard). Book on WhatsApp.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        <Navbar />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />

        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-5 right-5 z-50 rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-neutral-800"
        >
          WhatsApp Booking
        </a>
      </body>
    </html>
  );
}
