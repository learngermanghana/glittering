"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { SITE } from "@/lib/site";

type FieldConfig = {
  key: string;
  label: string;
  required?: boolean;
  type?: "text" | "email" | "tel" | "date" | "number";
  options?: string[];
  placeholder?: string;
  min?: number;
  max?: number;
  inputMode?: "text" | "numeric" | "tel" | "email";
};

const healthComplications = [
  "None",
  "Stomach Ulcer",
  "Hepatitis B",
  "Skin Disease",
  "Eye Problem",
  "Blood Pressure",
  "Asthma",
  "Diabetes",
  "Pregnancy",
  "Any Other? Specify",
];

const classTimeOptions = ["Morning", "Afternoon", "Evening", "Weekend", "Flexible / Call me"];
const branchOptions = ["Awoshie", "Spintex", "Online / To be confirmed"];
const nationalityOptions = ["Ghanaian", "Nigerian", "Togolese", "Ivorian", "Liberian", "Other"];
const religionOptions = ["Christian", "Muslim", "Traditional", "Other", "Prefer not to say"];
const maritalStatusOptions = ["Single", "Married", "Divorced", "Widowed", "Prefer not to say"];
const educationOptions = ["JHS", "SHS", "TVET / Vocational", "Diploma", "HND", "Degree", "Postgraduate", "Other"];
const relationshipOptions = ["Parent", "Guardian", "Spouse", "Sibling", "Relative", "Employer", "Friend", "Other"];

const trainingGallery = ["/training/1.jpeg", "/training/2.jpeg", "/training/3.jpeg", "/training/4.jpeg"];

const apprenticeFields: FieldConfig[] = [
  { key: "full_name", label: "Full Name", required: true, placeholder: "e.g. Ama Mensah" },
  { key: "date_of_birth", label: "Date of Birth", type: "date" },
  { key: "place_of_birth", label: "Place of Birth", placeholder: "e.g. Accra" },
  { key: "nationality", label: "Nationality", options: nationalityOptions },
  { key: "religion", label: "Religion", options: religionOptions },
  { key: "marital_status", label: "Marital Status", options: maritalStatusOptions },
  { key: "children_count", label: "Number of children (if any)", type: "number", min: 0, max: 20, placeholder: "0" },
  { key: "hometown", label: "Hometown", placeholder: "e.g. Cape Coast" },
  { key: "residence", label: "Residence", placeholder: "e.g. Tema Community 25" },
  { key: "contact", label: "Contact", required: true, type: "tel", inputMode: "tel", placeholder: "e.g. 0244123456" },
  { key: "email", label: "Email", type: "email", inputMode: "email", placeholder: "name@example.com" },
  { key: "education", label: "Highest level of education", options: educationOptions },
  { key: "qualification_year", label: "Year Qualification", type: "number", min: 1970, max: 2100, placeholder: "2024" },
  { key: "school_name", label: "Name of School", placeholder: "Previous school attended" },
  { key: "age", label: "Age", type: "number", min: 10, max: 90, placeholder: "Auto or type age" },
  { key: "preferred_class_time", label: "Preferred Class Time", options: classTimeOptions },
  { key: "branch", label: "Preferred Branch", options: branchOptions },
  { key: "apprentice_sign_date", label: "Sign Date", type: "date" },
];

const guarantorFields: FieldConfig[] = [
  { key: "guarantor_full_name", label: "Full Name", placeholder: "Guarantor full name" },
  { key: "guarantor_relationship", label: "Relationship with Apprentice", options: relationshipOptions },
  { key: "guarantor_residence", label: "Residence", placeholder: "Guarantor residence" },
  { key: "guarantor_contact", label: "Contact", type: "tel", inputMode: "tel", placeholder: "e.g. 0244123456" },
  { key: "guarantor_sign_date", label: "Sign Date", type: "date" },
];

const courseRows = [
  { course: "Lashes", duration: "Two (2) Weeks Training", price: 1000 },
  { course: "Pedicure", duration: "One (1) Month Training", price: 1200 },
  { course: "Manicure", duration: "One (1) Month Training", price: 1500 },
  { course: "Acrylic Nails", duration: "Three (3) Months Training", price: 700 },
  { course: "Press On Nails", duration: "Two (2) Weeks Training", price: 850 },
  { course: "Gel / Polishing", duration: "One (1) Month Training", price: 1000 },
  { course: "Makeup", duration: "Three (3) Months Training", price: 1500 },
  { course: "Bridal Hair Styling", duration: "Two (2) Weeks Training", price: 700 },
  { course: "Machine Wig Making", duration: "Three (3) Months Training", price: 850 },
  { course: "Facial", duration: "Six (6) Months Training", price: 1500 },
  { course: "Waxing", duration: "Two (2) Weeks Training", price: 500 },
  { course: "Massage", duration: "Two (2) Weeks Training", price: 350 },
  { course: "Body Scrub / Polish / Wrap", duration: "Two (2) Weeks Training", price: 1500 },
  { course: "Skin Tag Removal", duration: "Two (2) Weeks Training", price: 2000 },
  { course: "Piercing", duration: "Two (2) Weeks Training", price: 2000 },
  { course: "Tying of Gele / Lash Extension", duration: "Two (2) Weeks Training", price: 2000 },
  { course: "Breast Enlargement / Firming", duration: "Six (6) Months Training", price: 2000 },
  { course: "Body Sculpting / Cavitation + Wood Therapy", duration: "Six (6) Months Training", price: 2000 },
  { course: "Butt Vacuum / Hip Vacuum / Fat Dissolving", duration: "Six (6) Months Training", price: 2000 },
  { course: "Stretch Marks / Tattoo / Scar Removal", duration: "Six (6) Months Training", price: 2000 },
  { course: "Micro Blading Brows", duration: "Three (3) Months Training", price: 1500 },
  { course: "Corn roll / Rasta / Sow-in / Installation", duration: "One (1) Year Training", price: 1500 },
  { course: "Hair Washing / Hair Treatment / Hair Touch up / Locks", duration: "Three (3) Months Training", price: 700 },
];

function readFormGroup(formData: FormData, fields: Array<{ key: string; label: string }>) {
  return Object.fromEntries(fields.map(({ key }) => [key, String(formData.get(key) ?? "").trim()]));
}

function calculateAge(dateOfBirth: string) {
  if (!dateOfBirth) return "";
  const date = new Date(dateOfBirth);
  if (Number.isNaN(date.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) age -= 1;
  return age > 0 && age < 120 ? String(age) : "";
}

function FieldInput({ field, onDateOfBirthChange }: { field: FieldConfig; onDateOfBirthChange?: (value: string) => void }) {
  const baseClass = "w-full rounded-xl border border-black/15 px-3 py-2 text-sm outline-none focus:border-brand-700";
  const common = {
    name: field.key,
    required: field.required,
    className: baseClass,
    placeholder: field.placeholder,
  };

  if (field.options?.length) {
    return (
      <select {...common} defaultValue="">
        <option value="" disabled>Select {field.label.toLowerCase()}</option>
        {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    );
  }

  return (
    <input
      {...common}
      type={field.type ?? "text"}
      min={field.min}
      max={field.max}
      inputMode={field.inputMode}
      onChange={field.key === "date_of_birth" ? (event) => onDateOfBirthChange?.(event.target.value) : undefined}
    />
  );
}

export default function TrainingPage() {
  const initialCourse = courseRows[0]?.course ?? "";
  const [selectedCourse, setSelectedCourse] = useState(initialCourse);
  const [calculatedAge, setCalculatedAge] = useState("");
  const [otherHealth, setOtherHealth] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const selectedCourseRow = useMemo(() => courseRows.find((row) => row.course === selectedCourse) ?? courseRows[0], [selectedCourse]);
  const currency = useMemo(() => new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }), []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const courseFromQuery = new URLSearchParams(window.location.search).get("course")?.trim() ?? "";
    if (!courseFromQuery) return;
    if (!courseRows.some((row) => row.course === courseFromQuery)) return;
    setSelectedCourse(courseFromQuery);
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    const formData = new FormData(event.currentTarget);
    const apprentice = readFormGroup(formData, apprenticeFields);
    const guarantor = readFormGroup(formData, guarantorFields);
    const selectedHealthConditions = healthComplications
      .filter((item) => item !== "Any Other? Specify")
      .filter((item) => formData.get(`health_${item}`) === "on");
    const otherHealthValue = String(formData.get("health_other") ?? "").trim();
    if (otherHealthValue) selectedHealthConditions.push(otherHealthValue);

    if (!selectedCourseRow) {
      setMessage({ type: "error", text: "Please select a course." });
      return;
    }
    if (!apprentice.full_name) {
      setMessage({ type: "error", text: "Please enter the apprentice full name." });
      return;
    }
    if (!apprentice.contact && !apprentice.email) {
      setMessage({ type: "error", text: "Please enter phone contact or email." });
      return;
    }
    if (apprentice.contact && apprentice.contact.replace(/\D/g, "").length < 9) {
      setMessage({ type: "error", text: "Please enter a valid phone number." });
      return;
    }
    if (guarantor.guarantor_contact && guarantor.guarantor_contact.replace(/\D/g, "").length < 9) {
      setMessage({ type: "error", text: "Please enter a valid guarantor phone number." });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/training/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course: selectedCourseRow.course,
          coursePrice: selectedCourseRow.price,
          duration: selectedCourseRow.duration,
          apprentice,
          guarantor,
          healthComplications: selectedHealthConditions,
          notes: String(formData.get("notes") ?? "").trim(),
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string; checkoutUrl?: string; authorizationUrl?: string };
      const checkoutUrl = data.checkoutUrl || data.authorizationUrl;
      if (!response.ok || !checkoutUrl) throw new Error(data.error || "Unable to open checkout.");
      setMessage({ type: "success", text: "Registration saved. Redirecting to secure checkout..." });
      window.location.href = checkoutUrl;
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Unable to create registration checkout." });
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <section className="py-12 sm:py-16">
        <SectionTitle title="Training School Registration" subtitle="Register for a beauty course, save your student details in Sedifex, and continue to secure online payment." />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trainingGallery.map((src, index) => (
            <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-black/10 bg-white">
              <Image src={src} alt={`Training photo ${index + 1}`} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold">Apprentice Bio Data</h2>
          <p className="mt-2 text-sm text-neutral-600">Selected course: <strong>{selectedCourseRow.course}</strong> · {selectedCourseRow.duration} · <strong>{currency.format(selectedCourseRow.price)}</strong></p>
          <p className="mt-2 text-sm text-neutral-600">Most fields now use dropdowns, date pickers, and number inputs to reduce typing errors before the data enters Sedifex.</p>
          <p className="mt-2 text-sm text-neutral-600">Need to pick from the latest Sedifex course list? <Link href="/academy/courses" className="font-semibold text-neutral-900 underline underline-offset-2">View Courses</Link>.</p>
          <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
            <label className="text-sm text-neutral-700 sm:col-span-2">
              <span className="mb-1 block font-medium">Course</span>
              <select value={selectedCourse} onChange={(event) => setSelectedCourse(event.target.value)} className="w-full rounded-xl border border-black/15 px-3 py-2 text-sm outline-none focus:border-brand-700">
                {courseRows.map((row) => <option key={row.course} value={row.course}>{row.course} — {row.duration} — {currency.format(row.price)}</option>)}
              </select>
            </label>

            {apprenticeFields.map((field) => {
              const isAgeField = field.key === "age";
              return (
                <label key={field.key} className="text-sm text-neutral-700">
                  <span className="mb-1 block font-medium">{field.label}{field.required ? " *" : ""}</span>
                  {isAgeField ? (
                    <input
                      type="number"
                      name={field.key}
                      min={field.min}
                      max={field.max}
                      value={calculatedAge}
                      onChange={(event) => setCalculatedAge(event.target.value)}
                      className="w-full rounded-xl border border-black/15 px-3 py-2 text-sm outline-none focus:border-brand-700"
                      placeholder={field.placeholder}
                    />
                  ) : (
                    <FieldInput field={field} onDateOfBirthChange={(value) => setCalculatedAge(calculateAge(value))} />
                  )}
                  {field.key === "contact" && <span className="mt-1 block text-xs text-neutral-500">Use an active WhatsApp number.</span>}
                </label>
              );
            })}

            <fieldset className="rounded-2xl border border-black/10 p-4 sm:col-span-2">
              <legend className="px-1 text-sm font-semibold">Health Complications (tick any)</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                {healthComplications.map((item) => (
                  <label key={item} className="flex items-center gap-2 text-sm text-neutral-700">
                    <input type="checkbox" name={`health_${item}`} className="h-4 w-4 rounded border-black/20" onChange={item === "Any Other? Specify" ? (event) => !event.target.checked && setOtherHealth("") : undefined} />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
              <label className="mt-4 block text-sm text-neutral-700">
                <span className="mb-1 block font-medium">Other health note</span>
                <input name="health_other" value={otherHealth} onChange={(event) => setOtherHealth(event.target.value)} className="w-full rounded-xl border border-black/15 px-3 py-2 text-sm outline-none focus:border-brand-700" placeholder="Only type here if you selected Any Other" />
              </label>
            </fieldset>

            <fieldset className="rounded-2xl border border-black/10 p-4 sm:col-span-2">
              <legend className="px-1 text-sm font-semibold">Guarantor Details</legend>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {guarantorFields.map((field) => (
                  <label key={field.key} className="text-sm text-neutral-700">
                    <span className="mb-1 block font-medium">{field.label}</span>
                    <FieldInput field={field} />
                    {field.key === "guarantor_contact" && <span className="mt-1 block text-xs text-neutral-500">Use a reachable phone number for verification.</span>}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="text-sm text-neutral-700 sm:col-span-2">
              <span className="mb-1 block font-medium">Notes</span>
              <textarea name="notes" rows={3} className="w-full rounded-xl border border-black/15 px-3 py-2 text-sm outline-none focus:border-brand-700" placeholder="Anything the training team should know." />
            </label>

            <div className="flex flex-wrap gap-3 pt-2 sm:col-span-2">
              <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center rounded-2xl bg-neutral-950 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400">
                {isSubmitting ? "Preparing checkout..." : "Register and Pay Online"}
              </button>
              <span className="text-sm text-neutral-600">Student details will be saved in Sedifex before payment opens.</span>
            </div>
            {message && <div className={`rounded-2xl border px-4 py-3 text-sm sm:col-span-2 ${message.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>{message.text}</div>}
          </form>
        </div>

        <div className="mt-8 rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold">Courses, Training Duration & Charges</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead><tr className="border-b border-black/10 text-neutral-500"><th className="py-2 pr-4 font-semibold">Course</th><th className="py-2 pr-4 font-semibold">Training Duration</th><th className="py-2 font-semibold">Charges</th></tr></thead>
              <tbody>{courseRows.map((row) => <tr key={row.course} className="border-b border-black/5 align-top"><td className="py-2 pr-4 font-medium text-neutral-900">{row.course}</td><td className="py-2 pr-4 text-neutral-700">{row.duration}</td><td className="py-2 text-neutral-700">{currency.format(row.price)}</td></tr>)}</tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-black/10 bg-neutral-50 p-6 sm:p-8">
          <h2 className="text-xl font-semibold">Bye Laws & Starter Items</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-neutral-700"><li>Apprentice should respect mistress, senior apprentices, and clients.</li><li>If apprentice stops work, guarantor pays outstanding balance and paid cash is not refundable.</li><li>Apprentice should report at 7:00am to tidy up the shop and obey instructions.</li><li>Repeated absence without permission may lead to punishment, suspension, or dismissal.</li><li>Parents/Guardian are permitted to visit apprentice regularly.</li></ol>
          <div className="mt-5 text-sm text-neutral-700">Required starter items: 2 Plastic Chairs, 1 Crate of Malt, 3 Uniforms, 2 Big Towels.</div>
          <div className="mt-3 text-sm font-medium text-neutral-900">Signatories: Manageress • Apprentice • Guarantor</div>
          <p className="mt-5 text-sm text-neutral-700">For help with this form, please call or WhatsApp {SITE.phoneIntl}.</p>
        </div>
      </section>
    </Container>
  );
}
