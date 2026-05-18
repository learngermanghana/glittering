"use client";

import { useEffect, useMemo, useState } from "react";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";

const BRANCH_OPTIONS = [
  { label: "Glittering Med Spa Main (Awoshie)", value: "Glittering Med Spa Main", storeId: "37mJqg20MjOriggaIaOOuahDsgj1" },
  { label: "Glittering Spa Annex (Awoshie)", value: "Glittering Spa Annex", storeId: "2EeDEIDS1FO814KVfaaUVdv66bM2" },
  { label: "Glittering Spa Spintex", value: "Glittering Spa Spintex", storeId: "kT9QTWUkACMby6OwI2RO1bxG0WL2" },
] as const;

const CONTACT_OPTIONS = ["WhatsApp", "Phone call", "SMS", "Email"] as const;

type ServiceOption = { id: string; name: string; price?: number | null };

type CheckoutResponse = {
  ok?: boolean;
  checkoutUrl?: string;
  reference?: string;
  error?: string;
};

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
  const currency = useMemo(
    () =>
      new Intl.NumberFormat("en-GH", {
        style: "currency",
        currency: "GHS",
      }),
    [],
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);
  const [activeStoreId, setActiveStoreId] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    serviceId: "",
    date: "",
    time: "",
    phone: "",
    email: "",
    branch: "",
    contactMethod: "WhatsApp",
    notes: "",
    cancellationAccepted: false,
  });

  const selectedBranch = useMemo(
    () => BRANCH_OPTIONS.find((branch) => branch.value === formData.branch) ?? null,
    [formData.branch],
  );

  const selectedService = useMemo(
    () => serviceOptions.find((service) => service.id === formData.serviceId) ?? null,
    [formData.serviceId, serviceOptions],
  );

  const selectedServiceName = selectedService?.name ?? "";
  const selectedServicePrice = typeof selectedService?.price === "number" && Number.isFinite(selectedService.price) ? selectedService.price : null;

  const hasContactMethod = useMemo(() => Boolean(formData.phone.trim() || formData.email.trim()), [formData.email, formData.phone]);

  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = "Name is required.";
    if (!formData.branch.trim()) errors.branch = "Preferred branch is required.";
    if (!formData.serviceId.trim()) errors.serviceId = "Please select a service.";
    if (!formData.date.trim()) errors.date = "Date is required.";
    if (!formData.time.trim()) errors.time = "Time is required.";
    if (!formData.cancellationAccepted) errors.cancellationAccepted = "Accept the no-refund policy before payment.";

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

    return errors;
  }, [formData.branch, formData.cancellationAccepted, formData.date, formData.email, formData.name, formData.serviceId, formData.time, hasContactMethod]);

  const clientValidationMessage = useMemo(() => Object.values(validationErrors)[0] ?? null, [validationErrors]);

  const progress = useMemo(() => {
    const checks = [
      Boolean(formData.name.trim()),
      Boolean(formData.branch.trim()),
      Boolean(formData.serviceId.trim()),
      Boolean(formData.date.trim()),
      Boolean(formData.time.trim()),
      Boolean(formData.phone.trim() || formData.email.trim()),
      formData.cancellationAccepted,
    ];
    const completed = checks.filter(Boolean).length;
    const total = checks.length;
    return { completed, total, percentage: Math.round((completed / total) * 100), remaining: total - completed };
  }, [formData.branch, formData.cancellationAccepted, formData.date, formData.email, formData.name, formData.phone, formData.serviceId, formData.time]);

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
      const branch = BRANCH_OPTIONS.find((option) => option.value === formData.branch);
      if (!branch) {
        if (!cancelled) {
          setServiceOptions([]);
          setActiveStoreId("");
          setFormData((prev) => ({ ...prev, serviceId: "" }));
        }
        return;
      }

      try {
        const params = new URLSearchParams({ view: "services", storeId: branch.storeId, branch: branch.value });
        const response = await fetch(`/api/bookings/integration?${params.toString()}`, { cache: "no-store" });
        const payload = (await response.json()) as { services?: ServiceOption[]; storeId?: string };
        if (!response.ok) throw new Error("Unable to load services.");

        if (!cancelled) {
          const nextServices = Array.isArray(payload.services) ? payload.services : [];
          setServiceOptions(nextServices);
          setActiveStoreId(payload.storeId ?? branch.storeId);
          setFormData((prev) => {
            const hasSelectedService = nextServices.some((service) => service.id === prev.serviceId);
            return hasSelectedService ? prev : { ...prev, serviceId: "" };
          });
        }
      } catch {
        if (!cancelled) {
          setServiceOptions([]);
          setActiveStoreId(branch.storeId);
        }
      }
    }

    void loadServices();
    return () => {
      cancelled = true;
    };
  }, [formData.branch]);

  const clearFieldError = (name: string) => {
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    clearFieldError(name);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    clearFieldError(name);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    clearFieldError(name);
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    clearFieldError(name);
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
      const response = await fetch("/api/bookings/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: formData.serviceId,
          serviceName: selectedServiceName || undefined,
          bookingDate: formData.date,
          bookingTime: formData.time,
          customerName: formData.name.trim(),
          customerPhone: formData.phone.trim() || undefined,
          customerEmail: formData.email.trim() || undefined,
          branchLocationId: selectedBranch?.storeId,
          branchLocationName: formData.branch,
          preferredContactMethod: formData.contactMethod,
          notes: formData.notes.trim() || undefined,
          noRefundPolicyAccepted: formData.cancellationAccepted,
        }),
      });

      const data = (await response.json()) as CheckoutResponse;
      if (!response.ok || !data.checkoutUrl) {
        throw new Error(data.error ?? "Unable to create Sedifex checkout.");
      }

      setSubmitMessage({ kind: "success", text: "Checkout created. Redirecting you to secure payment..." });
      window.location.href = data.checkoutUrl;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create checkout right now.";
      setSubmitMessage({ kind: "error", text: message });
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <section className="rounded-[32px] bg-[#ffe6ea] px-4 py-12 sm:px-8 sm:py-16">
        <SectionTitle
          title="Book and Pay Online"
          subtitle="Choose your service, date, and branch. Sedifex Checkout will open so you can pay securely and confirm your booking automatically."
        />

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <form className="rounded-3xl border border-black/10 bg-white p-6 shadow-lg sm:p-8" onSubmit={handleSubmit}>
            <div className="mb-6 rounded-2xl border border-black/10 bg-neutral-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-neutral-800">Booking form progress</p>
                <p className="text-xs font-medium text-neutral-600">{progress.completed}/{progress.total} completed</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-200" role="progressbar" aria-label="Booking form completion progress" aria-valuemin={0} aria-valuemax={progress.total} aria-valuenow={progress.completed}>
                <div className="h-full rounded-full bg-neutral-900 transition-all duration-300 ease-out" style={{ width: `${progress.percentage}%` }} />
              </div>
              <p className="mt-2 text-xs text-neutral-600">
                {progress.remaining > 0 ? `${progress.remaining} field${progress.remaining === 1 ? "" : "s"} left to complete.` : "Great! Ready to pay."}
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold text-neutral-700">
                Name
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Your name" required className={inputClassName("name")} type="text" />
                {fieldErrors.name && <span className="mt-1 block text-xs font-normal text-red-600">{fieldErrors.name}</span>}
              </label>

              <label className="text-sm font-semibold text-neutral-700">
                Phone
                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone number" className={inputClassName("phone")} type="tel" />
                {fieldErrors.phone && <span className="mt-1 block text-xs font-normal text-red-600">{fieldErrors.phone}</span>}
              </label>
            </div>

            <div className="mt-5">
              <label className="text-sm font-semibold text-neutral-700">
                Email
                <input name="email" value={formData.email} onChange={handleChange} placeholder="Email address" className={inputClassName("email")} type="email" />
                {fieldErrors.email && <span className="mt-1 block text-xs font-normal text-red-600">{fieldErrors.email}</span>}
              </label>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold text-neutral-700">
                Branch
                <select name="branch" value={formData.branch} onChange={handleSelectChange} required className={inputClassName("branch")}>
                  <option value="">Select a branch</option>
                  {BRANCH_OPTIONS.map((branch) => (
                    <option key={branch.storeId} value={branch.value}>{branch.label}</option>
                  ))}
                </select>
                <span className="mt-2 block text-xs font-normal text-neutral-500">Services are loaded from the selected Sedifex branch.</span>
                {fieldErrors.branch && <span className="mt-1 block text-xs font-normal text-red-600">{fieldErrors.branch}</span>}
              </label>

              <label className="text-sm font-semibold text-neutral-700">
                Date
                <input name="date" value={formData.date} onChange={handleChange} required min={new Date().toISOString().split("T")[0]} className={inputClassName("date")} type="date" />
                {fieldErrors.date && <span className="mt-1 block text-xs font-normal text-red-600">{fieldErrors.date}</span>}
              </label>
            </div>

            <div className="mt-5">
              <label className="text-sm font-semibold text-neutral-700">
                Service
                <select name="serviceId" value={formData.serviceId} onChange={handleSelectChange} required disabled={!formData.branch} className={inputClassName("serviceId")}>
                  <option value="">{formData.branch ? "Select service" : "Choose branch first"}</option>
                  {serviceOptions.map((service) => (
                    <option key={service.id} value={service.id}>{service.name}</option>
                  ))}
                </select>
                <span className="mt-2 block text-xs font-normal text-neutral-500">
                  {selectedServicePrice === null ? "Service price will appear here after selection." : `Service price: ${currency.format(selectedServicePrice)}`}
                </span>
                {fieldErrors.serviceId && <span className="mt-1 block text-xs font-normal text-red-600">{fieldErrors.serviceId}</span>}
              </label>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold text-neutral-700">
                Time
                <input name="time" value={formData.time} onChange={handleChange} required step={900} className={inputClassName("time")} type="time" />
                {fieldErrors.time && <span className="mt-1 block text-xs font-normal text-red-600">{fieldErrors.time}</span>}
              </label>

              <label className="text-sm font-semibold text-neutral-700">
                Preferred Contact Method
                <select name="contactMethod" value={formData.contactMethod} onChange={handleSelectChange} required className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200">
                  {CONTACT_OPTIONS.map((contactOption) => (
                    <option key={contactOption} value={contactOption}>{contactOption}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5">
              <label className="text-sm font-semibold text-neutral-700">
                Notes / Special requests
                <textarea name="notes" value={formData.notes} onChange={handleTextareaChange} placeholder="Share allergies, special requests, or anything our team should know." rows={4} className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200" />
              </label>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-1">
              <label className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-700 shadow-sm">
                <input name="cancellationAccepted" checked={formData.cancellationAccepted} onChange={handleCheckboxChange} type="checkbox" className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-300" />
                I agree to the no-refund policy after payment
              </label>
              {fieldErrors.cancellationAccepted && <span className="text-xs font-normal text-red-600">{fieldErrors.cancellationAccepted}</span>}
            </div>

            <p className="mt-4 text-xs text-neutral-500">Payment is handled securely through Sedifex Checkout. Your booking remains pending until payment is completed.</p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button type="submit" disabled={!canSubmit} className={`inline-flex w-full items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-sm sm:w-auto ${canSubmit ? "bg-neutral-900 hover:bg-neutral-800" : "cursor-not-allowed bg-neutral-400"}`}>
                {isSubmitting ? "Creating checkout..." : "Continue to secure payment"}
              </button>
              <p className="text-xs text-neutral-500">
                {clientValidationMessage ? clientValidationMessage : "You will be redirected to Sedifex Checkout to complete payment."}
              </p>
            </div>

            {submitMessage && (
              <div role="status" className={`mt-4 rounded-2xl border px-4 py-3 text-sm shadow-sm ${submitMessage.kind === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>
                <p className="font-semibold">{submitMessage.kind === "success" ? "Checkout ready" : "Checkout failed"}</p>
                <p className="mt-1 whitespace-pre-line">{submitMessage.text}</p>
              </div>
            )}
          </form>

          <div className="rounded-3xl border border-black/10 bg-neutral-50 p-6 shadow-lg sm:p-8">
            <h2 className="text-lg font-semibold">Booking details preview</h2>
            <p className="mt-2 text-sm text-neutral-600">This is the booking information attached to your Sedifex Checkout.</p>

            <div className="mt-5 rounded-2xl border border-black/10 bg-white p-4 text-sm text-neutral-700 whitespace-pre-line">
              Service: {selectedServiceName || "____"}
              {"\n"}Service price: {selectedServicePrice === null ? "____" : currency.format(selectedServicePrice)}
              {"\n"}Customer name: {formData.name || "____"}
              {"\n"}Date: {formData.date || "____"}
              {"\n"}Time: {formData.time || "____"}
              {"\n"}Phone: {formData.phone || "____"}
              {"\n"}Email: {formData.email || "____"}
              {"\n"}Preferred branch: {formData.branch || "____"}
              {"\n"}Sedifex store id: {activeStoreId || selectedBranch?.storeId || "____"}
              {"\n"}Contact method: {formData.contactMethod || "____"}
              {"\n"}Notes: {formData.notes || "____"}
              {"\n"}No-refund policy accepted: {formData.cancellationAccepted ? "Yes" : "No"}
            </div>

            <div className="mt-6 rounded-2xl border border-black/10 bg-white p-4 text-sm text-neutral-700">
              <h3 className="text-sm font-semibold text-neutral-900">What changed?</h3>
              <p className="mt-2 text-xs text-neutral-500">Clients no longer need to send Momo/bank details manually. The website sends the selected service to Sedifex Checkout and redirects the client to complete payment online.</p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-xs text-neutral-600 sm:text-sm">
                <li>Booking starts as pending payment.</li>
                <li>Sedifex Checkout handles the actual payment.</li>
                <li>The payment reference is generated automatically.</li>
                <li>The booking metadata includes branch, date, time, service, customer, and notes.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}
