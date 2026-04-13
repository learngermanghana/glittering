"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type GalleryGridProps = {
  images: string[];
};

export function GalleryGrid({ images }: GalleryGridProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const displayImages = images.length ? images : Array.from({ length: 6 }).map((_, i) => `placeholder-${i}`);

  useEffect(() => {
    if (!selectedImage) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedImage(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectedImage]);

  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {displayImages.map((src, i) =>
          typeof src === "string" && (src.startsWith("/gallery/") || src.startsWith("http")) ? (
            <button
              key={src}
              type="button"
              onClick={() => setSelectedImage(src)}
              className="relative aspect-square overflow-hidden rounded-2xl border border-black/10 bg-neutral-50 transition hover:scale-[1.01]"
              aria-label={`Open gallery image ${i + 1}`}
            >
              <Image
                src={src}
                alt={`Glittering Spa gallery ${i + 1}`}
                fill
                className="object-contain p-2"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              />
            </button>
          ) : (
            <div key={String(src)} className="aspect-square rounded-2xl border border-black/10 bg-neutral-50" />
          )
        )}
      </div>

      {selectedImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-black"
            onClick={() => setSelectedImage(null)}
          >
            Close
          </button>
          <div className="relative h-[85vh] w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
            <Image src={selectedImage} alt="Zoomed gallery image" fill className="object-contain" sizes="100vw" priority />
          </div>
        </div>
      ) : null}
    </>
  );
}
