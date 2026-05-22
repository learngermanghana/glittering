import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Academy Fees, Rules and Starter Items | Glittering Academy",
  description:
    "Review Glittering Academy training fees guidance, apprentice rules, starter items, and registration steps before joining a beauty or spa course.",
  path: "/academy/fees",
  image: "/training/1.jpeg",
});

const rules = [
  "Apprentice should respect the manageress, senior apprentices, instructors, and clients.",
  "If an apprentice stops training, the guarantor is responsible for any outstanding balance and paid cash is not refundable.",
  "Apprentice should report early, keep the training area tidy, and obey instructions.",
  "Repeated absence without permission may lead to punishment, suspension, or dismissal.",
  "Parents or guardians are permitted to visit apprentices regularly.",
];

const starterItems = ["2 Plastic Chairs", "1 Crate of Malt", "3 Uniforms", "2 Big Towels"];

export default function AcademyFeesPage() {
  return (
    <Container>
      <section className="py-12 sm:py-16">
        <div className="rounded-3xl border border-rose-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-700">Glittering Academy</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-rose-950 sm:text-5xl">Fees, rules, and starter items</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-rose-900/75 sm:text-base">
            This page helps students and guardians understand the training expectations before registration. For the latest course prices and duration, view the live course list from Sedifex.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/academy/courses" className="rounded-2xl bg-rose-950 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-black">
              View Course Fees
            </Link>
            <Link href="/academy/register" className="rounded-2xl bg-rose-700 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-rose-800">
              Register Now
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-3xl border border-rose-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-rose-950">Academy bye-laws</h2>
            <ol className="mt-5 list-decimal space-y-3 pl-5 text-sm leading-7 text-rose-900/80">
              {rules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ol>
          </div>

          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-rose-950">Starter items</h2>
            <div className="mt-5 grid gap-3">
              {starterItems.map((item) => (
                <div key={item} className="rounded-2xl border border-rose-100 bg-white px-4 py-3 text-sm font-semibold text-rose-950">
                  {item}
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-7 text-rose-900/75">
              Signatories usually include the Manageress, Apprentice, and Guarantor. Students should complete registration with accurate contact details.
            </p>
          </div>
        </div>
      </section>
    </Container>
  );
}
