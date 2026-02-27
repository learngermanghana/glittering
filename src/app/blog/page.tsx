import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { SeoInternalLinks } from "@/components/SeoInternalLinks";
import { getBlogPosts } from "@/lib/blog";
import { buildPageMetadata, getAbsoluteUrl } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Blog | Glittering Med Spa",
  description: "Read skincare and wellness tips from Glittering Med Spa.",
  path: "/blog",
});

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: posts.map((post, index) => ({
      "@type": "Article",
      position: index + 1,
      headline: post.title,
      description: post.summary,
      datePublished: post.publishedAt,
      author: {
        "@type": "Organization",
        name: "Glittering Med Spa",
      },
      publisher: {
        "@type": "Organization",
        name: "Glittering Med Spa",
      },
      mainEntityOfPage: post.link,
      url: post.link,
    })),
    url: getAbsoluteUrl("/blog"),
  };

  return (
    <Container>
      <section className="py-12 sm:py-16">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">Blog</h1>
          <p className="mt-4 text-neutral-700 leading-7">
            Fresh skincare tips, treatment guides, and wellness updates from Glittering Med Spa.
          </p>
        </div>

        <div className="mt-10 space-y-5">
          {posts.length ? (
            posts.map((post) => (
              <article key={post.link} className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                  {formatDate(post.publishedAt)}
                </div>
                <h2 className="mt-2 text-xl font-semibold text-neutral-950">{post.title}</h2>
                <p className="mt-3 text-sm leading-6 text-neutral-700 line-clamp-3">{post.summary}</p>
                <a
                  href={post.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex text-sm font-semibold text-brand-800 hover:underline"
                >
                  Read full post →
                </a>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-black/10 bg-white p-6 text-sm text-neutral-600">
              We could not load blog posts right now. Please check back shortly.
            </div>
          )}
        </div>

        <SeoInternalLinks />

        <div className="mt-10">
          <Link href="/" className="text-sm font-semibold text-brand-800 hover:underline">
            ← Back to home
          </Link>
        </div>
      </section>
    </Container>
  );
}
