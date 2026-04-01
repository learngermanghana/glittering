"use client";

import Image from "next/image";
import { FormEvent } from "react";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { SITE } from "@/lib/site";

const healthComplications = [
  "Stomach Ulcer",
  "Hepatitis B",
  "Skin Disease",
  "Eye Problem",
  "Blood Pressure",
  "Any Other? Specify",
];

const trainingGallery = ["/training/1.jpeg", "/training/2.jpeg", "/training/3.jpeg", "/training/4.jpeg"];

const apprenticeFields = [
  { key: "full_name", label: "Full Name" },
  { key: "date_of_birth", label: "Date of Birth" },
  { key: "place_of_birth", label: "Place of Birth" },
  { key: "nationality", label: "Nationality" },
  { key: "religion", label: "Religion" },
  { key: "marital_status", label: "Marital Status" },
  { key: "children_count", label: "Number of children (if any)" },
  { key: "hometown", label: "Hometown" },
  { key: "residence", label: "Residence" },
  { key: "contact", label: "Contact" },
  { key: "email", label: "Email" },
  { key: "education", label: "Highest level of education" },
  { key: "qualification_year", label: "Year Qualification" },
  { key: "school_name", label: "Name of School" },
  { key: "age", label: "Age" },
  { key: "apprentice_sign_date", label: "Sign Date" },
];

const guarantorFields = [
  { key: "guarantor_full_name", label: "Full Name" },
  { key: "guarantor_relationship", label: "Relationship with Apprentice" },
  { key: "guarantor_residence", label: "Residence" },
  { key: "guarantor_contact", label: "Contact" },
  { key: "guarantor_sign_date", label: "Sign Date" },
];

const courseRows = [
  { course: "Lashes", duration: "Two (2) Weeks Training", charge: "Gh¢ 1000.00" },
  { course: "Pedicure", duration: "One (1) Month Training", charge: "Gh¢ 1200.00" },
  { course: "Manicure", duration: "One (1) Month Training", charge: "Gh¢ 1500.00" },
  { course: "Acrylic Nails", duration: "Three (3) Months Training", charge: "Gh¢ 700.00" },
  { course: "Press On Nails", duration: "Two (2) Weeks Training", charge: "Gh¢ 850.00" },
  { course: "Gel / Polishing", duration: "One (1) Month Training", charge: "Gh¢ 1000.00" },
  { course: "Makeup", duration: "Three (3) Months Training", charge: "Gh¢ 1500.00" },
  { course: "Bridal Hair Styling", duration: "Two (2) Weeks Training", charge: "Gh¢ 700.00" },
  { course: "Machine Wig Making", duration: "Three (3) Months Training", charge: "Gh¢ 850.00" },
  { course: "Facial", duration: "Six (6) Months Training", charge: "Gh¢ 1500.00" },
  { course: "Waxing", duration: "Two (2) Weeks Training", charge: "Gh¢ 500.00" },
  { course: "Massage", duration: "Two (2) Weeks Training", charge: "Gh¢ 350.00" },
  { course: "Body Scrub / Polish / Wrap", duration: "Two (2) Weeks Training", charge: "Gh¢ 1,500.00" },
  { course: "Skin Tag Removal", duration: "Two (2) Weeks Training", charge: "Gh¢ 2000.00" },
  { course: "Piercing", duration: "Two (2) Weeks Training", charge: "Gh¢ 2000.00" },
  { course: "Tying of Gele / Lash Extension", duration: "Two (2) Weeks Training", charge: "Gh¢ 2000.00" },
  { course: "Breast Enlargement / Firming", duration: "Six (6) Months Training", charge: "Gh¢ 2000.00" },
  { course: "Body Sculpting / Cavitation + Wood Therapy", duration: "Six (6) Months Training", charge: "Gh¢ 2000.00" },
  { course: "Butt Vacuum / Hip Vacuum / Fat Dissolving", duration: "Six (6) Months Training", charge: "Gh¢ 2000.00" },
  { course: "Stretch Marks / Tattoo / Scar Removal", duration: "Six (6) Months Training", charge: "Gh¢ 2000.00" },
  { course: "Micro Blading Brows", duration: "Three (3) Months Training", charge: "Gh¢ 1500.00" },
  { course: "Corn roll / Rasta / Sow-in / Installation", duration: "One (1) Year Training", charge: "Gh¢ 1500.00" },
  { course: "Hair Washing / Hair Treatment / Hair Touch up / Locks", duration: "Three (3) Months Training", charge: "Gh¢ 700.00" },
];

export default function TrainingPage() {
  const whatsappNumber = SITE.phoneIntl.replace(/\D/g, "");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const studentDetails = apprenticeFields
      .map(({ key, label }) => `${label}: ${String(formData.get(key) ?? "").trim() || "N/A"}`)
      .join("\n");

    const guarantorDetails = guarantorFields
      .map(({ key, label }) => `${label}: ${String(formData.get(key) ?? "").trim() || "N/A"}`)
      .join("\n");

    const selectedHealthConditions = healthComplications
      .filter((item) => formData.get(`health_${item}`) === "on")
      .join(", ");

    const message = [
      "Hello Glittering Spa, I want to register for training.",
      "",
      "Apprentice Bio Data",
      studentDetails,
      "",
      "Health Complications",
      selectedHealthConditions || "None selected",
      "",
      "Guarantor Details",
      guarantorDetails,
    ].join("\n");

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Container>
      <section className="py-12 sm:py-16">
        <SectionTitle
          title="Training School Registration"
          subtitle="Fill this form and click Send to share your registration details instantly on WhatsApp."
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

        <div className="mt-8 rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-semibold">Apprentice Bio Data</h2>
          <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
            {apprenticeFields.map(({ key, label }) => (
              <label key={key} className="text-sm text-neutral-700">
                <span className="mb-1 block font-medium">{label}</span>
                <input
                  type="text"
                  name={key}
                  className="w-full rounded-xl border border-black/15 px-3 py-2 text-sm outline-none focus:border-brand-700"
                />
              </label>
            ))}

            <fieldset className="sm:col-span-2 rounded-2xl border border-black/10 p-4">
              <legend className="px-1 text-sm font-semibold">Health Complications (tick any)</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                {healthComplications.map((item) => (
                  <label key={item} className="flex items-center gap-2 text-sm text-neutral-700">
                    <input type="checkbox" name={`health_${item}`} className="h-4 w-4 rounded border-black/20" />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="sm:col-span-2 rounded-2xl border border-black/10 p-4">
              <legend className="px-1 text-sm font-semibold">Guarantor Details</legend>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {guarantorFields.map(({ key, label }) => (
                  <label key={key} className="text-sm text-neutral-700">
                    <span className="mb-1 block font-medium">{label}</span>
                    <input
                      type="text"
                      name={key}
                      className="w-full rounded-xl border border-black/15 px-3 py-2 text-sm outline-none focus:border-brand-700"
                    />
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="sm:col-span-2 flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-2xl bg-brand-950 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-900"
              >
                Send Registration on WhatsApp
              </button>
              <span className="text-sm text-neutral-600">
                This opens WhatsApp with your filled student details ready to send.
              </span>
            </div>
          </form>
        </div>

        <div className="mt-8 rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm">
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
                {courseRows.map((row) => (
                  <tr key={row.course} className="border-b border-black/5 align-top">
                    <td className="py-2 pr-4 font-medium text-neutral-900">{row.course}</td>
                    <td className="py-2 pr-4 text-neutral-700">{row.duration}</td>
                    <td className="py-2 text-neutral-700">{row.charge}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-black/10 bg-neutral-50 p-6 sm:p-8">
          <h2 className="text-xl font-semibold">Bye Laws & Starter Items</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-neutral-700">
            <li>Apprentice should respect mistress, senior apprentices, and clients.</li>
            <li>If apprentice stops work, guarantor pays outstanding balance and paid cash is not refundable.</li>
            <li>Apprentice should report at 7:00am to tidy up the shop and obey instructions.</li>
            <li>Repeated absence without permission may lead to punishment, suspension, or dismissal.</li>
            <li>Parents/Guardian are permitted to visit apprentice regularly.</li>
          </ol>
          <div className="mt-5 text-sm text-neutral-700">
            Required starter items: 2 Plastic Chairs, 1 Crate of Malt, 3 Uniforms, 2 Big Towels.
          </div>
          <div className="mt-3 text-sm font-medium text-neutral-900">Signatories: Manageress • Apprentice • Guarantor</div>
          <p className="mt-5 text-sm text-neutral-700">
            For help with this form, please call or WhatsApp {SITE.phoneIntl}.
          </p>
        </div>
      </section>
    </Container>
  );
}
