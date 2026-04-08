import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { SITE } from "@/lib/site";

const pageTitle = `Privacy Policy | ${SITE.name}`;
const pageDescription = `Read the official privacy policy for ${SITE.name}. Learn what information we collect, how we use it, and how to contact us about your data.`;

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    `${SITE.name} privacy policy`,
    "spa privacy policy",
    "data protection",
    "customer privacy",
    "Ghana med spa privacy",
  ],
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "https://www.glitteringmedspa.com/privacy",
    siteName: SITE.name,
    type: "article",
  },
  twitter: {
    card: "summary",
    title: pageTitle,
    description: pageDescription,
  },
};

export default function PrivacyPage() {
  return (
    <Container>
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">Privacy Policy</h1>
          <p className="mt-3 text-sm text-neutral-600">Effective date: April 8, 2026</p>
          <p className="mt-4 text-neutral-700 leading-7">
            This Privacy Policy explains how {SITE.name} (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) collects, uses, stores, and
            protects personal information when you use our website and services.
          </p>

          <div className="mt-8 space-y-6 text-neutral-700">
            <section>
              <h2 className="text-xl font-semibold text-neutral-900">1. Information we collect</h2>
              <p className="mt-2 leading-7">
                We may collect your name, phone number, email address, booking details, service preferences, and any
                messages you send through our website, WhatsApp, phone calls, or email.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900">2. How we use your information</h2>
              <p className="mt-2 leading-7">We use your information to:</p>
              <ul className="mt-2 list-disc space-y-1 pl-6 leading-7">
                <li>Confirm and manage bookings.</li>
                <li>Respond to customer support requests.</li>
                <li>Provide service updates and appointment reminders.</li>
                <li>Improve service quality, customer experience, and website performance.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900">3. Data sharing</h2>
              <p className="mt-2 leading-7">
                {SITE.name} does not sell your personal data. We may share limited information with trusted service
                providers only when needed to operate our website, communications, or booking systems.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900">4. Data retention and protection</h2>
              <p className="mt-2 leading-7">
                We keep personal data only as long as necessary for service delivery, legal compliance, and record
                keeping. We use reasonable technical and organizational safeguards to protect your information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900">5. Your privacy rights</h2>
              <p className="mt-2 leading-7">
                You can request access, correction, or deletion of your personal information by contacting us. We will
                respond within a reasonable time and according to applicable laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900">6. Contact us</h2>
              <p className="mt-2 leading-7">
                For privacy questions, contact {SITE.name} at{" "}
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
