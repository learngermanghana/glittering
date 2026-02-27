export const CAMPAIGN_HISTORY_KEY = "sedifex_campaign_history";
export const CAMPAIGN_TEMPLATES_KEY = "sedifex_campaign_templates";

export type CampaignFailure = {
  to: string;
  reason: string;
};

export type CampaignHistoryEntry = {
  id: string;
  createdAt: string;
  message: string;
  recipientCount: number;
  sent: number;
  failed: number;
  failures: CampaignFailure[];
};

export type SmsTemplate = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
};

export type CampaignResult = {
  to: string;
  ok: boolean;
  reason?: string;
};

export function buildCampaignHistoryEntry(message: string, results: CampaignResult[]): CampaignHistoryEntry {
  const sent = results.filter((item) => item.ok).length;
  const failures = results
    .filter((item) => !item.ok)
    .map((item) => ({ to: item.to, reason: item.reason ?? "Unknown error" }));

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    message: message.trim(),
    recipientCount: results.length,
    sent,
    failed: failures.length,
    failures,
  };
}
