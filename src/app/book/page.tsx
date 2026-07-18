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
type PaymentOption = "pay_now" | "pay_later";
type CheckoutResponse = {
  checkoutUrl?: string;
  authorizationUrl?: string;
  bookingId?: string;
  bookingSaved?: boolean;
  paymentOption?: PaymentOption;
  message?: string;
  error?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isPastDateTime(date: string, time: string) {
  if (!date || !time) return false;
  const dateTime = new Date(`${date}T${time}:00`);
  return Number.isNaN(dateTime.getTime()) || dateTime.getTime() < Date.now();
}

function readServicePrice(service: ServiceOption) {
  return typeof service.price === "number" && Number.isFinite(service.price) ? service.price : null;
}

export default function BookPage() {
  const currency = useMemo(() => new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }), []);
  const [submittingOption, setSubmittingOption] = useState<PaymentOption | null>(null);
  const [submitMessage, setSubmitMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    branch: "",
    selectedServiceIds: [] as string[],
    date: "",
    time: "",
    contactMethod: "WhatsApp",
    notes: "",
    cancellationAccepted: false,
  });

  const isSubmitting = submittingOption !== null;
  const selectedBranch = useMemo(() => BRANCH_OPTIONS.find((branch) => branch.value === formData.branch) ?? null, [formData.branch]);
  const selectedServices = useMemo(
    () => serviceOptions.filter((service) => formData.selectedServiceIds.includes(service.id)),
    [formData.selectedServiceIds, serviceOptions]
  );
  const selectedServiceNames = useMemo(() => selectedServices.map((service) => service.name), [selectedServices]);
  const selectedServiceTotal = useMemo(
    () => selectedServices.reduce((total, service) => total + (readServicePrice(service) ?? 0), 0),
    [selectedServices]
  );
  const hasInvalidSelectedServicePrice = useMemo(
    () => selectedServices.some((service) => {
      const price = readServicePrice(service);
      return price === null || price <= 0;
    }),
    [selectedServices]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadServices() {
      if (!selectedBranch) {
        setServiceOptions([]);
        setFormData((prev) => ({ ...prev, selectedServiceIds: [] }));
        return;
      }

      try {
        const params = new URLSearchParams({ view: "services", storeId: selectedBranch.storeId, branch: selectedBranch.value });
        const response = await fetch(`/api/bookings/integration?${params.toString()}`, { cache: "no-store" });
        const payload = (await response.json()) as { services?: ServiceOption[] };
        if (!response.ok) throw new Error("Unable to load services.");

        if (!cancelled) {
          const nextServices = Array.isArray(payload.services) ? payload.services : [];
          const nextServiceIds = new Set(nextServices.map((service) => service.id));
          setServiceOptions(nextServices);
          setFormData((prev) => ({
            ...prev,
            selectedServiceIds: prev.selectedServiceIds.filter((serviceId) => nextServiceIds.has(serviceId)),
          }));
        }
      } catch {
        if (!cancelled) {
          setServiceOptions([]);
          setFormData((prev) => ({ ...prev, selectedServiceIds: [] }));
        }
      }
    }

    void loadServices();
    return () => {
      cancelled = true;
    };
  }, [selectedBranch]);

  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Name is required.";
    if (!formData.phone.trim()) errors.phone = "Phone number is required.";
    if (!formData.email.trim()) errors.email = "Email is required for booking updates.";
    else if (!isValidEmail(formData.email.trim())) errors.email = "Please provide a valid email address.";
    if (!formData.branch.trim()) errors.branch = "Choose a branch.";
    if (formData.selectedServiceIds.length === 0) errors.services = "Please select at least one service.";
    if (formData.selectedServiceIds.length > 0 && hasInvalidSelectedServicePrice) errors.services = "Every selected service needs a valid price before booking.";
    if (!formData.date.trim()) errors.date = "Date is required.";
    if (!formData.time.trim()) errors.time = "Time is required.";
    if (formData.date && formData.time && isPastDateTime(formData.date, formData.time)) errors.time = "Please choose a future date/time.";
    if (!formData.cancellationAccepted) errors.cancellationAccepted = "Accept the cancellation and no-refund policy before booking.";
    return errors;
  }, [formData, hasInvalidSelectedServicePrice]);

  const progress = useMemo(() => {
    const checks = [formData.name, formData.phone, formData.email, formData.branch, formData.selectedServiceIds.length > 0, formData.date, formData.time, formData.cancellationAccepted];
    const completed = checks.filter(Boolean).length;
    return { completed, total: checks.length, percentage: Math.round((completed / checks.length) * 100), remaining: checks.length - completed };
  }, [formData]);

  const clientValidationMessage = Object.values(validationErrors)[0] ?? null;
  const canSubmit = !isSubmitting && !clientValidationMessage;

  const inputClassName = (field: string) =>
    `mt-2 w-full rounded-2xl border bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-sm focus:outline-none focus:ring-2 ${fieldErrors[field] ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-neutral-200 focus:border-neutral-400 focus:ring-neutral-200"}`;

  const clearFieldError = (name: string) => {
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    clearFieldError(name);
    if (name === "branch") {
      clearFieldError("services");
      setFormData((prev) => ({ ...prev, branch: value, selectedServiceIds: [] }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    clearFieldError(name);
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleServiceToggle = (serviceId: string) => {
    clearFieldError("services");
    setFormData((prev) => {
      const isSelected = prev.selectedServiceIds.includes(serviceId);
      return {
        ...prev,
        selectedServiceIds: isSelected
          ? prev.selectedServiceIds.filter((id) => id !== serviceId)
          : [...prev.selectedServiceIds, serviceId],
      };
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitMessage(null);

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setSubmitMessage({ kind: "error", text: "Please correct the highlighted fields and try again." });
      return;
    }

    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const paymentOption: PaymentOption = submitter?.value === "pay_later" ? "pay_later" : "pay_now";

    setSubmittingOption(paymentOption);
    try {
      const response = await fetch("/api/bookings/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentOption,
          services: selectedServices.map((service) => ({
            id: service.id,
            serviceId: service.id,
            name: service.name,
            serviceName: service.name,
            price: readServicePrice(service),
            servicePrice: readServicePrice(service),
          })),
          serviceId: selectedServices[0]?.id,
          serviceName: selectedServiceNames.join(" + "),
          servicePrice: selectedServiceTotal,
          bookingDate: formData.date,
          bookingTime: formData.time,
          branchLocationId: selectedBranch?.storeId,
          branchLocationName: formData.branch,
          selectedBranchStoreId: selectedBranch?.storeId,
          selectedBranchServiceId: selectedServices[0]?.id,
          selectedBranchServiceIds: selectedServices.map((service) => service.id),
          preferredContactMethod: formData.contactMethod,
          notes: formData.notes.trim() || undefined,
          noRefundPolicyAccepted: formData.cancellationAccepted,
          customer: {
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim(),
          },
        }),
      });

      const data = (await response.json()) as CheckoutResponse;
      if (!response.ok) throw new Error(data.error ?? "Unable to save the booking.");

      if (paymentOption === "pay_later") {
        if (!data.bookingSaved && !data.bookingId) throw new Error(data.error ?? "Sedifex did not confirm the booking.");
        setSubmitMessage({
          kind: "success",
          text: data.message ?? "Your booking has been saved to Sedifex. Payment is pending, and the spa team will contact you.",
        });
        setSubmittingOption(null);
        return;
      }

      const checkoutUrl = data.checkoutUrl ?? data.authorizationUrl;
      if (!checkoutUrl) throw new Error(data.error ?? "Unable to create checkout.");

      setSubmitMessage({ kind: "success", text: "Booking saved. Redirecting you to secure Sedifex Checkout..." });
      window.location.href = checkoutUrl;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to complete the booking right now.";
      setSubmitMessage({ kind: "error", text: message });
      setSubmittingOption(null);
    }
  };

  return (
    <Container>
      <section className="rounded-[32px] bg-[#ffe6ea] px-4 py-12 sm:px-8 sm:py-16">
        <SectionTitle title="Book Your Appointment" subtitle="Choose your branch and services, then pay now through Sedifex Checkout or save the booking and pay later." />

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
              <p className="mt-2 text-xs text-neutral-600">{progress.remaining > 0 ? `${progress.remaining} field${progress.remaining === 1 ? "" : "s"} left to complete.` : "Great! Ready to book."}</p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold text-neutral-700">Name<input name="name" value={formData.name} onChange={handleInputChange} placeholder="Your name" required className={inputClassName("name")} type="text" />{fieldErrors.name && <span className="mt-1 block text-xs font-normal text-red-600">{fieldErrors.name}</span>}</label>
              <label className="text-sm font-semibold text-neutral-700">Phone<input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone number" required className={inputClassName("phone")} type="tel" />{fieldErrors.phone && <span className="mt-1 block text-xs font-normal text-red-600">{fieldErrors.phone}</span>}</label>
            </div>

            <div className="mt-5"><label className="text-sm font-semibold text-neutral-700">Email<input name="email" value={formData.email} onChange={handleInputChange} placeholder="Email address" required className={inputClassName("email")} type="email" />{fieldErrors.email && <span className="mt-1 block text-xs font-normal text-red-600">{fieldErrors.email}</span>}</label></div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold text-neutral-700">Branch<select name="branch" value={formData.branch} onChange={handleInputChange} required className={inputClassName("branch")}><option value="">Select a branch</option>{BRANCH_OPTIONS.map((branch) => <option key={branch.storeId} value={branch.value}>{branch.label}</option>)}</select><span className="mt-2 block text-xs font-normal text-neutral-500">Services are loaded from the selected branch.</span>{fieldErrors.branch && <span className="mt-1 block text-xs font-normal text-red-600">{fieldErrors.branch}</span>}</label>
              <label className="text-sm font-semibold text-neutral-700">Date<input name="date" value={formData.date} onChange={handleInputChange} required min={new Date().toISOString().split("T")[0]} className={inputClassName("date")} type="date" />{fieldErrors.date && <span className="mt-1 block text-xs font-normal text-red-600">{fieldErrors.date}</span>}</label>
            </div>

            <fieldset className={`mt-5 rounded-3xl border p-4 ${fieldErrors.services ? "border-red-300 bg-red-50" : "border-neutral-200 bg-neutral-50"}`}>
              <legend className="px-1 text-sm font-semibold text-neutral-700">Services</legend>
              <p className="mt-1 text-xs text-neutral-500">Select one, two, or more services for the same appointment.</p>
              {!formData.branch ? (
                <p className="mt-4 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-600">Choose a branch first to load available services.</p>
              ) : serviceOptions.length === 0 ? (
                <p className="mt-4 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-600">No services loaded for this branch yet. Try another branch or refresh.</p>
              ) : (
                <div className="mt-4 grid max-h-[360px] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                  {serviceOptions.map((service) => {
                    const price = readServicePrice(service);
                    const checked = formData.selectedServiceIds.includes(service.id);
                    return (
                      <label key={service.id} className={`flex cursor-pointer items-start gap-3 rounded-2xl border bg-white p-4 text-sm shadow-sm transition ${checked ? "border-neutral-900 ring-2 ring-neutral-900/10" : "border-neutral-200 hover:border-neutral-400"}`}>
                        <input type="checkbox" checked={checked} onChange={() => handleServiceToggle(service.id)} className="mt-1 h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-300" />
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold text-neutral-900">{service.name}</span>
                          <span className="mt-1 block text-xs font-normal text-neutral-500">{price === null ? "Price not set" : currency.format(price)}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
              <div className="mt-4 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700">
                <span className="font-semibold">Selected:</span> {selectedServices.length === 0 ? "No service selected" : `${selectedServices.length} service${selectedServices.length === 1 ? "" : "s"}`}
                <span className="mt-1 block font-semibold text-neutral-950">Total: {selectedServices.length === 0 ? "____" : currency.format(selectedServiceTotal)}</span>
              </div>
              {fieldErrors.services && <span className="mt-2 block text-xs font-normal text-red-600">{fieldErrors.services}</span>}
            </fieldset>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold text-neutral-700">Time<input name="time" value={formData.time} onChange={handleInputChange} required step={900} className={inputClassName("time")} type="time" />{fieldErrors.time && <span className="mt-1 block text-xs font-normal text-red-600">{fieldErrors.time}</span>}</label>
              <label className="text-sm font-semibold text-neutral-700">Preferred Contact Method<select name="contactMethod" value={formData.contactMethod} onChange={handleInputChange} required className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200">{CONTACT_OPTIONS.map((contactOption) => <option key={contactOption} value={contactOption}>{contactOption}</option>)}</select></label>
            </div>

            <div className="mt-5"><label className="text-sm font-semibold text-neutral-700">Notes / Special requests<textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Share allergies, special requests, or anything our team should know." rows={4} className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200" /></label></div>

            <div className="mt-6 grid gap-4"><label className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-700 shadow-sm"><input name="cancellationAccepted" checked={formData.cancellationAccepted} onChange={handleCheckboxChange} type="checkbox" className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-300" />I agree to the cancellation policy and the no-refund policy after payment</label>{fieldErrors.cancellationAccepted && <span className="text-xs font-normal text-red-600">{fieldErrors.cancellationAccepted}</span>}</div>

            <p className="mt-4 text-xs text-neutral-500">Both choices save your appointment in Sedifex. Pay now opens secure Sedifex Checkout; Pay later saves the payment as pending.</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button name="paymentOption" value="pay_now" type="submit" disabled={!canSubmit} className={`inline-flex w-full items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-sm ${canSubmit ? "bg-neutral-900 hover:bg-neutral-800" : "cursor-not-allowed bg-neutral-400"}`}>{submittingOption === "pay_now" ? "Preparing secure payment..." : "Pay now"}</button>
              <button name="paymentOption" value="pay_later" type="submit" disabled={!canSubmit} className={`inline-flex w-full items-center justify-center rounded-2xl border px-6 py-3 text-sm font-semibold shadow-sm ${canSubmit ? "border-neutral-900 bg-white text-neutral-900 hover:bg-neutral-50" : "cursor-not-allowed border-neutral-300 bg-neutral-100 text-neutral-400"}`}>{submittingOption === "pay_later" ? "Saving booking..." : "Pay later"}</button>
            </div>
            <p className="mt-3 text-xs text-neutral-500">{clientValidationMessage ? clientValidationMessage : "Choose how you want to pay. Your booking details are saved first."}</p>

            {submitMessage && <div role="status" className={`mt-4 rounded-2xl border px-4 py-3 text-sm shadow-sm ${submitMessage.kind === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}><p className="font-semibold">{submitMessage.kind === "success" ? "Booking saved" : "Booking not completed"}</p><p className="mt-1 whitespace-pre-line">{submitMessage.text}</p></div>}
          </form>

          <div className="rounded-3xl border border-black/10 bg-neutral-50 p-6 shadow-lg sm:p-8">
            <h2 className="text-lg font-semibold">Your booking summary</h2>
            <p className="mt-2 text-sm text-neutral-600">Review your appointment details, then choose Pay now or Pay later.</p>
            <div className="mt-5 rounded-2xl border border-black/10 bg-white p-4 text-sm text-neutral-700 whitespace-pre-line">
              Services: {selectedServiceNames.length ? selectedServiceNames.join("\n- ") : "____"}{"\n"}Total service price: {selectedServices.length === 0 ? "____" : currency.format(selectedServiceTotal)}{"\n"}Customer name: {formData.name || "____"}{"\n"}Date: {formData.date || "____"}{"\n"}Time: {formData.time || "____"}{"\n"}Phone: {formData.phone || "____"}{"\n"}Email: {formData.email || "____"}{"\n"}Preferred branch: {formData.branch || "____"}{"\n"}Contact method: {formData.contactMethod || "____"}{"\n"}Notes: {formData.notes || "____"}{"\n"}No-refund policy accepted: {formData.cancellationAccepted ? "Yes" : "No"}
            </div>
            <div className="mt-6 rounded-2xl border border-black/10 bg-white p-4 text-sm text-neutral-700"><h3 className="text-sm font-semibold text-neutral-900">How to book</h3><ul className="mt-4 list-disc space-y-2 pl-5 text-xs text-neutral-600 sm:text-sm"><li>Choose your preferred branch.</li><li>Select one or more services.</li><li>Select your appointment date and time.</li><li>Enter your contact details so our team can reach you.</li><li>Choose Pay now for secure checkout or Pay later to save the booking with payment pending.</li></ul></div>
          </div>
        </div>
      </section>
    </Container>
  );
}
