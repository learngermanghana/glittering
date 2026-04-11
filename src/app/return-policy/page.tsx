import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { SITE } from "@/lib/site";

const pageTitle = `Return Policy | ${SITE.name}`;
const pageDescription = `Read the return policy for ${SITE.name}, including non-refundable booked services and product returns within 24 hours.`;

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    `${SITE.name} return policy`,
    "spa return policy",
    "service refund policy",
    "product return within 24 hours",
  ],
  alternates: {
    canonical: "/return-policy",
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "https://www.glitteringmedspa.com/return-policy",
    siteName: SITE.name,
    type: "article",
  },
  twitter: {
    card: "summary",
    title: pageTitle,
    description: pageDescription,
  },
};

export default function ReturnPolicyPage() {
  return (
    <Container>
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">Return Policy</h1>
          <p className="mt-3 text-sm text-neutral-600">Effective date: April 11, 2026</p>

          <div className="mt-8 space-y-6 text-neutral-700">
            <section>
              <h2 className="text-xl font-semibold text-neutral-900">1. Booked services are non-refundable</h2>
              <p className="mt-2 leading-7">
                All payments for booked services are non-refundable after confirmation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900">2. Product return window</h2>
              <p className="mt-2 leading-7">
                A return can be accepted for eligible products if the product was purchased within the last 24 hours.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900">3. Contact us for return requests</h2>
              <p className="mt-2 leading-7">
                To request a return, contact {SITE.name} by email at{" "}
                <a className="underline hover:text-neutral-900" href={`mailto:${SITE.email}`}>
                  {SITE.email}
                </a>{" "}
                or by phone at{" "}
                <a className="underline hover:text-neutral-900" href={`tel:+${SITE.phoneIntl}`}>
                  +{SITE.phoneIntl}
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </section>
    </Container>
  );
}
