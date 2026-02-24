"use client";

import { useMemo, useState } from "react";
import type { Customer } from "@/lib/crm";

type Props = {
  customers: Customer[];
};

export function BulkSmsForm({ customers }: Props) {
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const optedInCustomers = useMemo(
    () => customers.filter((customer) => customer.marketingOptIn !== false && customer.phone),
    [customers]
  );

  function toggleCustomer(phone: string) {
    setSelected((existing) =>
      existing.includes(phone) ? existing.filter((item) => item !== phone) : [...existing, phone]
    );
  }

  async function submitCampaign() {
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/sms/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, recipients: selected }),
      });

      const payload = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to send SMS");
      }

      setStatus(payload.message ?? "SMS sent successfully");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to send SMS");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <p className="text-sm text-neutral-600">Select customers from Firebase and send a Hubtel campaign.</p>

      <div className="mt-4 max-h-56 space-y-2 overflow-auto rounded-2xl border border-neutral-200 p-4">
        {optedInCustomers.map((customer) => (
          <label key={customer.id ?? customer.phone} className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={selected.includes(customer.phone)}
              onChange={() => toggleCustomer(customer.phone)}
            />
            <span>
              {customer.fullName} - {customer.phone}
            </span>
          </label>
        ))}
      </div>

      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Type your campaign message"
        className="mt-4 min-h-28 w-full rounded-2xl border border-neutral-300 p-4"
      />

      <button
        type="button"
        onClick={submitCampaign}
        disabled={loading || !message.trim() || selected.length === 0}
        className="mt-4 rounded-2xl bg-brand-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Sending..." : `Send bulk SMS (${selected.length})`}
      </button>

      {status ? <p className="mt-3 text-sm text-neutral-700">{status}</p> : null}
    </div>
  );
}
