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

function formatStatus(value?: string) {
  if (!value) return "Syncing";
  const normalized = value.trim().toLowerCase();
  if (["success", "paid", "confirmed", "captured"].includes(normalized)) return "Confirmed";
  if (["pending", "pending_payment", "syncing"].includes(normalized)) return "Syncing";
  if (["failed", "payment_failed"].includes(normalized)) return "Payment failed";
  return value.replace(/_/g, " ");
}

function formatPhone(value?: string) {
  const phone = typeof value === "string" ? value.trim() : "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 9 || digits.length > 15) return "Pending";
  return phone;
}

function buildWhatsAppLink(reference: string, course: string) {
  const message = [
    "Hi Glittering Spa, my payment has been received.",
    `Reference number: ${reference}`,
    `Course selected: ${course}`,
    "Please confirm the next steps for my training registration.",
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
    fetch(`/api/sedifex/orders/${encodeURIComponent(urlReference)}`, { cache: "no-store" })
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
        readString(details, "course", "courseName", "selectedCourse", "serviceName", "item", "items"),
        readNestedString(details, "metadata", "course", "courseName", "selectedCourse", "serviceName"),
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
    readNumber(details, "amountPaid", "amount_paid", "amount"),
    snapshot?.amountPaid,
    snapshot?.amount
  );
  const status = formatStatus(
    firstValue(
      readString(details, "status", "orderStatus", "order_status", "paymentStatus", "payment_status", "syncStatus", "sync_status"),
      snapshot?.status
    ) as string | undefined
  );
  const whatsappLink = buildWhatsAppLink(receiptReference, courseSelected);

  return (
    <section className="mx-auto max-w-4xl px-4 py-14 sm:py-20">
      <div className="overflow-hidden rounded-[32px] border border-emerald-200 bg-white shadow-xl shadow-emerald-950/5">
        <div className="bg-gradient-to-br from-emerald-50 via-white to-brand-50 px-6 py-10 sm:px-10">
          <p className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-emerald-700">
            Payment received
          </p>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-neutral-950 sm:text-5xl">Payment received</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-700">
            Thank you{snapshot?.name ? `, ${snapshot.name}` : ""}. Your checkout was completed and your training registration is now in our follow-up queue.
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
              <p className="mt-2 break-all font-mono text-lg font-bold text-neutral-950">{receiptReference}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-black/10 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Amount paid</p>
                <p className="mt-2 text-lg font-bold text-neutral-950">
                  {typeof amountPaid === "number" ? `GH₵${amountPaid.toFixed(2)}` : "Pending sync"}
                </p>
              </div>
              <div className="rounded-3xl border border-black/10 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Status</p>
                <p className="mt-2 text-lg font-bold text-emerald-700">{status}</p>
              </div>
            </div>
          </div>

          <aside className="rounded-3xl bg-neutral-950 p-6 text-white">
            <h2 className="text-xl font-bold">What happens next</h2>
            <ol className="mt-5 space-y-4 text-sm leading-6 text-white/80">
              <li><strong className="text-white">1.</strong> Our admissions team confirms your payment reference in Sedifex.</li>
              <li><strong className="text-white">2.</strong> We contact you with your class start date, schedule, and items to bring.</li>
              <li><strong className="text-white">3.</strong> Keep this reference number safe for your registration confirmation.</li>
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
