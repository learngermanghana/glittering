import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { SITE, WHATSAPP_LINK } from "@/lib/site";
import { getGalleryImages } from "@/lib/gallery";
import { GalleryGrid } from "@/components/GalleryGrid";

export default async function GalleryPage() {
  const images = await getGalleryImages();

  return (
    <Container>
      <section className="py-12 sm:py-16">
        <SectionTitle title="Gallery" subtitle="Photos from Sedifex promo gallery (with storage/local fallback)." />

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

          <GalleryGrid images={images} />

          {images.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-600">
              Publish promo gallery items in Firestore under <span className="font-semibold">stores/&lt;storeId&gt;/promoGallery</span> (or add legacy Storage files under <span className="font-semibold">stores/&lt;storeId&gt;/promo-gallery</span>) and refresh this page.
            </p>
          ) : null}
        </div>
      </section>
    </Container>
  );
}
