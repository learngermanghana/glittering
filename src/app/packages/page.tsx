import Link from "next/link";
import { packages, PHONE_INTL } from "../data";

function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>;
}

export default function PackagesPage() {
  const whatsappLink = `https://wa.me/${PHONE_INTL}?text=${encodeURIComponent(
    "Hi Glittering Spa! I want to book a package."
  )}`;

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
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
            >
              Book on WhatsApp
            </a>
          </div>
        </Container>
      </header>

      <main className="py-14 sm:py-20">
        <Container>
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-300">Packages</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-semibold">Top 6 packages</h1>
            <p className="mt-3 text-neutral-300">Relax, glow, and refresh with curated spa experiences.</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <div key={pkg.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold">{pkg.title}</div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300">
                    {pkg.duration}
                  </span>
                </div>
                <p className="mt-3 text-sm text-neutral-300 leading-6">{pkg.description}</p>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-300"
                >
                  Book Now
                </a>
              </div>
            ))}
          </div>
        </Container>
      </main>
    </div>
  );
}
