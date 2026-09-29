export const runtime = "nodejs";

import { NextResponse } from "next/server";

export type InstagramPost = {
  id: string;
  permalink: string;
  imageUrl: string;
  caption: string | null;
  mediaType: string;
};

type IgMediaItem = {
  id: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
};

/**
 * GET /api/instagram/feed
 *
 * Wymaga w .env / hostingu:
 *   INSTAGRAM_ACCESS_TOKEN=...
 *   INSTAGRAM_USER_ID=...   (IG professional account ID)
 *
 * Bez tokenów → { configured: false, posts: [] }
 * Cache: 1h
 */
export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;

  if (!token || !userId) {
    return NextResponse.json({
      configured: false,
      posts: [] as InstagramPost[],
    });
  }

  try {
    const fields = [
      "id",
      "caption",
      "media_type",
      "media_url",
      "thumbnail_url",
      "permalink",
    ].join(",");

    // Instagram API with Instagram Login
    const url = new URL(`https://graph.instagram.com/v21.0/${userId}/media`);
    url.searchParams.set("fields", fields);
    url.searchParams.set("limit", "10");
    url.searchParams.set("access_token", token);

    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("INSTAGRAM FEED ERROR:", res.status, errText);
      return NextResponse.json(
        { configured: true, posts: [], error: "Instagram API error" },
        { status: 502 }
      );
    }

    const data = (await res.json()) as { data?: IgMediaItem[] };
    const items = data.data ?? [];

    const posts: InstagramPost[] = items
      .map((item) => {
        const imageUrl =
          item.media_type === "VIDEO" || item.media_type === "REELS"
            ? item.thumbnail_url || item.media_url
            : item.media_url;

        if (!imageUrl || !item.permalink) return null;

        return {
          id: item.id,
          permalink: item.permalink,
          imageUrl,
          caption: item.caption ?? null,
          mediaType: item.media_type || "IMAGE",
        };
      })
      .filter((p): p is InstagramPost => p !== null)
      .slice(0, 5);

    return NextResponse.json({ configured: true, posts });
  } catch (error) {
    console.error("INSTAGRAM FEED ERROR:", error);
    return NextResponse.json(
      { configured: true, posts: [], error: "Failed to fetch Instagram feed" },
      { status: 500 }
    );
  }
}
