"use client";

import Image from "next/image";
import { FormEvent, useMemo, useState } from "react";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { SITE } from "@/lib/site";
import { trainingCourses } from "@/lib/trainingCourses";

const trainingGallery = ["/training/1.jpeg", "/training/2.jpeg", "/training/3.jpeg", "/training/4.jpeg"];

const branchOptions = ["Awoshie Main", "Awoshie Annex", "Spintex", "Not sure yet"];
const classTimeOptions = ["Morning", "Afternoon", "Evening", "Weekend", "Not sure yet"];

type FormState = {
  studentName: string;
  phone: string;
  email: string;
  course: string;
  preferredClassTime: string;
  branch: string;
  notes: string;
};

type CheckoutResponse = {
  ok?: boolean;
  checkoutUrl?: string;
  authorizationUrl?: string;
  reference?: string;
  error?: string;
};

const initialForm: FormState = {
  studentName: "",
  phone: "",
  email: "",
  course: "",
  preferredClassTime: "",
  branch: "",
  notes: "",
};

export default function TrainingPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const selectedCourse = useMemo(
    () => trainingCourses.find((course) => course.course === form.course) ?? null,
    [form.course]
  );

  const canSubmit = Boolean(form.studentName.trim() && (form.phone.trim() || form.email.trim()) && selectedCourse && !isSubmitting);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!form.studentName.trim()) {
      setMessage({ kind: "error", text: "Enter the student name." });
      return;
    }
    if (!form.phone.trim() && !form.email.trim()) {
      setMessage({ kind: "error", text: "Enter phone or email so the school can contact you." });
      return;
    }
    if (!selectedCourse) {
      setMessage({ kind: "error", text: "Choose a course before continuing." });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/training/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: form.studentName.trim(),
          phone: form.phone.trim() || undefined,
          email: form.email.trim() || undefined,
          course: selectedCourse.course,
          preferredClassTime: form.preferredClassTime.trim() || undefined,
          branch: form.branch.trim() || undefined,
          notes: form.notes.trim() || undefined,
        }),
      });

      const data = (await response.json()) as CheckoutResponse;
      const checkoutUrl = data.checkoutUrl ?? data.authorizationUrl;
      if (!response.ok || !checkoutUrl) {
        throw new Error(data.error ?? "Unable to create payment checkout.");
      }

      setMessage({ kind: "success", text: "Registration checkout created. Redirecting to secure payment..." });
      window.location.href = checkoutUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to create checkout.";
      setMessage({ kind: "error", text: errorMessage });
      setIsSubmitting(false);
    }
  }

  return (
    <Container>
      <section className="py-12 sm:py-16">
        <SectionTitle
          title="Training School Registration"
          subtitle="Choose your course, enter your contact details, and pay online securely through Sedifex Checkout."
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trainingGallery.map((src, index) => (
            <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-black/10 bg-white">
              <Image
                src={src}
                alt={`Training photo ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <form onSubmit={handleSubmit} className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
            <div>
              <h2 className="text-xl font-semibold">Register and Pay Online</h2>
              <p className="mt-2 text-sm text-neutral-600">
                We only need your basic details. Sedifex will generate the payment reference and checkout link automatically.
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-neutral-700">
                Student name *
                <input
                  value={form.studentName}
                  onChange={(event) => updateField("studentName", event.target.value)}
                  placeholder="Student full name"
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none focus:border-brand-700"
                />
              </label>

              <label className="text-sm font-semibold text-neutral-700">
                Phone / WhatsApp *
                <input
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  placeholder="+233..."
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none focus:border-brand-700"
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-neutral-700">
                Email optional
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="student@example.com"
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none focus:border-brand-700"
                />
              </label>

              <label className="text-sm font-semibold text-neutral-700">
                Course / program *
                <select
                  value={form.course}
                  onChange={(event) => updateField("course", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none focus:border-brand-700"
                >
                  <option value="">Choose course</option>
                  {trainingCourses.map((course) => (
                    <option key={course.course} value={course.course}>
                      {course.course} — GHS {course.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-neutral-700">
                Preferred class time
                <select
                  value={form.preferredClassTime}
                  onChange={(event) => updateField("preferredClassTime", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none focus:border-brand-700"
                >
                  <option value="">Select preferred time</option>
                  {classTimeOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-semibold text-neutral-700">
                Preferred branch
                <select
                  value={form.branch}
                  onChange={(event) => updateField("branch", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none focus:border-brand-700"
                >
                  <option value="">Select branch</option>
                  {branchOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mt-4 block text-sm font-semibold text-neutral-700">
              Notes optional
              <textarea
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                placeholder="Any question, start date preference, or special note"
                rows={4}
                className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none focus:border-brand-700"
              />
            </label>

            <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50/50 p-4 text-sm text-neutral-700">
              <p className="font-semibold text-neutral-900">Sedifex mapping</p>
              <p className="mt-1">Your name, phone, course, preferred time, branch, and notes are attached to the Sedifex checkout record. Payment mode, payment status, and reference are generated by Sedifex.</p>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className={`mt-6 inline-flex w-full items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-sm ${
                canSubmit ? "bg-brand-950 hover:bg-brand-900" : "cursor-not-allowed bg-neutral-400"
              }`}
            >
              {isSubmitting ? "Creating checkout..." : "Register and Pay Online"}
            </button>

            {message ? (
              <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${message.kind === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>
                {message.text}
              </div>
            ) : null}
          </form>

          <aside className="rounded-3xl border border-black/10 bg-neutral-50 p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold">Registration Summary</h2>
            <div className="mt-5 rounded-2xl border border-black/10 bg-white p-4 text-sm text-neutral-700 whitespace-pre-line">
              Student: {form.studentName || "____"}
              {"\n"}Phone: {form.phone || "____"}
              {"\n"}Email: {form.email || "____"}
              {"\n"}Course: {selectedCourse?.course || "____"}
              {"\n"}Duration: {selectedCourse?.duration || "____"}
              {"\n"}Price: {selectedCourse ? `GHS ${selectedCourse.price.toFixed(2)}` : "____"}
              {"\n"}Preferred time: {form.preferredClassTime || "____"}
              {"\n"}Branch: {form.branch || "____"}
              {"\n"}Notes: {form.notes || "____"}
            </div>

            <div className="mt-5 rounded-2xl border border-black/10 bg-white p-4 text-sm text-neutral-700">
              <h3 className="font-semibold text-neutral-900">After payment</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-neutral-600">
                <li>Sedifex creates the payment reference.</li>
                <li>Your selected course becomes the checkout item.</li>
                <li>The school receives your registration details in the payment metadata.</li>
                <li>The team can contact you to confirm class start date and requirements.</li>
              </ul>
            </div>
          </aside>
        </div>

        <div className="mt-8 rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold">Courses, Training Duration & Charges</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-neutral-500">
                  <th className="py-2 pr-4 font-semibold">Course</th>
                  <th className="py-2 pr-4 font-semibold">Training Duration</th>
                  <th className="py-2 font-semibold">Charges</th>
                </tr>
              </thead>
              <tbody>
                {trainingCourses.map((row) => (
                  <tr key={row.course} className="border-b border-black/5 align-top">
                    <td className="py-2 pr-4 font-medium text-neutral-900">{row.course}</td>
                    <td className="py-2 pr-4 text-neutral-700">{row.duration}</td>
                    <td className="py-2 text-neutral-700">GHS {row.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-black/10 bg-neutral-50 p-6 sm:p-8">
          <h2 className="text-xl font-semibold">Starter Items & School Note</h2>
          <div className="mt-4 text-sm text-neutral-700">
            Required starter items: 2 Plastic Chairs, 1 Crate of Malt, 3 Uniforms, 2 Big Towels.
          </div>
          <p className="mt-5 text-sm text-neutral-700">
            For help with registration, please call or WhatsApp {SITE.phoneIntl}.
          </p>
        </div>
      </section>
    </Container>
  );
}
