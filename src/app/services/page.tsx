import Link from "next/link";
import { PHONE_INTL, services } from "../data";

function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>;
}

export default function ServicesPage() {
  const whatsappLink = `https://wa.me/${PHONE_INTL}?text=${encodeURIComponent(
    "Hi Glittering Spa! I want to book a service."
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
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-300">Services</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-semibold">All services</h1>
            <p className="mt-3 text-neutral-300">
              From spa therapy to nails and beauty, we tailor each visit for your glow.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((cat) => (
              <div key={cat.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold">{cat.title}</div>
                  <span className="text-2xl">{cat.icon}</span>
                </div>
                <p className="mt-2 text-sm text-neutral-300">{cat.description}</p>
                <ul className="mt-4 space-y-2 text-sm text-neutral-300">
                  {cat.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </main>
    </div>
  );
}
