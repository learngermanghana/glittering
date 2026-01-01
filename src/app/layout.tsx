import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Glittering Spa | Spa • Beauty • Salon • Nails (Awoshie)",
  description:
    "Glittering Spa in Awoshie (Baah Yard). Spa • Beauty • Salon • Nails. Book easily on WhatsApp.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-neutral-50 antialiased">
        {children}
      </body>
    </html>
  );
}
