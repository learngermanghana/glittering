const BLOG_FEED_URLS = [
  process.env.BLOG_FEED_URL,
  "https://blog.glitteringmedspa.com/feed/",
  "https://blog.glitteringmedspa.com/feed.xml",
].filter((url): url is string => Boolean(url));

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

function parseFeed(xml: string) {
  const entries = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];

  return entries.map((entry) => {
    const title = pickTag(entry, "title");
    const link = pickTag(entry, "link");
    const description = pickTag(entry, "description") || pickTag(entry, "content:encoded");
    const publishedAt = pickTag(entry, "pubDate");

    return {
      title,
      link,
      publishedAt,
      summary: stripHtml(description),
    };
  });
}

async function fetchFeed(url: string) {
  const response = await fetch(url, {
    next: { revalidate: 60 * 30 },
  });

  if (!response.ok) {
    return [];
  }

  const xml = await response.text();
  return parseFeed(xml).filter((post) => post.title && post.link);
}

export async function getBlogPosts(limit?: number): Promise<BlogPost[]> {
  for (const url of BLOG_FEED_URLS) {
    try {
      const posts = await fetchFeed(url);

      if (posts.length > 0) {
        return typeof limit === "number" ? posts.slice(0, limit) : posts;
      }
    } catch {
      continue;
    }
  }

  return [];
}
