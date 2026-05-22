import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/Container";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Training Gallery | Glittering Academy",
  description:
    "View training photos from Glittering Academy, the beauty and spa training section of Glittering Med Spa Ghana.",
  path: "/academy/gallery",
  image: "/training/1.jpeg",
});

const trainingImages = ["/training/1.jpeg", "/training/2.jpeg", "/training/3.jpeg", "/training/4.jpeg"];

export default function AcademyGalleryPage() {
  return (
    <Container>
      <section className="py-12 sm:py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-700">Glittering Academy</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-rose-950 sm:text-5xl">Training gallery</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-rose-900/75 sm:text-base">
              Photos from Glittering Academy training activities, student work, and practical beauty sessions.
            </p>
          </div>
          <Link href="/academy/register" className="rounded-2xl bg-rose-950 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-black">
            Register for Training
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trainingImages.map((src, index) => (
            <div key={src} className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-rose-200 bg-white shadow-sm">
              <Image src={src} alt={`Glittering Academy training gallery image ${index + 1}`} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
            </div>
          ))}
        </div>
      </section>
    </Container>
  );
}
