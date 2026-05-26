"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

type Snapshot = {
  name?: string;
  email?: string;
  phone?: string;
  reference?: string;
  amountPaid?: number;
  amount?: number;
  status?: string;
  course?: string;
  courseName?: string;
  selectedCourse?: string;
  item?: string;
  items?: string;
  serviceName?: string;
};

type Details = Record<string, unknown>;

function firstValue<T>(...values: Array<T | undefined | null>) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

function readString(record: Details | null, ...keys: string[]) {
  if (!record) return undefined;

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return undefined;
}

function readNumber(record: Details | null, ...keys: string[]) {
  if (!record) return undefined;

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }

  return undefined;
}

function readNestedString(record: Details | null, parentKey: string, ...keys: string[]) {
  const nested = record?.[parentKey];
  if (!nested || typeof nested !== "object" || Array.isArray(nested)) return undefined;
  return readString(nested as Details, ...keys);
}

function readItemsSummary(record: Details | null) {
  const items = record?.items ?? record?.cart;
  if (!Array.isArray(items)) return undefined;

  const summary = items
    .map((item) => {
      if (!item || typeof item !== "object") return undefined;
      const itemRecord = item as Details;
      const name = readString(itemRecord, "course", "courseName", "name", "serviceName", "title");
      if (!name) return undefined;
      const quantity = readNumber(itemRecord, "quantity", "qty");
      return quantity && quantity > 1 ? `${name} x${quantity}` : name;
    })
    .filter(Boolean)
    .join(", ");

  return summary || undefined;
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

function normalizeStatus(value?: string) {
  return (value || "").trim().toLowerCase();
}

function isConfirmedStatus(value?: string) {
  const normalized = normalizeStatus(value);
  return ["success", "paid", "paid_cash", "confirmed", "captured", "completed", "delivered"].includes(normalized);
}

function isFailedStatus(value?: string) {
  const normalized = normalizeStatus(value);
  return ["failed", "payment_failed", "cancelled", "canceled", "abandoned"].includes(normalized);
}

function formatStatus(value?: string) {
  if (!value) return "Checking payment";
  const normalized = normalizeStatus(value);
  if (isConfirmedStatus(normalized)) return "Confirmed";
  if (["pending", "pending_payment", "checkout_created", "syncing", "processing"].includes(normalized)) return "Pending payment";
  if (isFailedStatus(normalized)) return "Payment failed";
  return value.replace(/_/g, " ");
}

function formatPhone(value?: string) {
  const phone = typeof value === "string" ? value.trim() : "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 9 || digits.length > 15) return "Pending";
  return phone;
}

function buildWhatsAppLink(reference: string, course: string, confirmed: boolean) {
  const message = [
    confirmed ? "Hi Glittering Spa, my payment has been confirmed." : "Hi Glittering Spa, I opened checkout and need payment confirmation.",
    `Reference number: ${reference}`,
    `Item selected: ${course}`,
    confirmed ? "Please confirm the next steps." : "Please help me confirm whether the payment has succeeded.",
  ].join("\n");

  return `https://wa.me/${SITE.phoneIntl}?text=${encodeURIComponent(message)}`;
}

function CheckoutSuccessContent() {
  const search = useSearchParams();
  const [details, setDetails] = useState<Details | null>(null);
  const [snapshot] = useState<Snapshot | null>(() => safeReadSnapshot());

  const urlReference = search.get("reference") ?? search.get("trxref") ?? search.get("paymentReference") ?? undefined;

  useEffect(() => {
    if (!urlReference) return;
    fetch(`/api/sedifex/order-status?reference=${encodeURIComponent(urlReference)}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setDetails(data))
      .catch(() => null);
  }, [urlReference]);

  const receiptReference = useMemo(
    () =>
      firstValue(
        readString(details, "reference", "paymentReference", "payment_reference", "paystackReference", "clientOrderId"),
        urlReference,
        snapshot?.reference,
        "Pending"
      ) as string,
    [details, snapshot, urlReference]
  );

  const courseSelected = useMemo(
    () =>
      firstValue(
        search.get("course"),
        search.get("courseName"),
        search.get("selectedCourse"),
        readString(details, "course", "courseName", "selectedCourse", "serviceName", "item", "items", "itemName", "productName"),
        readNestedString(details, "metadata", "course", "courseName", "selectedCourse", "serviceName", "itemName", "productName"),
        readNestedString(details, "attributes", "course", "courseName", "selectedCourse", "serviceName"),
        readItemsSummary(details),
        snapshot?.course,
        snapshot?.courseName,
        snapshot?.selectedCourse,
        snapshot?.serviceName,
        snapshot?.item,
        snapshot?.items,
        "Pending confirmation"
      ) as string,
    [details, search, snapshot]
  );

  const amountPaid = firstValue(
    readNumber(details, "amountPaid", "amount_paid", "amount", "confirmedAmount"),
    snapshot?.amountPaid,
    snapshot?.amount
  );
  const rawStatus = firstValue(
    readString(details, "paymentStatus", "payment_status", "status", "orderStatus", "order_status", "syncStatus", "sync_status"),
    snapshot?.status
  ) as string | undefined;
  const confirmed = isConfirmedStatus(rawStatus);
  const failed = isFailedStatus(rawStatus);
  const status = formatStatus(rawStatus);
  const whatsappLink = buildWhatsAppLink(receiptReference, courseSelected, confirmed);

  return (
    <section className="mx-auto max-w-4xl px-4 py-14 sm:py-20">
      <div className={`overflow-hidden rounded-[32px] border bg-white shadow-xl ${confirmed ? "border-emerald-200 shadow-emerald-950/5" : failed ? "border-red-200 shadow-red-950/5" : "border-amber-200 shadow-amber-950/5"}`}>
        <div className={`px-6 py-10 sm:px-10 ${confirmed ? "bg-gradient-to-br from-emerald-50 via-white to-brand-50" : failed ? "bg-gradient-to-br from-red-50 via-white to-neutral-50" : "bg-gradient-to-br from-amber-50 via-white to-neutral-50"}`}>
          <p className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] ${confirmed ? "bg-emerald-100 text-emerald-700" : failed ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
            {confirmed ? "Receipt confirmed" : failed ? "Payment not completed" : "Payment pending"}
          </p>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-neutral-950 sm:text-5xl">
            {confirmed ? "Payment received" : failed ? "Payment not completed" : "Payment is being verified"}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-700">
            {confirmed
              ? `Thank you${snapshot?.name ? `, ${snapshot.name}` : ""}. Your payment has been confirmed and this page can be used as your receipt.`
              : failed
                ? "Your payment was cancelled or could not be completed. Please try again or contact us for assistance."
                : "Your checkout has been opened, but the payment has not been confirmed yet. Please do not treat this page as a paid receipt until the status changes to Confirmed."}
          </p>
        </div>

        <div className="grid gap-6 px-6 py-8 sm:px-10 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-4">
            <div className="rounded-3xl border border-black/10 bg-neutral-50 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Item selected</p>
              <p className="mt-2 text-xl font-bold text-neutral-950">{courseSelected}</p>
            </div>
            <div className="rounded-3xl border border-black/10 bg-neutral-50 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Reference number</p>
              <p className="mt-2 break-all font-mono text-lg font-bold text-neutral-950">{receiptReference}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-black/10 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">{confirmed ? "Amount paid" : "Amount"}</p>
                <p className="mt-2 text-lg font-bold text-neutral-950">
                  {typeof amountPaid === "number" ? `GH₵${amountPaid.toFixed(2)}` : "Pending sync"}
                </p>
              </div>
              <div className="rounded-3xl border border-black/10 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Status</p>
                <p className={`mt-2 text-lg font-bold ${confirmed ? "text-emerald-700" : failed ? "text-red-700" : "text-amber-700"}`}>{status}</p>
              </div>
            </div>
          </div>

          <aside className="rounded-3xl bg-neutral-950 p-6 text-white">
            <h2 className="text-xl font-bold">What happens next</h2>
            <ol className="mt-5 space-y-4 text-sm leading-6 text-white/80">
              {confirmed ? (
                <>
                  <li><strong className="text-white">1.</strong> Keep this reference number as your receipt.</li>
                  <li><strong className="text-white">2.</strong> Our team will contact you with the next steps.</li>
                  <li><strong className="text-white">3.</strong> Contact us on WhatsApp if you need help.</li>
                </>
              ) : (
                <>
                  <li><strong className="text-white">1.</strong> Complete the Paystack payment page if it is still open.</li>
                  <li><strong className="text-white">2.</strong> Wait for Sedifex to confirm the final payment status.</li>
                  <li><strong className="text-white">3.</strong> This becomes a receipt only after the status shows Confirmed.</li>
                </>
              )}
            </ol>
            <div className="mt-6 rounded-2xl bg-white/10 p-4 text-sm text-white/80">
              <p><strong className="text-white">Phone:</strong> {formatPhone(snapshot?.phone)}</p>
              <p className="mt-1"><strong className="text-white">Email:</strong> {snapshot?.email || "Pending"}</p>
            </div>
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

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<section className="mx-auto max-w-xl px-4 py-16 text-sm text-neutral-600">Loading your payment details…</section>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
