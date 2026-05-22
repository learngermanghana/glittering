import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/Container";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Glittering Academy | Beauty, Spa, Nails and Cosmetology Training in Ghana",
  description:
    "Join Glittering Academy for practical beauty training in nails, makeup, lashes, facial treatment, massage, waxing, hair, wigs, and spa services in Ghana.",
  path: "/academy",
  image: "/training/1.jpeg",
});

const courseCategories = [
  "Nails & Pedicure",
  "Makeup & Bridal Styling",
  "Lashes & Brows",
  "Facial Treatment",
  "Massage & Body Therapy",
  "Waxing & Piercing",
  "Hair, Braids & Wigs",
  "Body Sculpting",
];

const steps = [
  { title: "Choose a course", text: "View available beauty and spa training options with fees and duration." },
  { title: "Register online", text: "Submit apprentice details and continue to secure checkout." },
  { title: "Start practical training", text: "Attend training, follow academy rules, and build real practical skills." },
];

export default function AcademyPage() {
  return (
    <Container>
      <section className="py-12 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-800">Glittering Academy</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-rose-950 sm:text-6xl">Train for a beauty career with practical hands-on courses.</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-rose-900/80 sm:text-lg">
              Glittering Academy is the training side of the brand. Students can explore courses, check fees and rules, register online, and prepare for practical spa, salon, nails, makeup, and cosmetology training.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/academy/courses" className="rounded-2xl bg-rose-950 px-6 py-3 text-center text-sm font-semibold text-white shadow-sm shadow-rose-200 hover:bg-black">
                View Courses
              </Link>
              <Link href="/academy/register" className="rounded-2xl bg-rose-700 px-6 py-3 text-center text-sm font-semibold text-white shadow-sm shadow-rose-200 hover:bg-rose-800">
                Register Now
              </Link>
              <Link href="/academy/fees" className="rounded-2xl border border-rose-300 bg-white px-6 py-3 text-center text-sm font-semibold text-rose-950 hover:bg-rose-50">
                Fees & Rules
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {["/training/1.jpeg", "/training/2.jpeg", "/training/3.jpeg", "/training/4.jpeg"].map((src, index) => (
              <div key={src} className={`relative overflow-hidden rounded-3xl border border-rose-200 bg-white shadow-sm ${index === 0 ? "aspect-[4/5]" : "aspect-square"}`}>
                <Image src={src} alt={`Glittering Academy training photo ${index + 1}`} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 22vw" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-rose-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-700">Course areas</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-rose-950">What students can learn</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {courseCategories.map((item) => (
              <Link key={item} href="/academy/courses" className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-4 text-sm font-semibold text-rose-950 hover:bg-white">
                {item}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="rounded-3xl border border-rose-200 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-sm font-bold text-rose-900">{index + 1}</div>
              <h3 className="mt-4 text-lg font-semibold text-rose-950">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-rose-900/75">{step.text}</p>
            </div>
          ))}
        </div>
      </section>
    </Container>
  );
}
