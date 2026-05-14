"use client";

import { FormEvent, useMemo, useState } from "react";

type EngagementPanelProps = {
  sourceProductId: string;
  label: string;
};

export function EngagementPanel({ sourceProductId, label }: EngagementPanelProps) {
  const storeId = process.env.NEXT_PUBLIC_SEDIFEX_STORE_ID ?? "";
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const payload = useMemo(() => ({ storeId, sourceProductId, originPlatform: "website_api" }), [sourceProductId, storeId]);

  async function toggleLike() {
    if (!storeId || busy) return;
    setBusy(true);
    try {
      const method = liked ? "DELETE" : "POST";
      const res = await fetch("/api/engagement/favorites", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("like failed");
      setLiked((current) => !current);
      setLikesCount((count) => Math.max(0, count + (liked ? -1 : 1)));
    } finally {
      setBusy(false);
    }
  }

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const bodyText = comment.trim();
    if (!bodyText || !storeId || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/engagement/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, body: bodyText, authorDisplayName: "Website Client" }),
      });
      if (!res.ok) throw new Error("comment failed");
      setComments((current) => [bodyText, ...current].slice(0, 5));
      setComment("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-neutral-700">Client engagement · {label}</p>
        <button
          type="button"
          onClick={toggleLike}
          disabled={!storeId || busy}
          className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-semibold text-neutral-800 disabled:opacity-50"
        >
          {liked ? "♥ Liked" : "♡ Like"} ({likesCount})
        </button>
      </div>

      <form onSubmit={submitComment} className="mt-2 flex gap-2">
        <input
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Write a quick comment"
          className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs"
        />
        <button type="submit" disabled={!storeId || busy} className="rounded-xl bg-neutral-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">
          Send
        </button>
      </form>

      {comments.length ? (
        <ul className="mt-2 space-y-1 text-xs text-neutral-700">
          {comments.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
