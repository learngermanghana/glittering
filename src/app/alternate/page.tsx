import type { Metadata } from "next";
import HomePage from "../page";

export const metadata: Metadata = {
  title: "Glittering Spa | Awoshie & Spintex",
  description: "Spa • Beauty • Salon • Nails in Awoshie and Spintex. Book on WhatsApp.",
  alternates: {
    canonical: "/",
  },
};

export default function AlternatePage() {
  return <HomePage />;
}
