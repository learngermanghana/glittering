"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";

const BRANCH_OPTIONS = ["Awoshie", "Spintex"] as const;
const SESSION_OPTIONS = ["30 minutes", "45 minutes", "60 minutes", "90 minutes", "120 minutes"] as const;
const THERAPIST_OPTIONS = ["Female", "Male", "No preference"] as const;
const CONTACT_OPTIONS = ["WhatsApp", "Phone call", "SMS", "Email"] as const;
const PAYMENT_OPTIONS = ["Momo", "Bank transfer", "Cash"] as const;

function parseDurationMinutes(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isPastDateTime(date: string, time: string) {
  if (!date || !time) return false;
  const dateTime = new Date(`${date}T${time}:00`);
  if (Number.isNaN(dateTime.getTime())) return true;
  return dateTime.getTime() < Date.now();
}

export default function BookPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
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
    paymentMethod: "",
    notes: "",
    paymentScreenshotReady: false,
    paymentReference: "",
    cancellationAccepted: false,
  });

  const minimumFieldsComplete = useMemo(() => {
    const requiredTextFields = [formData.date, formData.time, formData.branch, formData.name];
    return requiredTextFields.every((value) => value.trim().length > 0);
  }, [formData]);

  const hasContactMethod = useMemo(() => {
    return Boolean(formData.phone.trim() || formData.email.trim());
  }, [formData.email, formData.phone]);

  const depositAmountValue = useMemo(() => {
    const value = formData.depositAmount.trim();
    if (!value) return 0;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }, [formData.depositAmount]);

  const clientValidationMessage = useMemo(() => {
    if (!formData.cancellationAccepted) {
      return "You must accept the no-refund policy before submitting.";
    }

    if (!minimumFieldsComplete) {
      return "Please provide Name, Date, Time, and Preferred Branch.";
    }

    if (!hasContactMethod) {
      return "Please provide at least one contact method: phone or email.";
    }

    if (formData.email.trim() && !isValidEmail(formData.email.trim())) {
      return "Please provide a valid email address.";
    }

    if (isPastDateTime(formData.date, formData.time)) {
      return "Please select a booking date/time in the future.";
    }

    if (Number.isNaN(depositAmountValue) || depositAmountValue < 0) {
      return "Deposit amount must be a valid non-negative number.";
    }

    if (depositAmountValue > 0 && !formData.paymentMethod.trim()) {
      return "Payment method is required when deposit amount is greater than 0.";
    }

    if (depositAmountValue > 0 && !formData.paymentScreenshotReady && !formData.paymentReference.trim()) {
      return "Payment proof is required (checkbox or payment reference) when a deposit is paid.";
    }

    return null;
  }, [
    depositAmountValue,
    formData.cancellationAccepted,
    formData.date,
    formData.email,
    formData.paymentMethod,
    formData.paymentScreenshotReady,
    formData.paymentReference,
    formData.time,
    hasContactMethod,
    minimumFieldsComplete,
  ]);

  const canSubmit = !isSubmitting && !clientValidationMessage;

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

    if (clientValidationMessage) {
      setSubmitMessage({ kind: "error", text: clientValidationMessage });
      return;
    }

    setIsSubmitting(true);

    const duration = parseDurationMinutes(formData.sessionDuration);

    try {
      const response = await fetch("/api/bookings/integration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: 1,
          notes: formData.notes.trim() || undefined,
          attributes: {
            preferred_branch: formData.branch,
            preferred_date: formData.date,
            preferred_time: formData.time,
            session_type: formData.sessionDuration,
            duration: duration ?? undefined,
            therapist_preference: formData.therapistPreference,
            preferred_contact_method: formData.contactMethod,
            deposit_amount: depositAmountValue,
            payment_method: formData.paymentMethod || undefined,
            email: formData.email.trim() || undefined,
            notes: formData.notes.trim() || undefined,
            payment_screenshot_ready: formData.paymentScreenshotReady,
            payment_reference: formData.paymentReference.trim() || undefined,
            no_refund_policy_accepted: formData.cancellationAccepted,
            service_name: formData.serviceName.trim() || undefined,
          },
          customer: {
            name: formData.name.trim(),
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
        paymentMethod: "",
        paymentScreenshotReady: false,
        paymentReference: "",
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
                  required
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
                  {BRANCH_OPTIONS.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-semibold text-neutral-700">
                Session Type / Duration
                <select
                  name="sessionDuration"
                  value={formData.sessionDuration}
                  onChange={handleSelectChange}
                  required
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                >
                  {SESSION_OPTIONS.map((sessionOption) => (
                    <option key={sessionOption} value={sessionOption}>
                      {sessionOption}
                    </option>
                  ))}
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
                  required
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                >
                  {THERAPIST_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-semibold text-neutral-700">
                Preferred Contact Method
                <select
                  name="contactMethod"
                  value={formData.contactMethod}
                  onChange={handleSelectChange}
                  required
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                >
                  {CONTACT_OPTIONS.map((contactOption) => (
                    <option key={contactOption} value={contactOption}>
                      {contactOption}
                    </option>
                  ))}
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
                  placeholder="e.g. 100"
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                  type="number"
                  min="0"
                  step="0.01"
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
                  <option value="">Select payment method</option>
                  {PAYMENT_OPTIONS.map((paymentOption) => (
                    <option key={paymentOption} value={paymentOption}>
                      {paymentOption}
                    </option>
                  ))}
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
                Payment Reference (optional)
                <input
                  name="paymentReference"
                  value={formData.paymentReference}
                  onChange={handleChange}
                  placeholder="Type account name/number or any payment trace"
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                  type="text"
                />
                <span className="mt-2 block text-xs font-normal text-neutral-500">
                  Type your account name and number or anything that can help us track payment.
                </span>
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
                  name="paymentScreenshotReady"
                  checked={formData.paymentScreenshotReady}
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

            <p className="mt-4 text-xs text-neutral-500">Note: Payments are non-refundable after confirmation.</p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={!canSubmit}
                className={`inline-flex w-full items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-sm sm:w-auto ${
                  canSubmit ? "bg-neutral-900 hover:bg-neutral-800" : "cursor-not-allowed bg-neutral-400"
                }`}
              >
                {isSubmitting ? "Submitting..." : "Submit booking"}
              </button>
              <p className="text-xs text-neutral-500">
                {clientValidationMessage
                  ? clientValidationMessage
                  : "After submission, your booking is sent to Sedifex and linked to a customer automatically."}
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
            <p className="mt-2 text-sm text-neutral-600">This is the information we send to Sedifex.</p>

            <div className="mt-5 rounded-2xl border border-black/10 bg-white p-4 text-sm text-neutral-700 whitespace-pre-line">
              Service name: {formData.serviceName || "____"}
              {"\n"}Customer name: {formData.name || "____"}
              {"\n"}Date: {formData.date || "____"}
              {"\n"}Time: {formData.time || "____"}
              {"\n"}Phone: {formData.phone || "____"}
              {"\n"}Email: {formData.email || "____"}
              {"\n"}Preferred branch: {formData.branch || "____"}
              {"\n"}Session type: {formData.sessionDuration || "____"}
              {"\n"}Therapist preference: {formData.therapistPreference || "____"}
              {"\n"}Deposit amount: {formData.depositAmount || "0"}
              {"\n"}Payment method: {formData.paymentMethod || "____"}
              {"\n"}Contact method: {formData.contactMethod || "____"}
              {"\n"}Notes: {formData.notes || "____"}
              {"\n"}Payment screenshot ready: {formData.paymentScreenshotReady ? "Yes" : "No"}
              {"\n"}Payment reference: {formData.paymentReference || "____"}
              {"\n"}No-refund policy accepted: {formData.cancellationAccepted ? "Yes" : "No"}
            </div>

            <div className="mt-6 rounded-2xl border border-black/10 bg-white p-4 text-sm text-neutral-700">
              <h3 className="text-sm font-semibold text-neutral-900">Payment details</h3>
              <p className="mt-2 text-xs text-neutral-500">Use the details below to make payment and keep a screenshot ready.</p>
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
