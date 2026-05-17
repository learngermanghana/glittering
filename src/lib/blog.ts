const SEDIFEX_SITE_BASE_URL = process.env.SEDIFEX_SITE_BASE_URL ?? "https://www.sedifex.com";
const SEDIFEX_STORE_ID = process.env.SEDIFEX_STORE_ID ?? "37mJqg20MjOriggaIaOOuahDsgj1";

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  linkUrl: string;
  imageUrl: string;
  publishedAt: string;
};

type PublicBlogResponse = {
  items?: unknown;
};

type PublicBlogItem = {
  id?: unknown;
  title?: unknown;
  slug?: unknown;
  content?: unknown;
  linkUrl?: unknown;
  imageUrl?: unknown;
  publishedAt?: unknown;
};

function toBlogPost(item: PublicBlogItem): BlogPost | null {
  if (typeof item.title !== "string" || typeof item.slug !== "string") {
    return null;
  }

  return {
    id: typeof item.id === "string" ? item.id : item.slug,
    title: item.title,
    slug: item.slug,
    content: typeof item.content === "string" ? item.content : "",
    linkUrl: typeof item.linkUrl === "string" ? item.linkUrl : "",
    imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : "",
    publishedAt: typeof item.publishedAt === "string" ? item.publishedAt : "",
  };
}

function buildPublicBlogUrl(slug?: string) {
  const url = new URL("/api/public-blog", SEDIFEX_SITE_BASE_URL);
  url.searchParams.set("storeId", SEDIFEX_STORE_ID);

  if (slug) {
    url.searchParams.set("slug", slug);
  }

  return url.toString();
}

function normalizePosts(posts: BlogPost[]) {
  const seen = new Set<string>();

  return posts
    .filter((post) => {
      const key = post.id.trim() || post.slug.trim();

      if (!key || seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .sort((a, b) => {
      const aTime = Date.parse(a.publishedAt);
      const bTime = Date.parse(b.publishedAt);

      if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
      if (Number.isNaN(aTime)) return 1;
      if (Number.isNaN(bTime)) return -1;

      return bTime - aTime;
    });
}

async function fetchPublicBlog(slug?: string): Promise<BlogPost[]> {
  if (!SEDIFEX_STORE_ID) {
    return [];
  }

  const response = await fetch(buildPublicBlogUrl(slug), {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as PublicBlogResponse;
  const items = Array.isArray(payload.items) ? payload.items : [];

  return normalizePosts(items.map((item) => toBlogPost(item as PublicBlogItem)).filter((item): item is BlogPost => Boolean(item)));
}

export async function getBlogPosts(limit?: number): Promise<BlogPost[]> {
  const posts = await fetchPublicBlog();
  return typeof limit === "number" ? posts.slice(0, limit) : posts;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await fetchPublicBlog(slug);
  return posts[0] ?? null;
}
