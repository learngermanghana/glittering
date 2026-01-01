import Image from "next/image";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { SITE, WHATSAPP_LINK } from "@/lib/site";
import { getGalleryImages } from "@/lib/gallery";

export default function GalleryPage() {
  const images = getGalleryImages();

  return (
    <Container>
      <section className="py-12 sm:py-16">
        <SectionTitle title="Gallery" subtitle="Photos from public/gallery (and Instagram)." />

        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <a
              href={`https://instagram.com/${SITE.instagram}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-black/10 bg-neutral-50 px-4 py-2 text-sm font-semibold hover:bg-neutral-100 text-center"
            >
              View Instagram @{SITE.instagram} ↗
            </a>

            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 text-center"
            >
              Book from Gallery
            </a>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {(images.length ? images : Array.from({ length: 6 }).map((_, i) => `placeholder-${i}`)).map((src, i) =>
              typeof src === "string" && src.startsWith("/gallery/") ? (
                <div
                  key={src}
                  className="relative aspect-square overflow-hidden rounded-2xl border border-black/10 bg-neutral-50"
                >
                  <Image
                    src={src}
                    alt={`Glittering Spa gallery ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  />
                </div>
              ) : (
                <div key={String(src)} className="aspect-square rounded-2xl border border-black/10 bg-neutral-50" />
              )
            )}
          </div>

          {images.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-600">
              Add photos to <span className="font-semibold">public/gallery</span> and refresh this page.
            </p>
          ) : null}
        </div>
      </section>
    </Container>
  );
}
