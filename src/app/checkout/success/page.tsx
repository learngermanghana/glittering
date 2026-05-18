"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Snapshot = { name?: string; email?: string; phone?: string; reference?: string; amountPaid?: number; amount?: number; status?: string };

function firstValue<T>(...values: Array<T | undefined | null>) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
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

export default function CheckoutSuccessPage() {
  const search = useSearchParams();
  const [details, setDetails] = useState<Record<string, unknown> | null>(null);
  const [snapshot] = useState<Snapshot | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem("checkout:last_customer");
    return raw ? (JSON.parse(raw) as Snapshot) : null;
  });

  const urlReference = search.get("reference") ?? search.get("trxref") ?? undefined;


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
        details?.reference as string | undefined,
        details?.paymentReference as string | undefined,
        details?.payment_reference as string | undefined,
        details?.paystackReference as string | undefined,
        urlReference,
        snapshot?.reference,
        "Pending"
      ) as string,
    [details, snapshot, urlReference]
  );

  const amountPaid = firstValue(details?.amountPaid as number | undefined, details?.amount_paid as number | undefined, details?.amount as number | undefined, snapshot?.amountPaid, snapshot?.amount);
  const status = formatStatus(firstValue(details?.status as string | undefined, details?.orderStatus as string | undefined, details?.order_status as string | undefined, details?.paymentStatus as string | undefined, details?.payment_status as string | undefined, details?.syncStatus as string | undefined, details?.sync_status as string | undefined, snapshot?.status) as string | undefined);

  return (
    <section className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-3xl font-bold">Payment successful 🎉</h1>
      <p className="mt-2 text-neutral-700">Thank you{snapshot?.name ? `, ${snapshot.name}` : ""}. Your order has been received.</p>
      <div className="mt-6 space-y-2 rounded-2xl border border-black/10 bg-white p-5 text-sm">
        <p><strong>Receipt:</strong> {receiptReference}</p>
        <p><strong>Email:</strong> {snapshot?.email || "Pending"}</p>
        <p><strong>Phone:</strong> {formatPhone((details?.customerPhone as string | undefined) ?? snapshot?.phone)}</p>
        <p><strong>Amount paid:</strong> {typeof amountPaid === "number" ? `GH₵${amountPaid.toFixed(2)}` : "Pending"}</p>
        <p><strong>Status:</strong> {status}</p>
      </div>
    </section>
  );
}
