import type { NextRequest } from "next/server";
import { getNewsBySlug } from "@/lib/data/news";
import { siteConfig } from "@/lib/site";

// Crawlable cover image for link previews. Admin uploads are stored as base64
// `data:` URLs, which OG/Twitter crawlers can't read — so this route decodes and
// serves the real image bytes at a normal URL. Path-based / missing covers just
// redirect to the static asset.
//
// Deliberately not ISR-cached. This route is one of a handful that can return a
// multi-megabyte body, and an ISR entry per slug would put those images in the
// durable cache. The underlying query is already cached (tag "news"), and the
// CDN header below keeps repeat crawls off the function — so a cache miss here
// costs an invocation, not a billed ISR write.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  const cover = item?.coverImageUrl ?? "";

  const dataUrl = cover.match(/^data:([^;]+);base64,(.+)$/);
  if (dataUrl) {
    const [, mime, base64] = dataUrl;
    const bytes = Buffer.from(base64, "base64");
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": mime,
        // stale-while-revalidate lets the CDN answer instantly and refresh in
        // the background, so replacing a cover still lands within the hour but
        // crawlers never wait on a cold function.
        "Cache-Control":
          "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  }

  const fallback = cover.startsWith("/") ? cover : siteConfig.ogImage;
  return Response.redirect(`${siteConfig.url}${fallback}`, 307);
}
