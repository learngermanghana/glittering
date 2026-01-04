import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { categories, packages, WHATSAPP_LINK } from "@/lib/site";

export default function ServicesPage() {
  return (
    <Container>
      <section className="py-12 sm:py-16">
        <SectionTitle title="Services" subtitle="No prices yet — we can add them anytime." />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <div key={c.title} className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
              <div className="text-lg font-semibold">{c.title}</div>
              <div className="mt-1 text-sm text-neutral-600">{c.desc}</div>

              <ul className="mt-4 space-y-2 text-sm text-neutral-700">
                {c.items.map((it) => (
                  <li key={it} className="flex gap-2">
                    <span className="mt-2 h-2 w-2 rounded-full bg-neutral-900/20" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>

              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
              >
                Book
              </a>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <SectionTitle title="Popular Packages" subtitle="Quick booking options bundled for you." />

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
        </div>
      </section>
    </Container>
  );
}
