"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SITE, WHATSAPP_LINK } from "@/lib/site";
import { Container } from "@/components/Container";

const nav = [
  { href: "/", label: "Home" },
  { href: "/book", label: "Book" },
  { href: "/services", label: "Services" },
  { href: "/products", label: "Products" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/the-story", label: "The Story" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/80 backdrop-blur">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-neutral-900 text-white shadow-sm">
              ✨
            </span>
            <div className="leading-tight">
              <div className="font-semibold tracking-tight">{SITE.name}</div>
              <div className="text-xs text-neutral-600">Spa • Beauty • Salon • Nails</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-5 text-sm">
            {nav.map((n) => {
              const active = pathname === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`hover:text-neutral-900 ${
                    active ? "text-neutral-900 font-semibold" : "text-neutral-700"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noreferrer"
            className="hidden md:inline-flex rounded-2xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800"
          >
            Book Now
          </a>

          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-label="Toggle navigation"
            className="md:hidden inline-flex items-center justify-center rounded-2xl border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-700 shadow-sm hover:border-neutral-400 hover:text-neutral-900"
          >
            {isOpen ? "Close" : "Menu"}
          </button>
        </div>

        {isOpen ? (
          <div className="md:hidden border-t border-black/10 bg-white/90 py-4">
            <nav className="flex flex-col gap-3 text-sm">
              {nav.map((n) => {
                const active = pathname === n.href;
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    onClick={() => setIsOpen(false)}
                    className={`rounded-xl px-3 py-2 hover:bg-neutral-100 hover:text-neutral-900 ${
                      active ? "bg-neutral-100 text-neutral-900 font-semibold" : "text-neutral-700"
                    }`}
                  >
                    {n.label}
                  </Link>
                );
              })}
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center justify-center rounded-2xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800"
              >
                Book Now
              </a>
            </nav>
          </div>
        ) : null}
      </Container>
    </header>
  );
}
