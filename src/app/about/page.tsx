import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { SITE, WHATSAPP_LINK } from "@/lib/site";

export default function AboutPage() {
  return (
    <Container>
      <section className="py-12 sm:py-16">
        <SectionTitle title={`About ${SITE.name}`} subtitle="A calm, clean, welcoming space for your self-care." />

        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <p className="text-neutral-700 leading-7">
            At {SITE.name}, we combine comfort, cleanliness, and professional care to give you results you can
            see and relaxation you can feel. Whether you’re coming for spa therapy, beauty, salon services, or
            nails — we’ll make your experience smooth and enjoyable.
          </p>

          <p className="mt-4 text-neutral-700 leading-7">
            Location: <span className="font-semibold">{SITE.location}</span>. We’re open <span className="font-semibold">Mon–Sat</span>.
          </p>

          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            Book on WhatsApp
          </a>
        </div>
      </section>
    </Container>
  );
}
