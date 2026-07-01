"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SITE } from "@/lib/site";
import { Container } from "@/components/Container";

const primaryNav = [
  { href: "/spa/services", label: "Services" },
  { href: "/spa/products", label: "Products" },
  { href: "/academy", label: "Academy" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

const groupedNav = [
  {
    title: "Spa & Beauty",
    links: [
      { href: "/spa/book", label: "Book a Service" },
      { href: "/spa/services", label: "Services" },
      { href: "/spa/products", label: "Products" },
      { href: "/spa/gallery", label: "Gallery" },
    ],
  },
  {
    title: "Glittering Academy",
    links: [
      { href: "/academy/courses", label: "Courses" },
      { href: "/academy/register", label: "Registration" },
      { href: "/academy/fees", label: "Fees & Rules" },
      { href: "/academy/gallery", label: "Training Gallery" },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-rose-300/70 bg-rose-100/90 backdrop-blur">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-2xl border border-rose-300/80 bg-white shadow-sm shadow-rose-200">
              <Image src="/logo-glittering.svg" alt="Glittering Spa logo" fill sizes="40px" className="object-cover" />
            </span>
            <div className="min-w-0 leading-tight">
              <div className="truncate font-semibold tracking-tight">{SITE.name}</div>
              <div className="truncate text-xs text-rose-800">Med Spa • Beauty Academy</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-5 text-sm lg:flex">
            {primaryNav.map((n) => {
              const active = isActive(pathname, n.href);
              return (
                <Link key={n.href} href={n.href} className={`hover:text-rose-950 ${active ? "font-semibold text-rose-950" : "text-rose-800"}`}>
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Link href="/spa/book" className="rounded-2xl bg-rose-700 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-rose-200 hover:bg-rose-800">
              Book Service
            </Link>
            <Link href="/academy/register" className="rounded-2xl bg-rose-950 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-rose-200 hover:bg-black">
              Register
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-label="Toggle navigation"
            className="inline-flex items-center justify-center rounded-2xl border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-800 shadow-sm hover:border-rose-400 hover:text-rose-950 lg:hidden"
          >
            {isOpen ? "Close" : "Menu"}
          </button>
        </div>

        {isOpen ? (
          <div className="border-t border-rose-300/70 bg-rose-100/95 py-4 lg:hidden">
            <Link href="/" onClick={() => setIsOpen(false)} className={`mb-3 block rounded-xl px-3 py-2 text-sm hover:bg-rose-200 ${pathname === "/" ? "bg-rose-200 font-semibold text-rose-950" : "text-rose-800"}`}>
              Home
            </Link>

            <div className="grid gap-4 sm:grid-cols-2">
              {groupedNav.map((group) => (
                <div key={group.title} className="rounded-2xl border border-rose-200 bg-white/60 p-3">
                  <p className="px-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">{group.title}</p>
                  <nav className="mt-2 flex flex-col gap-1 text-sm">
                    {group.links.map((n) => {
                      const active = isActive(pathname, n.href);
                      return (
                        <Link
                          key={n.href}
                          href={n.href}
                          onClick={() => setIsOpen(false)}
                          className={`rounded-xl px-3 py-2 hover:bg-rose-200 hover:text-rose-950 ${active ? "bg-rose-200 font-semibold text-rose-950" : "text-rose-800"}`}
                        >
                          {n.label}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link href="/blog" onClick={() => setIsOpen(false)} className="rounded-2xl border border-rose-300 px-4 py-2 text-center text-sm font-semibold text-rose-900 hover:bg-rose-200">Blog</Link>
              <Link href="/contact" onClick={() => setIsOpen(false)} className="rounded-2xl border border-rose-300 px-4 py-2 text-center text-sm font-semibold text-rose-900 hover:bg-rose-200">Contact</Link>
            </div>
          </div>
        ) : null}
      </Container>
    </header>
  );
}
