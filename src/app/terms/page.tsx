import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { SITE } from "@/lib/site";

const pageTitle = `Terms & Conditions | ${SITE.name}`;
const pageDescription = `Read the Terms and Conditions for ${SITE.name}, including bookings, cancellations, payments, and service usage rules.`;

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    `${SITE.name} terms and conditions`,
    "spa terms",
    "booking terms",
    "cancellation policy",
    "Ghana med spa terms",
  ],
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "https://www.glitteringmedspa.com/terms",
    siteName: SITE.name,
    type: "article",
  },
  twitter: {
    card: "summary",
    title: pageTitle,
    description: pageDescription,
  },
};

export default function TermsPage() {
  return (
    <Container>
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">Terms &amp; Conditions</h1>
          <p className="mt-3 text-sm text-neutral-600">Effective date: April 8, 2026</p>
          <p className="mt-4 text-neutral-700 leading-7">
            These Terms &amp; Conditions govern your use of the {SITE.name} website and services. By booking an
            appointment or using our site, you agree to these terms.
          </p>

          <div className="mt-8 space-y-6 text-neutral-700">
            <section>
              <h2 className="text-xl font-semibold text-neutral-900">1. Appointments and bookings</h2>
              <p className="mt-2 leading-7">
                Bookings are subject to availability. You are responsible for providing accurate contact details so we
                can confirm and manage your appointment.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900">2. Payments</h2>
              <p className="mt-2 leading-7">
                Prices for services and products may change without prior notice. Payment is due at the time stated by
                {" "}
                {SITE.name}, and we may refuse service for incomplete or failed payments.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900">3. Cancellations and rescheduling</h2>
              <p className="mt-2 leading-7">
                If you need to cancel or reschedule, please notify us as early as possible. Repeated no-shows or late
                cancellations may affect future booking access.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900">4. Health and safety</h2>
              <p className="mt-2 leading-7">
                Please disclose any relevant health concerns before treatment. {SITE.name} may decline, modify, or
                postpone services if we determine a treatment is not suitable or safe.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900">5. Website use</h2>
              <p className="mt-2 leading-7">
                You agree not to misuse this website, interfere with its operation, or use its content for unlawful
                purposes. All website content is owned by or licensed to {SITE.name}.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900">6. Privacy</h2>
              <p className="mt-2 leading-7">
                Your use of our services is also governed by our <Link className="underline hover:text-neutral-900" href="/privacy">Privacy Policy</Link> and <Link className="underline hover:text-neutral-900" href="/return-policy">Return Policy</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900">7. Contact information</h2>
              <p className="mt-2 leading-7">
                For questions about these terms, email{" "}
                <a className="underline hover:text-neutral-900" href={`mailto:${SITE.email}`}>
                  {SITE.email}
                </a>{" "}
                or call{" "}
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
