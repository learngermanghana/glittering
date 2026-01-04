import Image from "next/image";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { SITE, WHATSAPP_LINK } from "@/lib/site";

const highlights = [
  {
    title: "Rooted in Ghana",
    description:
      "From Accra to every guest who walks in, our story is proudly Ghanaian. We blend local care rituals with modern spa science for unforgettable results.",
  },
  {
    title: "Best Spa & Make Shop",
    description:
      "Sero is celebrated as a best spa and make shop in Ghana, known for glowing skin, flawless makeup artistry, and a calm atmosphere that feels like home.",
  },
  {
    title: "Results you can feel",
    description:
      "Our team delivers consistent outcomes with premium products, thoughtful consultations, and a commitment to hygiene, comfort, and confidence.",
  },
];

const pillars = [
  {
    title: "Sero Signature Care",
    detail:
      "We listen first, then craft a personalized ritual that aligns with your skin goals, your schedule, and your celebration moments.",
  },
  {
    title: "Beauty for every milestone",
    detail:
      "From bridal glow-ups to everyday self-care, we make sure you leave with a radiant finish and a relaxed heart.",
  },
  {
    title: "Community-centered growth",
    detail:
      "We invest in training, mentorship, and a supportive culture so every guest meets a confident, capable professional.",
  },
];

export default function TheStoryPage() {
  return (
    <Container>
      <section className="py-12 sm:py-16">
        <SectionTitle
          title="The Story"
          subtitle="Sero — the best spa and make shop in Ghana for serene, radiant beauty."
        />

        <div className="grid gap-6 rounded-3xl border border-black/10 bg-white p-6 shadow-sm lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <p className="text-neutral-700 leading-7">
            At {SITE.name}, we call this journey Sero — a story of calm luxury, Ghanaian pride, and modern beauty
            artistry. Our mission is simple: create a public space where everyone can discover a confident glow and
            leave feeling refreshed, cared for, and celebrated.
          </p>
          <p className="mt-4 text-neutral-700 leading-7">
            What started as a small studio has grown into a trusted destination for skin, body, and makeup services.
            We are known across Ghana for our warm hospitality, strict hygiene standards, and attention to detail.
            Whether you are preparing for a special event or just need a reset, our team crafts a serene experience
            tailored to you.
          </p>
          <div className="relative min-h-[260px] overflow-hidden rounded-3xl border border-black/10 bg-neutral-100 lg:row-span-2 lg:min-h-[320px]">
            <Image
              src="/gallery/pexels-lombejr-5324588.jpg"
              alt="Guest relaxing during a spa ritual"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
              priority
            />
          </div>
        </div>
      </section>

      <section className="pb-12 sm:pb-16">
        <div className="grid gap-4 md:grid-cols-3">
          {highlights.map((item) => (
            <div key={item.title} className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-neutral-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pb-12 sm:pb-16">
        <div className="rounded-3xl border border-black/10 bg-neutral-900 p-6 text-white shadow-sm">
          <h3 className="text-2xl font-semibold">A public page for the story behind the glow</h3>
          <p className="mt-3 text-sm leading-6 text-white/80">
            The Sero story is about more than treatments. It is about creating a space where beauty professionals
            thrive, guests feel seen, and Ghana shines on every global stage. Every appointment is a chapter in this
            growing story.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h4 className="text-base font-semibold">{pillar.title}</h4>
                <p className="mt-2 text-sm leading-6 text-white/80">{pillar.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="flex flex-col gap-4 rounded-3xl border border-black/10 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-neutral-900">Visit Sero today</h3>
            <p className="mt-2 text-sm text-neutral-600">
              Discover why {SITE.name} is trusted as Ghana’s best spa and make shop. We are ready to welcome you.
            </p>
          </div>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            Book on WhatsApp
          </a>
        </div>
      </section>
    </Container>
  );
}
