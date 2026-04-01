import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/Container";
import {
  SITE,
  WHATSAPP_LINK,
  LOCATIONS,
  products,
  SALES_WHATSAPP_LINK,
  topSellingProducts,
  topSellingServices,
} from "@/lib/site";
import { getGalleryImages } from "@/lib/gallery";
import { getBlogPosts } from "@/lib/blog";
import { SeoInternalLinks } from "@/components/SeoInternalLinks";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Glittering Spa | Awoshie & Spintex",
  description: "Spa • Beauty • Salon • Nails in Awoshie and Spintex. Book on WhatsApp.",
  path: "/",
});

export default async function HomePage() {
  const galleryImages = getGalleryImages();
  const featuredImages = galleryImages.slice(0, 3);
  const [awoshie, spintex] = LOCATIONS;
  const latestPosts = await getBlogPosts(3);
  const spintexPromoLink = `https://wa.me/${SITE.phoneIntl}?text=${encodeURIComponent(
    "Hi Glittering Spa! I want to register for the 50% off promo (April 1-15) at Spintex.\nName: ____\nService: ____\nDate: ____\nTime: ____"
  )}`;
  const awoshiePromoLink = `https://wa.me/${SITE.phoneIntl}?text=${encodeURIComponent(
    "Hi Glittering Spa! I want to register for the 50% off promo (April 1-15) at Awoshie.\nName: ____\nService: ____\nDate: ____\nTime: ____"
  )}`;

  return (
    <div className="relative">
      {/* subtle background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-brand-200/40 blur-3xl" />
        <div className="absolute right-[-120px] top-[80px] h-[320px] w-[320px] rounded-full bg-gold-500/20 blur-3xl" />
      </div>

      <Container>
        <section className="py-12 sm:py-16">
          <div className="overflow-hidden rounded-3xl border border-brand-900/20 bg-brand-950 text-white shadow-lg">
            <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="p-6 sm:p-8 lg:p-10">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">Welcome to Glittering Spa</p>
                <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">Relax. Glow. Restore.</h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-brand-100 sm:text-lg">
                  Premium self-care with Spa, Beauty, Salon and Nails in Awoshie and Spintex.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl bg-white px-6 py-3 text-center text-sm font-semibold text-brand-950 hover:bg-white/90"
                  >
                    Book on WhatsApp
                  </a>
                  <a
                    href={awoshie.directionsLink}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl border border-white/40 bg-white/10 px-6 py-3 text-center text-sm font-semibold hover:bg-white/20"
                  >
                    Get Directions (Awoshie)
                  </a>
                  <a
                    href={spintex.directionsLink}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl border border-white/40 bg-white/10 px-6 py-3 text-center text-sm font-semibold hover:bg-white/20"
                  >
                    Get Directions (Spintex)
                  </a>
                </div>
              </div>
              <div className="relative min-h-[260px]">
                <Image
                  src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1400&q=80"
                  alt="Luxury spa treatment room with warm lighting"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-950/70 via-brand-950/20 to-transparent lg:bg-gradient-to-l" />
              </div>
            </div>
          </div>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-neutral-700 shadow-sm">
            <span className="inline-block h-2 w-2 rounded-full bg-brand-600" />
            Open Mon–Sat 7am–8pm • Sun 12–8pm • {SITE.location}
          </div>

          <div className="mt-8 overflow-hidden rounded-3xl border border-gold-500/40 bg-gradient-to-r from-brand-900 via-brand-900 to-brand-950 p-6 text-white shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">Limited April Promo</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Glittering Med Spa 50% OFF Services</h2>
            <p className="mt-2 text-sm text-brand-100 sm:text-base">
              Offer runs from <span className="font-semibold text-white">April 1 - April 15</span>. Register now and choose
              your branch.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/services"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-brand-950 hover:bg-white/90"
              >
                View promo services
              </Link>
              <a
                href={spintexPromoLink}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-white/40 bg-white/10 px-5 py-2.5 text-center text-sm font-semibold hover:bg-white/20"
              >
                Register now (Spintex)
              </a>
              <a
                href={awoshiePromoLink}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-white/40 bg-white/10 px-5 py-2.5 text-center text-sm font-semibold hover:bg-white/20"
              >
                Register now (Awoshie)
              </a>
            </div>
          </div>

          {/* green band like your sample */}
          <div className="mt-10 rounded-3xl bg-brand-900 text-brand-50 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="text-lg font-semibold text-gold-500">Need a quick booking?</div>
                <div className="text-brand-100 text-sm">Message us and we’ll confirm time + service.</div>
              </div>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-brand-950 hover:bg-white/90 text-center"
              >
                Book Now
              </a>
            </div>
          </div>

          <div className="mt-10 rounded-3xl border border-brand-200/70 bg-gradient-to-br from-white via-rose-50/40 to-brand-50 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-sm text-neutral-600">Top Selling Right Now</div>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">Most requested services & products</h2>
                <p className="mt-2 text-sm text-neutral-600">
                  Quick picks clients ask for most. Tap WhatsApp and we’ll help you choose the best option.
                </p>
              </div>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-2xl bg-brand-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-900 shadow-sm"
              >
                Reserve your slot
              </a>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-black/10 bg-white p-5">
                <div className="text-sm font-semibold text-brand-900">Top Services</div>
                <div className="mt-4 space-y-3">
                  {topSellingServices.map((service) => (
                    <div key={service.name} className="rounded-xl border border-rose-100 bg-rose-50/40 p-3">
                      <p className="text-sm font-semibold text-neutral-900">{service.name}</p>
                      <p className="text-xs text-brand-800">{service.category}</p>
                      <p className="mt-1 text-xs text-neutral-600">{service.summary}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-5">
                <div className="text-sm font-semibold text-brand-900">Top Products</div>
                <div className="mt-4 space-y-3">
                  {topSellingProducts.map((name) => {
                    const product = products.find((item) => item.name === name);
                    if (!product) return null;
                    return (
                      <div key={product.name} className="flex items-center gap-3 rounded-xl border border-rose-100 bg-rose-50/40 p-3">
                        <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-black/10 bg-white">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-900">{product.name}</p>
                          <p className="mt-0.5 text-xs text-neutral-600">{product.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <a
                  href={SALES_WHATSAPP_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex text-sm font-semibold text-brand-800 hover:underline"
                >
                  Chat sales team →
                </a>
              </div>
            </div>
          </div>

          {/* cards */}
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
              <div className="text-sm text-neutral-500">Services</div>
              <div className="mt-1 text-lg font-semibold">Spa • Beauty • Salon • Nails</div>
              <Link className="mt-4 inline-block text-sm font-semibold text-brand-800 hover:underline" href="/services">
                View services →
              </Link>
            </div>

            <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
              <div className="text-sm text-neutral-500">Products</div>
              <div className="mt-1 text-lg font-semibold">Glow essentials and best-sellers</div>
              <Link className="mt-4 inline-block text-sm font-semibold text-brand-800 hover:underline" href="/products">
                Explore products →
              </Link>
            </div>

            <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
              <div className="text-sm text-neutral-500">Gallery</div>
              <div className="mt-1 text-lg font-semibold">See our work</div>
              <Link className="mt-4 inline-block text-sm font-semibold text-brand-800 hover:underline" href="/gallery">
                Open gallery →
              </Link>
            </div>
          </div>

          {featuredImages.length ? (
            <div className="mt-10 rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm text-neutral-500">Gallery</div>
                  <div className="mt-1 text-lg font-semibold">A peek at our latest looks</div>
                </div>
                <Link className="text-sm font-semibold text-brand-800 hover:underline" href="/gallery">
                  View full gallery →
                </Link>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {featuredImages.map((src, index) => (
                  <div
                    key={`${src}-${index}`}
                    className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-black/10 bg-neutral-50"
                  >
                    <Image
                      src={src}
                      alt={`Featured gallery image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-10 rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-sm text-neutral-500">Training School</div>
                <div className="mt-1 text-lg font-semibold">Admissions now open</div>
                <p className="mt-2 text-sm text-neutral-600">
                  Learn beauty and wellness skills with hands-on practice at Glittering Spa. Register now and send your
                  student data directly to our WhatsApp in one click.
                </p>
                <div className="mt-4 grid gap-2 text-sm text-neutral-700 sm:grid-cols-2">
                  <p>• Courses include lashes, nails, makeup, facials, massage, wig making, and body therapy.</p>
                  <p>• Training options run from two weeks to one year depending on your selected course.</p>
                  <p>• Registration captures apprentice bio-data, guarantor details, and health declaration.</p>
                  <p>• Submit fast on WhatsApp and our team will follow up with your start details.</p>
                </div>
              </div>
              <Link
                className="inline-flex items-center justify-center rounded-2xl bg-brand-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-900"
                href="/training"
              >
                Register Now
              </Link>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {["/training/5.jpeg", "/training/6.jpeg", "/training/7.jpeg"].map((src, index) => (
                <div
                  key={src}
                  className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-black/10 bg-neutral-50"
                >
                  <Image
                    src={src}
                    alt={`Training highlight ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm text-neutral-500">Products</div>
                <div className="mt-1 text-lg font-semibold">Sample products our clients love</div>
                <p className="mt-2 text-sm text-neutral-600">
                  Browse a few favorites and chat with our sales team for availability.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold hover:bg-neutral-50 shadow-sm"
                >
                  View all products
                </Link>
                <a
                  href={SALES_WHATSAPP_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-2xl bg-brand-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-900 shadow-sm"
                >
                  Talk to our sales team
                </a>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {products.slice(0, 3).map((product) => (
                <div
                  key={product.name}
                  className="overflow-hidden rounded-2xl border border-black/10 bg-neutral-50"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-semibold text-neutral-900">{product.name}</div>
                    <p className="mt-1 text-xs text-neutral-600">{product.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>


          <div className="mt-10 rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm text-neutral-500">Blog</div>
                <div className="mt-1 text-lg font-semibold">Latest from Glittering Med Spa</div>
                <p className="mt-2 text-sm text-neutral-600">
                  Read our newest skincare and wellness articles.
                </p>
              </div>
              <Link className="text-sm font-semibold text-brand-800 hover:underline" href="/blog">
                View all blog posts →
              </Link>
            </div>

            {latestPosts.length ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {latestPosts.map((post) => (
                  <article key={post.link} className="rounded-2xl border border-black/10 bg-neutral-50 p-4">
                    <h3 className="text-sm font-semibold text-neutral-900">{post.title}</h3>
                    <p className="mt-2 text-xs leading-5 text-neutral-600 line-clamp-4">{post.summary}</p>
                    <a
                      href={post.link}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex text-xs font-semibold text-brand-800 hover:underline"
                    >
                      Read article →
                    </a>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-600">
                Blog posts are temporarily unavailable.
              </div>
            )}
          </div>

          <div className="mt-10 rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm text-neutral-500">Instagram</div>
                <div className="mt-1 text-lg font-semibold">Follow our latest updates</div>
                <p className="mt-2 text-sm text-neutral-600">Fresh looks, client glow-ups, and behind-the-scenes.</p>
              </div>
              <a
                href="https://www.instagram.com/glittering__spa"
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-brand-800 hover:underline"
              >
                Visit Instagram @glittering__spa →
              </a>
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-600">
              Visit our Instagram to see the latest posts.
            </div>
          </div>

          <SeoInternalLinks />

          <div className="mt-10 rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm text-neutral-500">Testimonials</div>
                <div className="mt-1 text-lg font-semibold">Loved by our guests</div>
              </div>
              <div className="text-xs font-semibold uppercase tracking-wide text-brand-700">5.0 Average Rating</div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {[
                {
                  quote: "The massage was heavenly and the space felt so calming. I walked out glowing.",
                  name: "A. Mensah",
                },
                {
                  quote: "Impeccable service and attention to detail. My nails have never looked better!",
                  name: "R. Owusu",
                },
                {
                  quote: "Friendly team, beautiful ambience, and my facial left me radiant.",
                  name: "K. Boateng",
                },
              ].map((item) => (
                <div key={item.name} className="rounded-2xl border border-black/10 bg-neutral-50 p-4">
                  <div className="text-brand-600 text-sm">★★★★★</div>
                  <p className="mt-3 text-sm text-neutral-700 leading-6">“{item.quote}”</p>
                  <div className="mt-4 text-sm font-semibold text-neutral-900">{item.name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}
