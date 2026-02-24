"use client";

import { type FormEvent, useMemo, useState } from "react";

const defaultData = {
  name: "",
  email: "",
  branch: "",
  date: "",
  time: "",
  confirmationSent: "",
  confirmationSentAt: "",
  reminderSent3d: "",
  reminderSentAt3d: "",
  emailNormalized: "",
  emailIssue: "",
};

export function BookingSyncForm() {
  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => Boolean(data.name.trim() && data.email.trim() && data.branch.trim() && data.date.trim() && data.time.trim()),
    [data]
  );

  function updateField<K extends keyof typeof defaultData>(field: K, value: string) {
    setData((current) => ({ ...current, [field]: value }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/bookings/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const payload = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Sync failed");
      }

      setStatus(payload.message ?? "Synced");
      setData(defaultData);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Sync failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name" value={data.name} onChange={(value) => updateField("name", value)} required />
        <Field label="Email" type="email" value={data.email} onChange={(value) => updateField("email", value)} required />
        <Field label="Branch" value={data.branch} onChange={(value) => updateField("branch", value)} required />
        <Field label="Date" type="date" value={data.date} onChange={(value) => updateField("date", value)} required />
        <Field label="Time" type="time" value={data.time} onChange={(value) => updateField("time", value)} required />
        <Field
          label="Confirmation Sent"
          placeholder="Yes / No"
          value={data.confirmationSent}
          onChange={(value) => updateField("confirmationSent", value)}
        />
        <Field
          label="Confirmation Sent At"
          placeholder="2026-01-12 10:30"
          value={data.confirmationSentAt}
          onChange={(value) => updateField("confirmationSentAt", value)}
        />
        <Field
          label="3d Reminder Sent"
          placeholder="Yes / No"
          value={data.reminderSent3d}
          onChange={(value) => updateField("reminderSent3d", value)}
        />
        <Field
          label="3d Sent At"
          placeholder="2026-01-09 10:30"
          value={data.reminderSentAt3d}
          onChange={(value) => updateField("reminderSentAt3d", value)}
        />
        <Field
          label="Email Normalized"
          value={data.emailNormalized}
          onChange={(value) => updateField("emailNormalized", value)}
        />
        <Field label="Email Issue" value={data.emailIssue} onChange={(value) => updateField("emailIssue", value)} />
      </div>

      <button
        type="submit"
        disabled={loading || !canSubmit}
        className="w-full rounded-2xl bg-brand-950 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-900 disabled:opacity-60"
      >
        {loading ? "Syncing..." : "Save booking to Google Sheet"}
      </button>

      {status ? <p className="text-sm text-neutral-700">{status}</p> : null}
    </form>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
};

function Field({ label, value, onChange, type = "text", placeholder, required }: FieldProps) {
  return (
    <label className="block text-sm font-medium text-neutral-800">
      {label}
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-2"
      />
    </label>
  );
}
