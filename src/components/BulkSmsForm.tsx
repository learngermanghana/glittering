"use client";

import { useMemo, useState } from "react";
import { CAMPAIGN_HISTORY_KEY, buildCampaignHistoryEntry, type CampaignResult } from "@/lib/campaignHistory";
import type { Customer } from "@/lib/crm";

type Props = {
  customers: Customer[];
};

export function BulkSmsForm({ customers }: Props) {
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const optedInCustomers = useMemo(
    () => customers.filter((customer) => customer.marketingOptIn !== false && customer.phone),
    [customers]
  );

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return optedInCustomers;

    return optedInCustomers.filter((customer) => {
      const fullName = customer.fullName?.toLowerCase() ?? "";
      const phone = customer.phone?.toLowerCase() ?? "";
      const email = customer.email?.toLowerCase() ?? "";

      return (
        fullName.includes(normalizedQuery) || phone.includes(normalizedQuery) || email.includes(normalizedQuery)
      );
    });
  }, [optedInCustomers, query]);

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

      const payload = (await response.json()) as { message?: string; error?: string; results?: CampaignResult[] };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to send SMS");
      }


      if (payload.results?.length) {
        const historyEntry = buildCampaignHistoryEntry(message, payload.results);
        const existingRaw = window.localStorage.getItem(CAMPAIGN_HISTORY_KEY);
        const existing = existingRaw ? (JSON.parse(existingRaw) as ReturnType<typeof buildCampaignHistoryEntry>[]) : [];
        window.localStorage.setItem(CAMPAIGN_HISTORY_KEY, JSON.stringify([historyEntry, ...existing].slice(0, 30)));
      }

      setStatus(payload.message ?? "SMS sent successfully");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to send SMS");
    } finally {
      setLoading(false);
    }
  }

  function selectVisibleCustomers() {
    setSelected(Array.from(new Set(filteredCustomers.map((customer) => customer.phone))));
  }

  function clearSelection() {
    setSelected([]);
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
      <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-neutral-600">Select recipients synced from Firebase.</p>
          <div className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-900">
            {selected.length} selected
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, phone, or email"
            className="w-full flex-1 rounded-2xl border border-neutral-300 px-4 py-2 text-sm"
          />
          <button
            type="button"
            onClick={selectVisibleCustomers}
            className="rounded-2xl border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            Select visible
          </button>
          <button
            type="button"
            onClick={clearSelection}
            className="rounded-2xl border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            Clear
          </button>
        </div>

        <div className="mt-4 max-h-72 space-y-2 overflow-auto rounded-2xl border border-neutral-200 p-4">
          {filteredCustomers.length ? (
            filteredCustomers.map((customer) => (
              <label
                key={customer.id ?? customer.phone}
                className="flex items-start gap-3 rounded-xl border border-transparent p-2 text-sm hover:border-neutral-200"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(customer.phone)}
                  onChange={() => toggleCustomer(customer.phone)}
                  className="mt-1"
                />
                <span className="flex flex-col">
                  <span className="font-medium text-neutral-900">{customer.fullName || "Unnamed customer"}</span>
                  <span className="text-neutral-600">{customer.phone}</span>
                </span>
              </label>
            ))
          ) : (
            <p className="text-sm text-neutral-500">No customers match your search.</p>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <p className="text-sm text-neutral-600">Write your campaign, select recipients, then tap Send bulk SMS.</p>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Type your campaign message"
          className="mt-4 min-h-40 w-full rounded-2xl border border-neutral-300 p-4"
        />

        <button
          type="button"
          onClick={submitCampaign}
          disabled={loading || !message.trim() || selected.length === 0}
          className="mt-4 w-full rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-500"
        >
          {loading ? "Sending..." : `Send bulk SMS (${selected.length})`}
        </button>

        {status ? <p className="mt-3 text-sm text-neutral-700">{status}</p> : null}
      </div>
    </div>
  );
}
