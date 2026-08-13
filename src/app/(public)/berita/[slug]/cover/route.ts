import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getNewsBySlug } from "@/lib/data/news";
import { imageIdFromUrl } from "@/lib/images";
import { siteConfig } from "@/lib/site";

// Crawlable cover image for link previews, at a stable per-article URL.
//
// Covers live in the `images` table and the row holds "/api/images/<id>". This
// route resolves that and serves the bytes itself rather than redirecting: OG
// and Twitter crawlers are inconsistent about following redirects, and the
// whole point of this URL is that a crawler can read it in one hop. Legacy
// inline `data:` covers (rows written before images moved out) are still
// decoded here so previews keep working until they are migrated. Anything else
// — a /public path or no cover at all — falls back to the static OG asset.
//
// Deliberately not ISR-cached. This route can return a multi-megabyte body, and
// an ISR entry per slug would put those images in the durable cache. The header
// below keeps repeat crawls off the function — so a cache miss here costs an
// invocation, not a billed ISR write.
const CDN_CACHE =
  // stale-while-revalidate lets the CDN answer instantly and refresh in the
  // background, so replacing a cover still lands within the hour but crawlers
  // never wait on a cold function.
  "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  const cover = item?.coverImageUrl ?? "";

  const imageId = imageIdFromUrl(cover);
  if (imageId) {
    const [row] = await db
      .select({ mimeType: schema.images.mimeType, data: schema.images.data })
      .from(schema.images)
      .where(eq(schema.images.id, imageId))
      .limit(1);
    if (row) {
      const bytes = Buffer.from(row.data as Buffer);
      return new Response(new Uint8Array(bytes), {
        headers: {
          "Content-Type": row.mimeType,
          "Content-Length": String(bytes.byteLength),
          "Cache-Control": CDN_CACHE,
        },
      });
    }
  }

  const dataUrl = cover.match(/^data:([^;]+);base64,(.+)$/);
  if (dataUrl) {
    const [, mime, base64] = dataUrl;
    const bytes = Buffer.from(base64, "base64");
    return new Response(new Uint8Array(bytes), {
      headers: { "Content-Type": mime, "Cache-Control": CDN_CACHE },
    });
  }

  const fallback = cover.startsWith("/") ? cover : siteConfig.ogImage;
  return Response.redirect(`${siteConfig.url}${fallback}`, 307);
}
