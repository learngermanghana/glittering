import type { Metadata } from "next";
import Image from "next/image";
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

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function getExcerpt(content: string, maxLength = 180) {
  const text = stripHtml(content);

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}…`;
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
      description: getExcerpt(post.content),
      datePublished: post.publishedAt,
      author: {
        "@type": "Organization",
        name: "Glittering Med Spa",
      },
      publisher: {
        "@type": "Organization",
        name: "Glittering Med Spa",
      },
      mainEntityOfPage: post.linkUrl,
      url: post.linkUrl,
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

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {posts.length ? (
            posts.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm transition hover:shadow-md"
              >
                {post.imageUrl ? (
                  <div className="relative h-48 w-full bg-neutral-100">
                    <Image src={post.imageUrl} alt={post.title} fill className="object-cover" sizes="(min-width: 640px) 50vw, 100vw" />
                  </div>
                ) : null}

                <div className="p-6">
                  <div className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                    {formatDate(post.publishedAt)}
                  </div>
                  <h2 className="mt-2 text-xl font-semibold text-neutral-950">{post.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-neutral-700 line-clamp-3">{getExcerpt(post.content)}</p>
                  {post.linkUrl ? (
                    <a
                      href={post.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex text-sm font-semibold text-brand-800 hover:underline"
                    >
                      Read full post →
                    </a>
                  ) : null}
                </div>
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
