"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";

export default function BookPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    serviceId: "",
    serviceName: "",
    date: "",
    time: "",
    phone: "",
    email: "",
    branch: "",
    sessionDuration: "60 minutes",
    therapistPreference: "Female",
    contactMethod: "WhatsApp",
    depositAmount: "",
    paymentMethod: "Momo",
    notes: "",
    paymentConfirmed: false,
    cancellationAccepted: false,
  });

  const minimumFieldsComplete = useMemo(() => {
    const requiredTextFields = [formData.serviceId, formData.date, formData.time, formData.branch];
    return requiredTextFields.every((value) => value.trim().length > 0);
  }, [formData]);

  const hasCustomerIdentity = useMemo(() => {
    return Boolean(formData.name.trim() || formData.phone.trim() || formData.email.trim());
  }, [formData.email, formData.name, formData.phone]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitMessage(null);

    if (!minimumFieldsComplete || !hasCustomerIdentity) {
      setSubmitMessage({
        kind: "error",
        text: "Please provide Service ID, Date, Time, Branch, and at least one customer identifier (name, phone, or email).",
      });
      return;
    }

    setIsSubmitting(true);

    const notes = [
      formData.notes ? `Notes: ${formData.notes}` : "",
      `Preferred date: ${formData.date}`,
      `Preferred time: ${formData.time}`,
      formData.branch ? `Branch: ${formData.branch}` : "",
      formData.serviceName ? `Service name: ${formData.serviceName}` : "",
      formData.sessionDuration ? `Session type: ${formData.sessionDuration}` : "",
      formData.therapistPreference ? `Therapist preference: ${formData.therapistPreference}` : "",
      formData.depositAmount ? `Deposit amount: ${formData.depositAmount}` : "",
      formData.paymentMethod ? `Payment method: ${formData.paymentMethod}` : "",
      formData.contactMethod ? `Preferred contact method: ${formData.contactMethod}` : "",
      `Payment screenshot ready: ${formData.paymentConfirmed ? "Yes" : "No"}`,
      `Cancellation policy accepted: ${formData.cancellationAccepted ? "Yes" : "No"}`,
    ]
      .filter(Boolean)
      .join(" | ");

    try {
      const response = await fetch("/api/bookings/integration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: formData.serviceId.trim(),
          quantity: 1,
          notes,
          attributes: {
            serviceName: formData.serviceName.trim() || null,
            preferredDate: formData.date,
            preferredTime: formData.time,
            branch: formData.branch,
            sessionDuration: formData.sessionDuration,
            therapistPreference: formData.therapistPreference,
            contactMethod: formData.contactMethod,
            paymentMethod: formData.paymentMethod,
          },
          customer: {
            name: formData.name.trim() || undefined,
            phone: formData.phone.trim() || undefined,
            email: formData.email.trim() || undefined,
          },
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Booking submission failed.");
      }

      setSubmitMessage({ kind: "success", text: "Booking submitted successfully. Our team will confirm shortly." });
      setFormData((prev) => ({
        ...prev,
        notes: "",
        depositAmount: "",
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to submit booking right now.";
      setSubmitMessage({ kind: "error", text: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <section className="rounded-[32px] bg-[#ffe6ea] px-4 py-12 sm:px-8 sm:py-16">
        <SectionTitle
          title="Book a Session"
          subtitle="Fill the details below and submit your booking directly to our Sedifex booking system."
        />

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <form className="rounded-3xl border border-black/10 bg-white p-6 shadow-lg sm:p-8" onSubmit={handleSubmit}>
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
                Service ID
                <input
                  name="serviceId"
                  value={formData.serviceId}
                  onChange={handleChange}
                  placeholder="Sedifex service ID"
                  required
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
                  required
                  min={new Date().toISOString().split("T")[0]}
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                  type="date"
                />
              </label>
            </div>

            <div className="mt-5">
              <label className="text-sm font-semibold text-neutral-700">
                Service name (optional, for internal notes)
                <input
                  name="serviceName"
                  value={formData.serviceName}
                  onChange={handleChange}
                  placeholder="e.g. Deep Tissue Massage"
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
                  required
                  step={900}
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                  type="time"
                />
              </label>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold text-neutral-700">
                Preferred Branch
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleSelectChange}
                  required
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                >
                  <option value="">Select a branch</option>
                  <option value="Awoshie">Awoshie</option>
                  <option value="Spintex">Spintex</option>
                </select>
              </label>

              <label className="text-sm font-semibold text-neutral-700">
                Session Type / Duration
                <select
                  name="sessionDuration"
                  value={formData.sessionDuration}
                  onChange={handleSelectChange}
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                >
                  <option value="30 minutes">30 minutes</option>
                  <option value="45 minutes">45 minutes</option>
                  <option value="60 minutes">60 minutes</option>
                  <option value="90 minutes">90 minutes</option>
                  <option value="120 minutes">120 minutes</option>
                </select>
              </label>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold text-neutral-700">
                Therapist Preference
                <select
                  name="therapistPreference"
                  value={formData.therapistPreference}
                  onChange={handleSelectChange}
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="No preference">No preference</option>
                </select>
              </label>

              <label className="text-sm font-semibold text-neutral-700">
                Preferred Contact Method
                <select
                  name="contactMethod"
                  value={formData.contactMethod}
                  onChange={handleSelectChange}
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Phone call">Phone call</option>
                  <option value="SMS">SMS</option>
                </select>
              </label>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold text-neutral-700">
                Deposit Amount (if paid)
                <input
                  name="depositAmount"
                  value={formData.depositAmount}
                  onChange={handleChange}
                  placeholder="e.g. 100 GHS"
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                  type="text"
                />
              </label>

              <label className="text-sm font-semibold text-neutral-700">
                Payment Method
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleSelectChange}
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                >
                  <option value="Momo">Momo</option>
                  <option value="Bank transfer">Bank transfer</option>
                  <option value="Cash">Cash</option>
                </select>
              </label>
            </div>

            <div className="mt-5">
              <label className="text-sm font-semibold text-neutral-700">
                Email
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email address"
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                  type="email"
                />
              </label>
            </div>

            <div className="mt-5">
              <label className="text-sm font-semibold text-neutral-700">
                Notes / Special requests
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleTextareaChange}
                  placeholder="Share allergies or anything we should know."
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                />
              </label>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-700 shadow-sm">
                <input
                  name="paymentConfirmed"
                  checked={formData.paymentConfirmed}
                  onChange={handleCheckboxChange}
                  type="checkbox"
                  className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-300"
                />
                Payment screenshot ready
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-700 shadow-sm">
                <input
                  name="cancellationAccepted"
                  checked={formData.cancellationAccepted}
                  onChange={handleCheckboxChange}
                  type="checkbox"
                  className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-300"
                />
                I agree to the no-refund policy after payment
              </label>
            </div>

            <p className="mt-4 text-xs text-neutral-500">
              Note: Payments are non-refundable after confirmation.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={!minimumFieldsComplete || !hasCustomerIdentity || isSubmitting}
                className={`inline-flex w-full items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-sm sm:w-auto ${
                  minimumFieldsComplete && hasCustomerIdentity && !isSubmitting
                    ? "bg-neutral-900 hover:bg-neutral-800"
                    : "cursor-not-allowed bg-neutral-400"
                }`}
              >
                {isSubmitting ? "Submitting..." : "Submit booking"}
              </button>
              <p className="text-xs text-neutral-500">
                {minimumFieldsComplete && hasCustomerIdentity
                  ? "After submission, your booking is sent to Sedifex and linked to a customer automatically."
                  : "Complete Service ID, Date, Time, Branch, and at least one of Name, Phone, or Email."}
              </p>
            </div>

            {submitMessage && (
              <p className={`mt-4 text-sm ${submitMessage.kind === "success" ? "text-emerald-700" : "text-red-700"}`}>
                {submitMessage.text}
              </p>
            )}
          </form>

          <div className="rounded-3xl border border-black/10 bg-neutral-50 p-6 shadow-lg sm:p-8">
            <h2 className="text-lg font-semibold">Booking details preview</h2>
            <p className="mt-2 text-sm text-neutral-600">
              This is the information we send to Sedifex.
            </p>

            <div className="mt-5 rounded-2xl border border-black/10 bg-white p-4 text-sm text-neutral-700 whitespace-pre-line">
              Service ID: {formData.serviceId || "____"}
              {"\n"}Service name: {formData.serviceName || "____"}
              {"\n"}Customer name: {formData.name || "____"}
              {"\n"}Date: {formData.date || "____"}
              {"\n"}Time: {formData.time || "____"}
              {"\n"}Phone: {formData.phone || "____"}
              {"\n"}Email: {formData.email || "____"}
              {"\n"}Branch: {formData.branch || "____"}
              {"\n"}Session type: {formData.sessionDuration || "____"}
              {"\n"}Therapist preference: {formData.therapistPreference || "____"}
              {"\n"}Deposit amount: {formData.depositAmount || "____"}
              {"\n"}Payment method: {formData.paymentMethod || "____"}
              {"\n"}Contact method: {formData.contactMethod || "____"}
              {"\n"}Notes: {formData.notes || "____"}
              {"\n"}Payment screenshot: {formData.paymentConfirmed ? "Yes" : "No"}
              {"\n"}Cancellation policy accepted: {formData.cancellationAccepted ? "Yes" : "No"}
            </div>

            <div className="mt-6 rounded-2xl border border-black/10 bg-white p-4 text-sm text-neutral-700">
              <h3 className="text-sm font-semibold text-neutral-900">Payment details</h3>
              <p className="mt-2 text-xs text-neutral-500">
                Use the details below to make payment and keep a screenshot ready.
              </p>
              <div className="mt-4 space-y-4 text-xs sm:text-sm">
                <div>
                  <p className="font-semibold text-neutral-900">General accounts</p>
                  <p>Account Name: Glittering nails and makeover OR Gifty Mintaa Saforo</p>
                  <p>Merchant ID: *824873 (Choose Momopay Option 2)</p>
                  <p>Bank: Fidelity Bank — 2400777697112</p>
                  <p>Account Name: Glittering nails and makeover</p>
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">Awoshie branch</p>
                  <p>Momo: 0598611996</p>
                  <p>Awoshie Spa Branch Momo: 0270763296</p>
                  <p>Account Name: Gifty Mintaa Saforo</p>
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">Spintex branch</p>
                  <p>Momo: 0530530852</p>
                  <p>Account Name: Glittering nails and makeover</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}
