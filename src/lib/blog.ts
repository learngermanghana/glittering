const BLOG_FEED_URLS = [process.env.BLOG_FEED_URL, "https://blog.glitteringmedspa.com/feed.xml"].filter(
  (url): url is string => Boolean(url),
);

export type BlogPost = {
  title: string;
  link: string;
  summary: string;
  publishedAt: string;
};

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function pickTag(block: string, tag: string) {
  const matched = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return matched?.[1] ? decodeXml(matched[1]) : "";
}

function pickAtomLink(block: string) {
  const alternateLink = block.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["'][^>]*\/?>(?:<\/link>)?/i);

  if (alternateLink?.[1]) {
    return decodeXml(alternateLink[1]);
  }

  const anyLink = block.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>(?:<\/link>)?/i);
  return anyLink?.[1] ? decodeXml(anyLink[1]) : "";
}

function parseXmlFeed(xml: string): BlogPost[] {
  const rssItems = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];

  if (rssItems.length > 0) {
    return rssItems
      .map((entry) => {
        const title = pickTag(entry, "title");
        const link = pickTag(entry, "link");
        const description = pickTag(entry, "description") || pickTag(entry, "content:encoded");
        const publishedAt = pickTag(entry, "pubDate");

        return { title, link, summary: stripHtml(description), publishedAt };
      })
      .filter((post) => post.title && post.link);
  }

  const atomEntries = xml.match(/<entry\b[\s\S]*?<\/entry>/gi) ?? [];

  return atomEntries
    .map((entry) => {
      const title = pickTag(entry, "title");
      const link = pickAtomLink(entry) || pickTag(entry, "id");
      const description = pickTag(entry, "summary") || pickTag(entry, "content");
      const publishedAt = pickTag(entry, "published") || pickTag(entry, "updated");

      return { title, link, summary: stripHtml(description), publishedAt };
    })
    .filter((post) => post.title && post.link);
}

async function fetchFeed(url: string): Promise<BlogPost[]> {
  const response = await fetch(url, {
    next: { revalidate: 60 * 30 },
    headers: {
      Accept: "application/atom+xml, application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
    },
  });

  if (!response.ok) {
    return [];
  }

  const xml = await response.text();
  return parseXmlFeed(xml);
}

function normalizePosts(posts: BlogPost[]) {
  const seen = new Set<string>();

  return posts
    .filter((post) => {
      const key = post.link.trim();

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

export async function getBlogPosts(limit?: number): Promise<BlogPost[]> {
  for (const url of BLOG_FEED_URLS) {
    try {
      const posts = normalizePosts(await fetchFeed(url));

      if (posts.length > 0) {
        return typeof limit === "number" ? posts.slice(0, limit) : posts;
      }
    } catch {
      continue;
    }
  }

  return [];
}
