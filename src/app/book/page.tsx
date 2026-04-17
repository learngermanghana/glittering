"use client";

import { useEffect, useMemo, useState } from "react";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";

const BRANCH_OPTIONS = ["Awoshie", "Spintex"] as const;
const CONTACT_OPTIONS = ["WhatsApp", "Phone call", "SMS", "Email"] as const;
const PAYMENT_OPTIONS = ["Momo", "Bank transfer", "Cash"] as const;
type ServiceOption = { id: string; name: string };

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    serviceId: "",
    date: "",
    time: "",
    phone: "",
    email: "",
    branch: "",
    contactMethod: "WhatsApp",
    depositAmount: "",
    paymentMethod: "",
    notes: "",
    paymentReference: "",
    cancellationAccepted: false,
  });

  const selectedServiceName = useMemo(
    () => serviceOptions.find((service) => service.id === formData.serviceId)?.name ?? "",
    [formData.serviceId, serviceOptions]
  );

  const hasContactMethod = useMemo(() => {
    return Boolean(formData.phone.trim() || formData.email.trim());
  }, [formData.email, formData.phone]);

  const depositAmountValue = useMemo(() => {
    const value = formData.depositAmount.trim();
    if (!value) return 0;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }, [formData.depositAmount]);

  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};

    if (!formData.cancellationAccepted) {
      errors.cancellationAccepted = "Accept the no-refund policy before submitting.";
    }

    if (!formData.name.trim()) errors.name = "Name is required.";
    if (!formData.serviceId.trim()) errors.serviceId = "Please select a service.";
    if (!formData.date.trim()) errors.date = "Date is required.";
    if (!formData.time.trim()) errors.time = "Time is required.";
    if (!formData.branch.trim()) errors.branch = "Preferred branch is required.";
    if (!formData.paymentReference.trim()) errors.paymentReference = "Payment reference is required.";

    if (!hasContactMethod) {
      errors.phone = "Provide at least one contact method.";
      errors.email = "Provide at least one contact method.";
    }

    if (formData.email.trim() && !isValidEmail(formData.email.trim())) {
      errors.email = "Please provide a valid email address.";
    }

    if (formData.date && formData.time && isPastDateTime(formData.date, formData.time)) {
      errors.time = "Please choose a future date/time.";
    }

    if (Number.isNaN(depositAmountValue) || depositAmountValue < 0) {
      errors.depositAmount = "Deposit must be a valid non-negative number.";
    }

    if (depositAmountValue > 0 && !formData.paymentMethod.trim()) {
      errors.paymentMethod = "Payment method is required when deposit is greater than 0.";
    }

    return errors;
  }, [
    depositAmountValue,
    formData.branch,
    formData.cancellationAccepted,
    formData.date,
    formData.email,
    formData.name,
    formData.paymentMethod,
    formData.paymentReference,
    formData.serviceId,
    formData.time,
    hasContactMethod,
  ]);

  const clientValidationMessage = useMemo(() => {
    const firstError = Object.values(validationErrors)[0];
    return firstError ?? null;
  }, [validationErrors]);

  const canSubmit = !isSubmitting && !clientValidationMessage;
  const inputClassName = (field: string) =>
    `mt-2 w-full rounded-2xl border bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-sm focus:outline-none focus:ring-2 ${
      fieldErrors[field]
        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
        : "border-neutral-200 focus:border-neutral-400 focus:ring-neutral-200"
    }`;

  useEffect(() => {
    let cancelled = false;

    async function loadServices() {
      try {
        const response = await fetch("/api/bookings/integration?view=services", { cache: "no-store" });
        const payload = (await response.json()) as { services?: ServiceOption[] };

        if (!response.ok) {
          throw new Error("Unable to load services.");
        }

        if (!cancelled) {
          setServiceOptions(Array.isArray(payload.services) ? payload.services : []);
        }
      } catch {
        if (!cancelled) {
          setServiceOptions([]);
        }
      }
    }

    void loadServices();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitMessage(null);

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setSubmitMessage({ kind: "error", text: "Please correct the highlighted fields and try again." });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/bookings/integration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: formData.serviceId,
          serviceName: selectedServiceName || undefined,
          quantity: 1,
          notes: formData.notes.trim() || undefined,
          attributes: {
            preferred_branch: formData.branch,
            preferred_date: formData.date,
            preferred_time: formData.time,
            preferred_contact_method: formData.contactMethod,
            deposit_amount: depositAmountValue,
            payment_method: formData.paymentMethod || undefined,
            email: formData.email.trim() || undefined,
            customer_name: formData.name.trim(),
            customer_phone: formData.phone.trim() || undefined,
            notes: formData.notes.trim() || undefined,
            payment_reference: formData.paymentReference.trim() || undefined,
            no_refund_policy_accepted: formData.cancellationAccepted,
            service_name: selectedServiceName || undefined,
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

      setSubmitMessage({
        kind: "success",
        text: "Booking sent successfully to Sedifex. We’ll contact you shortly to confirm your appointment.",
      });
      setFormData((prev) => ({
        ...prev,
        notes: "",
        depositAmount: "",
        paymentMethod: "",
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
                  className={inputClassName("name")}
                  type="text"
                />
                {fieldErrors.name && <span className="mt-1 block text-xs font-normal text-red-600">{fieldErrors.name}</span>}
              </label>

              <label className="text-sm font-semibold text-neutral-700">
                Phone
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                  className={inputClassName("phone")}
                  type="tel"
                />
                {fieldErrors.phone && <span className="mt-1 block text-xs font-normal text-red-600">{fieldErrors.phone}</span>}
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
                  className={inputClassName("date")}
                  type="date"
                />
                {fieldErrors.date && <span className="mt-1 block text-xs font-normal text-red-600">{fieldErrors.date}</span>}
              </label>
            </div>

            <div className="mt-5">
              <label className="text-sm font-semibold text-neutral-700">
                Service
                <select
                  name="serviceId"
                  value={formData.serviceId}
                  onChange={handleSelectChange}
                  required
                  className={inputClassName("serviceId")}
                >
                  <option value="">Select service</option>
                  {serviceOptions.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
                {fieldErrors.serviceId && <span className="mt-1 block text-xs font-normal text-red-600">{fieldErrors.serviceId}</span>}
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
                  className={inputClassName("time")}
                  type="time"
                />
                {fieldErrors.time && <span className="mt-1 block text-xs font-normal text-red-600">{fieldErrors.time}</span>}
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
                  className={inputClassName("branch")}
                >
                  <option value="">Select a branch</option>
                  {BRANCH_OPTIONS.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
                {fieldErrors.branch && <span className="mt-1 block text-xs font-normal text-red-600">{fieldErrors.branch}</span>}
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
                  className={inputClassName("depositAmount")}
                  type="number"
                  min="0"
                  step="0.01"
                />
                {fieldErrors.depositAmount && (
                  <span className="mt-1 block text-xs font-normal text-red-600">{fieldErrors.depositAmount}</span>
                )}
              </label>

              <label className="text-sm font-semibold text-neutral-700">
                Payment Method
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleSelectChange}
                  className={inputClassName("paymentMethod")}
                >
                  <option value="">Select payment method</option>
                  {PAYMENT_OPTIONS.map((paymentOption) => (
                    <option key={paymentOption} value={paymentOption}>
                      {paymentOption}
                    </option>
                  ))}
                </select>
                {fieldErrors.paymentMethod && (
                  <span className="mt-1 block text-xs font-normal text-red-600">{fieldErrors.paymentMethod}</span>
                )}
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
                  className={inputClassName("email")}
                  type="email"
                />
                {fieldErrors.email && <span className="mt-1 block text-xs font-normal text-red-600">{fieldErrors.email}</span>}
              </label>
            </div>

            <div className="mt-5">
              <label className="text-sm font-semibold text-neutral-700">
                Payment Reference
                <input
                  name="paymentReference"
                  value={formData.paymentReference}
                  onChange={handleChange}
                  placeholder="Type account name/number or any payment trace"
                  required
                  className={inputClassName("paymentReference")}
                  type="text"
                />
                <span className="mt-2 block text-xs font-normal text-neutral-500">
                  Type your account name and number or anything that can help us track payment.
                </span>
                {fieldErrors.paymentReference && (
                  <span className="mt-1 block text-xs font-normal text-red-600">{fieldErrors.paymentReference}</span>
                )}
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

            <div className="mt-6 grid gap-4 sm:grid-cols-1">
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
              {fieldErrors.cancellationAccepted && (
                <span className="text-xs font-normal text-red-600">{fieldErrors.cancellationAccepted}</span>
              )}
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
              <div
                role="status"
                className={`mt-4 rounded-2xl border px-4 py-3 text-sm shadow-sm ${
                  submitMessage.kind === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                <p className="font-semibold">{submitMessage.kind === "success" ? "Success" : "Submission failed"}</p>
                <p className="mt-1">{submitMessage.text}</p>
              </div>
            )}
          </form>

          <div className="rounded-3xl border border-black/10 bg-neutral-50 p-6 shadow-lg sm:p-8">
            <h2 className="text-lg font-semibold">Booking details preview</h2>
            <p className="mt-2 text-sm text-neutral-600">This is the information we send to Sedifex.</p>

            <div className="mt-5 rounded-2xl border border-black/10 bg-white p-4 text-sm text-neutral-700 whitespace-pre-line">
              Service: {selectedServiceName || "____"}
              {"\n"}Customer name: {formData.name || "____"}
              {"\n"}Date: {formData.date || "____"}
              {"\n"}Time: {formData.time || "____"}
              {"\n"}Phone: {formData.phone || "____"}
              {"\n"}Email: {formData.email || "____"}
              {"\n"}Preferred branch: {formData.branch || "____"}
              {"\n"}Deposit amount: {formData.depositAmount || "0"}
              {"\n"}Payment method: {formData.paymentMethod || "____"}
              {"\n"}Contact method: {formData.contactMethod || "____"}
              {"\n"}Notes: {formData.notes || "____"}
              {"\n"}Payment reference: {formData.paymentReference || "____"}
              {"\n"}No-refund policy accepted: {formData.cancellationAccepted ? "Yes" : "No"}
            </div>

            <div className="mt-6 rounded-2xl border border-black/10 bg-white p-4 text-sm text-neutral-700">
              <h3 className="text-sm font-semibold text-neutral-900">Payment details</h3>
              <p className="mt-2 text-xs text-neutral-500">
                Use the details below to make payment and include a clear payment reference when booking.
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                Your payment reference should be the account name/number or payment details you used from these options.
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
