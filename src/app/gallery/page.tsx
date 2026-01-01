import Link from "next/link";
import LightboxGallery from "../components/LightboxGallery";
import { galleryImages, INSTAGRAM } from "../data";

function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>;
}

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="border-b border-white/10 bg-neutral-950/90">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="font-semibold">
              ← Back to Home
            </Link>
            <a
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-neutral-200"
              href={`https://instagram.com/${INSTAGRAM}`}
              target="_blank"
              rel="noreferrer"
            >
              Instagram @{INSTAGRAM}
            </a>
          </div>
        </Container>
      </header>

      <main className="py-14 sm:py-20">
        <Container>
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-300">Gallery</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-semibold">Real client glow-ups</h1>
            <p className="mt-3 text-neutral-300">
              Tap any photo to zoom. We update this gallery with real appointments and client moments.
            </p>
          </div>

          <LightboxGallery images={galleryImages} />
        </Container>
      </main>
    </div>
  );
}
