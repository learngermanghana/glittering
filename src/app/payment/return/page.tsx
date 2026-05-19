import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { ENQUIRIES_WHATSAPP_LINK, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `Payment Processing | ${SITE.name}`,
  description: `Your payment is being checked by ${SITE.name}. Final confirmation is completed after Sedifex verifies the payment status.`,
  alternates: {
    canonical: "/payment/return",
  },
  robots: {
    index: false,
    follow: false,
  },
};

type SearchParams = Record<string, string | string[] | undefined>;

type PaymentReturnPageProps = {
  searchParams?: Promise<SearchParams>;
};

function readParam(params: SearchParams | undefined, keys: string[]) {
  if (!params) return "";
  for (const key of keys) {
    const value = params[key];
    if (Array.isArray(value)) {
      const first = value.find((entry) => typeof entry === "string" && entry.trim());
      if (first) return first.trim();
    }
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export default async function PaymentReturnPage({ searchParams }: PaymentReturnPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const reference = readParam(params, ["reference", "trxref", "payment_reference", "paymentReference", "clientOrderId", "client_order_id"]);
  const bookingId = readParam(params, ["bookingId", "booking_id"]);

  return (
    <Container>
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-[32px] border border-black/10 bg-white shadow-sm">
          <div className="bg-[#ffe6ea] px-6 py-8 sm:px-10">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-600">Payment return</p>
            <h1 className="mt-3 text-3xl font-bold text-neutral-950 sm:text-4xl">Payment is being verified</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-700 sm:text-base">
              Thank you. We have received your return from Sedifex Checkout. This page does not mark your payment as
              confirmed by itself. Final confirmation happens after Sedifex verifies the payment status.
            </p>
          </div>

          <div className="grid gap-6 p-6 sm:p-10 lg:grid-cols-[1fr_0.9fr]">
            <div className="rounded-3xl border border-black/10 bg-neutral-50 p-5">
              <h2 className="text-lg font-semibold text-neutral-950">What happens next?</h2>
              <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-6 text-neutral-700">
                <li>Your booking was already created before checkout.</li>
                <li>Sedifex checks the final payment status securely.</li>
                <li>Once payment is confirmed, the booking can move from processing to confirmed.</li>
                <li>Our team may contact you by your selected contact method if anything needs attention.</li>
              </ol>

              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <p className="font-semibold">Please do not pay again immediately.</p>
                <p className="mt-1 leading-6">
                  If money has left your account but you do not receive confirmation right away, contact support with
                  your booking or payment reference.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-950">Reference details</h2>
              <div className="mt-4 space-y-3 text-sm text-neutral-700">
                <div className="rounded-2xl bg-neutral-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Payment / order reference</p>
                  <p className="mt-1 break-words font-semibold text-neutral-950">{reference || "Not provided in return URL"}</p>
                </div>
                <div className="rounded-2xl bg-neutral-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Booking ID</p>
                  <p className="mt-1 break-words font-semibold text-neutral-950">{bookingId || "Will be checked from Sedifex records"}</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link
                  href="/book"
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  Back to booking page
                </Link>
                <a
                  href={ENQUIRIES_WHATSAPP_LINK}
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
                >
                  Contact support on WhatsApp
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-black/10 bg-neutral-50 px-6 py-5 text-sm text-neutral-700 sm:px-10">
            <p className="font-semibold text-neutral-950">Need help?</p>
            <p className="mt-1 leading-6">
              WhatsApp/call: <a className="underline hover:text-neutral-950" href={`tel:+${SITE.phoneIntl}`}>+{SITE.phoneIntl}</a>{" "}
              · Email: <a className="underline hover:text-neutral-950" href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </p>
          </div>
        </div>
      </section>
    </Container>
  );
}
