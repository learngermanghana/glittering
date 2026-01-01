"use client";

import Image from "next/image";
import { useState } from "react";

type GalleryImage = {
  src: string;
  alt: string;
  tag?: string;
};

export default function LightboxGallery({ images }: { images: GalleryImage[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const closeLightbox = () => setActiveIndex(null);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image, index) => (
          <button
            key={image.src}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="text-sm text-neutral-300">Tap to zoom</div>
                <div className="text-base font-semibold text-white">{image.alt}</div>
              </div>
              {image.tag ? (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-200">
                  {image.tag}
                </span>
              ) : null}
            </div>
          </button>
        ))}
      </div>

      {activeIndex !== null ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-4xl">
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute -top-10 right-0 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white"
            >
              Close
            </button>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-neutral-900">
              <Image
                src={images[activeIndex].src}
                alt={images[activeIndex].alt}
                fill
                className="object-cover"
              />
            </div>
            <div className="mt-3 text-center text-sm text-neutral-200">{images[activeIndex].alt}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
