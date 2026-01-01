import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { packages, WHATSAPP_LINK } from "@/lib/site";

export default function PackagesPage() {
  return (
    <Container>
      <section className="py-12 sm:py-16">
        <SectionTitle title="Popular Packages" subtitle="Tap any package to book on WhatsApp." />

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {packages.map((p) => (
            <div key={p.title} className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="text-lg font-semibold">{p.title}</div>
                <span className="text-xs rounded-full border border-black/10 bg-neutral-50 px-2 py-1 text-neutral-700">
                  {p.tag}
                </span>
              </div>

              <p className="mt-3 text-sm text-neutral-700 leading-6">{p.desc}</p>

              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
              >
                Book this
              </a>
            </div>
          ))}
        </div>
      </section>
    </Container>
  );
}
