"use client";

import { useEffect } from "react";
import BookPage from "../../book/page";

export default function SpaBookPage() {
  useEffect(() => {
    const phoneInput = document.querySelector<HTMLInputElement>('input[name="phone"]');
    if (!phoneInput) return;

    phoneInput.placeholder = "e.g. 024 123 4567 or +233 24 123 4567";
    phoneInput.autocomplete = "tel";
    phoneInput.inputMode = "tel";
    phoneInput.setAttribute("aria-label", "Phone or WhatsApp number");
  }, []);

  return (
    <>
      <div className="mx-auto mb-4 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border-2 border-neutral-900 bg-[#fff7f8] px-4 py-4 shadow-sm sm:px-5">
          <p className="text-sm font-bold text-neutral-950">Phone / WhatsApp number is required</p>
          <p className="mt-1 text-sm leading-6 text-neutral-700">
            Enter a number you can receive calls or SMS on. Glittering Med Spa and Sedifex use this number for booking confirmations, appointment reminders, and booking updates.
          </p>
        </div>
      </div>

      <style>{`
        label:has(input[name="phone"]) {
          grid-column: 1 / -1;
          display: block;
          padding: 16px;
          border: 2px solid #171717;
          border-radius: 16px;
          background: #fff7f8;
        }

        input[name="phone"] {
          font-size: 16px;
        }
      `}</style>

      <BookPage />
    </>
  );
}
