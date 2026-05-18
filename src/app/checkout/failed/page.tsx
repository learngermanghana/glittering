"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

type Snapshot = {
  reference?: string;
  course?: string;
  courseName?: string;
  selectedCourse?: string;
  item?: string;
  items?: string;
  serviceName?: string;
};

function firstValue<T>(...values: Array<T | undefined | null>) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

function safeReadSnapshot() {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem("checkout:last_customer");
    return raw ? (JSON.parse(raw) as Snapshot) : null;
  } catch {
    return null;
  }
}

function buildWhatsAppLink(reference: string, course: string) {
  const message = [
    "Hi Glittering Spa, my checkout payment did not complete.",
    `Reference number: ${reference}`,
    `Course selected: ${course}`,
    "Please help me complete my training registration payment.",
  ].join("\n");

  return `https://wa.me/${SITE.phoneIntl}?text=${encodeURIComponent(message)}`;
}

function CheckoutFailedContent() {
  const search = useSearchParams();
  const snapshot = useMemo(() => safeReadSnapshot(), []);
  const reference = firstValue(
    search.get("reference"),
    search.get("trxref"),
    search.get("paymentReference"),
    snapshot?.reference,
    "Not available"
  ) as string;
  const courseSelected = firstValue(
    search.get("course"),
    search.get("courseName"),
    search.get("selectedCourse"),
    snapshot?.course,
    snapshot?.courseName,
    snapshot?.selectedCourse,
    snapshot?.serviceName,
    snapshot?.item,
    snapshot?.items,
    "Pending confirmation"
  ) as string;
  const whatsappLink = buildWhatsAppLink(reference, courseSelected);

  return (
    <section className="mx-auto max-w-4xl px-4 py-14 sm:py-20">
      <div className="overflow-hidden rounded-[32px] border border-rose-200 bg-white shadow-xl shadow-rose-950/5">
        <div className="bg-gradient-to-br from-rose-50 via-white to-neutral-50 px-6 py-10 sm:px-10">
          <p className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-rose-700">
            Payment not completed
          </p>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-neutral-950 sm:text-5xl">Payment failed</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-700">
            We could not confirm this checkout payment. Your card or mobile money wallet may not have been charged; if you received a debit alert, contact us with the reference below.
          </p>
        </div>

        <div className="grid gap-6 px-6 py-8 sm:px-10 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-4">
            <div className="rounded-3xl border border-black/10 bg-neutral-50 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Course selected</p>
              <p className="mt-2 text-xl font-bold text-neutral-950">{courseSelected}</p>
            </div>
            <div className="rounded-3xl border border-black/10 bg-neutral-50 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Reference number</p>
              <p className="mt-2 break-all font-mono text-lg font-bold text-neutral-950">{reference}</p>
            </div>
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
              <p className="font-bold">Please do not start a second payment if money has already left your account.</p>
              <p className="mt-2">Send us a WhatsApp message and we will verify the transaction before you try again.</p>
            </div>
          </div>

          <aside className="rounded-3xl bg-neutral-950 p-6 text-white">
            <h2 className="text-xl font-bold">What happens next</h2>
            <ol className="mt-5 space-y-4 text-sm leading-6 text-white/80">
              <li><strong className="text-white">1.</strong> If you were not charged, you can return to checkout and try again.</li>
              <li><strong className="text-white">2.</strong> If you were charged, message us with your reference number.</li>
              <li><strong className="text-white">3.</strong> Our team will confirm the transaction status and help complete your registration.</li>
            </ol>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-black text-neutral-950 transition hover:bg-emerald-300"
            >
              Contact us on WhatsApp
            </a>
            <Link
              href="/training"
              className="mt-3 inline-flex w-full items-center justify-center rounded-2xl border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Back to training page
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default function CheckoutFailedPage() {
  return (
    <Suspense fallback={<section className="mx-auto max-w-xl px-4 py-16 text-sm text-neutral-600">Loading checkout details…</section>}>
      <CheckoutFailedContent />
    </Suspense>
  );
}
