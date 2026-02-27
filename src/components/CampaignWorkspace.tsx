"use client";

import { useMemo, useState } from "react";
import {
  CAMPAIGN_HISTORY_KEY,
  CAMPAIGN_TEMPLATES_KEY,
  buildCampaignHistoryEntry,
  type CampaignHistoryEntry,
  type CampaignResult,
  type SmsTemplate,
} from "@/lib/campaignHistory";

export function CampaignWorkspace() {
  const [history, setHistory] = useState<CampaignHistoryEntry[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      const savedHistory = window.localStorage.getItem(CAMPAIGN_HISTORY_KEY);
      return savedHistory ? (JSON.parse(savedHistory) as CampaignHistoryEntry[]) : [];
    } catch {
      return [];
    }
  });
  const [templates, setTemplates] = useState<SmsTemplate[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      const savedTemplates = window.localStorage.getItem(CAMPAIGN_TEMPLATES_KEY);
      return savedTemplates ? (JSON.parse(savedTemplates) as SmsTemplate[]) : [];
    } catch {
      return [];
    }
  });
  const [resendMessage, setResendMessage] = useState("We missed you earlier. Here's the same update again.");
  const [status, setStatus] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [templateMessage, setTemplateMessage] = useState("");

  function persistHistory(next: CampaignHistoryEntry[]) {
    setHistory(next);
    window.localStorage.setItem(CAMPAIGN_HISTORY_KEY, JSON.stringify(next));
  }

  function persistTemplates(next: SmsTemplate[]) {
    setTemplates(next);
    window.localStorage.setItem(CAMPAIGN_TEMPLATES_KEY, JSON.stringify(next));
  }

  function saveTemplate() {
    const name = templateName.trim();
    const message = templateMessage.trim();
    if (!name || !message) return;

    const nextTemplate: SmsTemplate = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      message,
      createdAt: new Date().toISOString(),
    };

    persistTemplates([nextTemplate, ...templates].slice(0, 20));
    setTemplateName("");
    setTemplateMessage("");
    setStatus(`Template “${name}” saved.`);
  }

  async function resendFailed(entry: CampaignHistoryEntry) {
    if (!resendMessage.trim() || entry.failures.length === 0) return;

    setStatus(null);
    setLoadingId(entry.id);

    try {
      const response = await fetch("/api/sms/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: resendMessage,
          recipients: entry.failures.map((failure) => failure.to),
        }),
      });

      const payload = (await response.json()) as { message?: string; error?: string; results?: CampaignResult[] };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to re-send failed recipients");
      }

      if (payload.results?.length) {
        const nextEntry = buildCampaignHistoryEntry(resendMessage, payload.results);
        persistHistory([nextEntry, ...history].slice(0, 30));
      }

      setStatus(payload.message ?? "Re-send complete");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to re-send failed recipients");
    } finally {
      setLoadingId(null);
    }
  }

  const totalFailures = useMemo(() => history.reduce((count, item) => count + item.failed, 0), [history]);

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-900">SMS templates</h2>
        <p className="mt-1 text-sm text-neutral-600">Save reusable messages like Promo Friday or Holiday reminder.</p>

        <input
          value={templateName}
          onChange={(event) => setTemplateName(event.target.value)}
          placeholder="Template name"
          className="mt-4 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
        />
        <textarea
          value={templateMessage}
          onChange={(event) => setTemplateMessage(event.target.value)}
          placeholder="Template message"
          className="mt-3 min-h-28 w-full rounded-xl border border-neutral-300 p-3 text-sm"
        />

        <button
          type="button"
          onClick={saveTemplate}
          className="mt-3 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700"
        >
          Save template
        </button>

        <div className="mt-5 space-y-2">
          {templates.length === 0 ? (
            <p className="text-sm text-neutral-500">No templates saved yet.</p>
          ) : (
            templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => setResendMessage(template.message)}
                className="block w-full rounded-xl border border-neutral-200 px-3 py-2 text-left text-sm hover:bg-neutral-50"
              >
                <p className="font-semibold text-neutral-900">{template.name}</p>
                <p className="line-clamp-2 text-neutral-600">{template.message}</p>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-900">Campaign history</h2>
        <p className="mt-1 text-sm text-neutral-600">Total failed recipients tracked: {totalFailures}</p>

        <label className="mt-4 block text-sm font-medium text-neutral-700">
          Re-send message
          <textarea
            value={resendMessage}
            onChange={(event) => setResendMessage(event.target.value)}
            className="mt-2 min-h-24 w-full rounded-xl border border-neutral-300 p-3 text-sm"
          />
        </label>

        <div className="mt-4 space-y-3">
          {history.length === 0 ? (
            <p className="text-sm text-neutral-500">No campaign history yet. Send a campaign from Bulk SMS first.</p>
          ) : (
            history.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-neutral-200 p-4">
                <p className="text-sm font-semibold text-neutral-900">
                  Sent: {entry.sent} · Failed: {entry.failed} · Recipients: {entry.recipientCount}
                </p>
                <p className="mt-1 text-xs text-neutral-500">{new Date(entry.createdAt).toLocaleString()}</p>
                <p className="mt-2 text-sm text-neutral-700">{entry.message}</p>
                {entry.failures.length > 0 ? (
                  <>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Failed numbers</p>
                    <ul className="mt-1 space-y-1 text-xs text-neutral-600">
                      {entry.failures.map((failure) => (
                        <li key={`${entry.id}-${failure.to}`}>
                          {failure.to} — {failure.reason}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => resendFailed(entry)}
                      disabled={loadingId === entry.id || !resendMessage.trim()}
                      className="mt-3 rounded-xl border border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 disabled:cursor-not-allowed"
                    >
                      {loadingId === entry.id ? "Re-sending..." : "Re-send to failed numbers"}
                    </button>
                  </>
                ) : null}
              </div>
            ))
          )}
        </div>

        {status ? <p className="mt-4 text-sm text-neutral-700">{status}</p> : null}
      </div>
    </div>
  );
}
