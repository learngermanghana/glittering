"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function TeamSessionActions() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <Link
        href="/book"
        className="inline-flex items-center justify-center rounded-2xl bg-brand-950 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-900"
      >
        Book on WhatsApp
      </Link>
      <button
        type="button"
        onClick={onLogout}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-2xl border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Logging out..." : "Log out"}
      </button>
    </div>
  );
}
