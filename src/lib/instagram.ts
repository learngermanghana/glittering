export type InstagramMedia = {
  id: string;
  media_url: string;
  permalink: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  thumbnail_url?: string;
  timestamp: string;
};

const DEFAULT_LIMIT = 6;

export async function getInstagramMedia(limit = DEFAULT_LIMIT): Promise<InstagramMedia[]> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!accessToken) {
    return [];
  }

  const params = new URLSearchParams({
    fields: "id,media_url,permalink,caption,media_type,thumbnail_url,timestamp",
    access_token: accessToken,
    limit: `${limit}`,
  });

  try {
    const response = await fetch(`https://graph.instagram.com/me/media?${params.toString()}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as { data?: InstagramMedia[] };
    return payload.data ?? [];
  } catch {
    return [];
  }
}
