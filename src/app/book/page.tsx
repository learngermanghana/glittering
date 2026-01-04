"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { SITE } from "@/lib/site";

const baseMessage = "Hi Glittering Spa! I want to book a session.";

export default function BookPage() {
  const [formData, setFormData] = useState({
    name: "",
    service: "",
    date: "",
    time: "",
    phone: "",
  });

  const whatsappLink = useMemo(() => {
    const message = [
      baseMessage,
      `Name: ${formData.name || "____"}`,
      `Service: ${formData.service || "____"}`,
      `Date: ${formData.date || "____"}`,
      `Time: ${formData.time || "____"}`,
      `Phone: ${formData.phone || "____"}`,
    ].join("\n");

    return `https://wa.me/${SITE.phoneIntl}?text=${encodeURIComponent(message)}`;
  }, [formData]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Container>
      <section className="py-12 sm:py-16">
        <SectionTitle
          title="Book a Session"
          subtitle="Fill the details below and we’ll open WhatsApp with your booking message."
        />

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <form className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold text-neutral-700">
                Name
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                  type="text"
                />
              </label>

              <label className="text-sm font-semibold text-neutral-700">
                Phone
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                  type="tel"
                />
              </label>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold text-neutral-700">
                Service
                <input
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  placeholder="e.g. Massage, Facial"
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                  type="text"
                />
              </label>

              <label className="text-sm font-semibold text-neutral-700">
                Date
                <input
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  placeholder="Preferred date"
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                  type="text"
                />
              </label>
            </div>

            <div className="mt-5">
              <label className="text-sm font-semibold text-neutral-700">
                Time
                <input
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  placeholder="Preferred time"
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                  type="text"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 sm:w-auto"
              >
                Send on WhatsApp
              </a>
              <p className="text-xs text-neutral-500">
                We’ll confirm your booking details once you send the WhatsApp message.
              </p>
            </div>
          </form>

          <div className="rounded-3xl border border-black/10 bg-neutral-50 p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-semibold">Booking details preview</h2>
            <p className="mt-2 text-sm text-neutral-600">
              This is what we’ll send to WhatsApp based on your entries.
            </p>

            <div className="mt-5 rounded-2xl border border-black/10 bg-white p-4 text-sm text-neutral-700 whitespace-pre-line">
              {baseMessage}
              {"\n"}Name: {formData.name || "____"}
              {"\n"}Service: {formData.service || "____"}
              {"\n"}Date: {formData.date || "____"}
              {"\n"}Time: {formData.time || "____"}
              {"\n"}Phone: {formData.phone || "____"}
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}
