import "server-only";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";

/**
 * Image storage for admin uploads.
 *
 * Uploads still reach the Server Action as a base64 `data:` URL (the browser has
 * nowhere else to put them), but they are unpacked here into the `images` table
 * and the owning row stores only `/api/images/<id>`. That keeps cover photos and
 * portraits out of every cached list payload — see the `images` table comment in
 * `schema.ts` for why that ceiling matters.
 */

/** Public path prefix served by `app/api/images/[id]/route.ts`. */
export const IMAGE_URL_PREFIX = "/api/images/";

/** Extracts the row id from "/api/images/<id>", or null for any other value. */
export function imageIdFromUrl(url: string | null | undefined): string | null {
  if (!url || !url.startsWith(IMAGE_URL_PREFIX)) return null;
  // Defensive: strip anything a caller may have appended (query, trailing path).
  const id = url.slice(IMAGE_URL_PREFIX.length).split(/[/?#]/)[0];
  return id || null;
}

/** Stores a base64 `data:` URL as a blob row and returns its public path. */
export async function storeDataUrl(dataUrl: string): Promise<string> {
  // [\s\S] rather than the `s` flag — tsconfig targets below es2018.
  const match = dataUrl.match(/^data:([^;,]+);base64,([\s\S]*)$/);
  if (!match) throw new Error("Gambar bukan data URL base64 yang valid.");
  const [, mimeType, base64] = match;
  const data = Buffer.from(base64, "base64");
  if (data.byteLength === 0) throw new Error("Gambar kosong.");

  // Generate the id here rather than relying on `.returning()`, so the path is
  // known before the insert and the two can never disagree.
  const id = crypto.randomUUID();
  await db.insert(schema.images).values({
    id,
    mimeType,
    data,
    byteSize: data.byteLength,
  });
  return `${IMAGE_URL_PREFIX}${id}`;
}

/** Deletes the blob behind "/api/images/<id>". No-op for any other value. */
export async function deleteStoredImage(url: string | null | undefined): Promise<void> {
  const id = imageIdFromUrl(url);
  if (!id) return;
  await db.delete(schema.images).where(eq(schema.images.id, id));
}

/**
 * Resolves what an owning row should store in its image column, and disposes of
 * the blob it replaces so old uploads don't accumulate.
 *
 * - a fresh `data:` upload → stored as a new blob, previous one deleted
 * - unchanged path         → kept as is, nothing deleted
 * - empty                  → previous blob deleted, column set to NULL
 *
 * `previous` must be the value currently in the row (null when inserting).
 */
export async function persistImageField(
  next: string,
  previous: string | null,
): Promise<string | null> {
  const value = next.trim();

  if (value.startsWith("data:")) {
    const stored = await storeDataUrl(value);
    await deleteStoredImage(previous);
    return stored;
  }
  if (!value) {
    await deleteStoredImage(previous);
    return null;
  }
  // Pointed at a different image (or switched to a /public path) — drop the old.
  if (previous && previous !== value) await deleteStoredImage(previous);
  return value;
}
