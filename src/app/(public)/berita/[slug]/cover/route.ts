import type { NextRequest } from "next/server";
import { getNewsBySlug } from "@/lib/data/news";
import { siteConfig } from "@/lib/site";

// Crawlable cover image for link previews. Admin uploads are stored as base64
// `data:` URLs, which OG/Twitter crawlers can't read — so this route decodes and
// serves the real image bytes at a normal URL. Path-based / missing covers just
// redirect to the static asset.
export const revalidate = 3600;

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
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  }

  const fallback = cover.startsWith("/") ? cover : siteConfig.ogImage;
  return Response.redirect(`${siteConfig.url}${fallback}`, 307);
}
