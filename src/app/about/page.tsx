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
            Glittering Spa was founded by Gifty Mintaa in 2016 with a simple mission, to create a beauty and
            wellness space where women feel confident, relaxed, and truly cared for. What began as a single
            branch has now grown into two vibrant locations across Awoshie and Spintex, built on trust,
            quality service, and consistent results.
          </p>

          <p className="mt-4 text-neutral-700 leading-7">
            Gifty’s motivation has always been to empower women through self-care. She believes that beauty is
            more than appearance, it is confidence, comfort, and emotional well-being. Leading the business has
            come with challenges, especially managing multiple roles and responsibilities as the brand expanded,
            but her dedication and passion have remained unwavering.
          </p>

          <p className="mt-4 text-neutral-700 leading-7">
            Today, Glittering Spa is supported by a team of about 19 skilled professionals, all trained to
            deliver excellent customer care, hygiene, and modern beauty services. Under Gifty’s leadership, the
            spa continues to grow while staying true to its purpose — to inspire confidence, uplift women, and
            make every client feel beautiful inside and out.
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
