import Link from "next/link";

const links = [
  {
    href: "/services",
    title: "Service Assessment",
    description: "Review treatment categories and choose the right service bundle.",
  },
  {
    href: "/login",
    title: "Team Tools",
    description: "Open booking sync, bulk SMS, campaign templates, and calendar workflows.",
  },
  {
    href: "/blog",
    title: "Spa Blog",
    description: "Read practical skincare and wellness guides before your next appointment.",
  },
];

export function SeoInternalLinks() {
  return (
    <section className="mt-12 rounded-3xl border border-black/10 bg-white p-6 shadow-sm" aria-labelledby="seo-links">
      <h2 id="seo-links" className="text-xl font-semibold tracking-tight text-neutral-950">
        Continue exploring
      </h2>
      <p className="mt-2 text-sm text-neutral-700">
        Jump between service planning, team tools, and expert content to find what you need faster.
      </p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-2xl border border-black/10 bg-neutral-50 p-4 transition hover:bg-neutral-100"
          >
            <h3 className="text-sm font-semibold text-brand-900">{link.title}</h3>
            <p className="mt-2 text-sm text-neutral-700">{link.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
