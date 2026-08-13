import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";

/**
 * Serves an uploaded image (news cover, Tata Kelola portrait) from the `images`
 * table. The owning row stores only this path, so cached list payloads stay in
 * kilobytes instead of carrying megabytes of inline base64.
 *
 * Left uncached by Next (Route Handlers are dynamic by default) — an ISR entry
 * per image would put every upload in the durable cache for no gain. The header
 * below is what actually keeps repeat requests off the function: rows are
 * immutable, a replaced photo gets a brand-new id, so the URL can never go
 * stale and `immutable` is safe.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [row] = await db
    .select({
      mimeType: schema.images.mimeType,
      data: schema.images.data,
    })
    .from(schema.images)
    .where(eq(schema.images.id, id))
    .limit(1);

  if (!row) return new Response("Gambar tidak ditemukan", { status: 404 });

  const bytes = Buffer.from(row.data as Buffer);
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": row.mimeType,
      "Content-Length": String(bytes.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
