/**
 * Browser-side downscale + re-encode for admin image uploads.
 *
 * Photos are stored as base64 data URLs in Turso TEXT columns and get there
 * through a Server Action, whose request body Next caps (1 MB by default, see
 * `serverActions.bodySizeLimit` in next.config.ts — and Vercel refuses anything
 * over 4.5 MB regardless). base64 inflates a file ~33%, so an untouched 1 MB
 * phone photo already overshoots the default cap and the action fails before it
 * runs, surfacing as an opaque "error occurred in the Server Components render".
 *
 * Shrinking at the source keeps the payload small, the DB rows small, and the
 * public pages fast — the cards these photos land in are a few hundred pixels
 * wide, so nothing is lost.
 *
 * Browser-only: uses canvas. Call from client components.
 */

/**
 * Longest edge for a Tata Kelola portrait. The supplied headshots are around
 * 1272 × 1665, so this leaves them at native resolution (no upscaling, no
 * softening) and only shrinks anything larger. The card itself renders ~296×378
 * CSS px, so this is already generous even at 2× DPR.
 */
export const PORTRAIT_MAX_EDGE = 1665;
/** Longest edge for a news cover (renders at most ~1200 CSS px wide). */
export const COVER_MAX_EDGE = 1920;

/**
 * Above this, a stored data URL is re-encoded on save. Existing rows were
 * written before downscaling existed and would otherwise stay un-editable:
 * the form sends the photo back untouched even when only the name changed.
 */
const REENCODE_ABOVE_BYTES = 1_000_000;

const DEFAULT_QUALITY = 0.82;

let webpSupport: boolean | null = null;

/** Cached one-pixel probe — every current browser passes, older ones fall back. */
function preferredType(): string {
  if (webpSupport === null) {
    const probe = document.createElement("canvas");
    probe.width = probe.height = 1;
    webpSupport = probe.toDataURL("image/webp").startsWith("data:image/webp");
  }
  return webpSupport ? "image/webp" : "image/jpeg";
}

export async function downscaleImage(
  source: Blob,
  maxEdge: number,
  quality: number = DEFAULT_QUALITY,
): Promise<string> {
  // `from-image` applies EXIF rotation, so portrait phone photos don't land
  // sideways once the pixels are re-encoded without their metadata.
  const bitmap = await createImageBitmap(source, { imageOrientation: "from-image" });
  try {
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");

    // WebP/JPEG are opaque; without this a transparent PNG re-encodes to black.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);

    return canvas.toDataURL(preferredType(), quality);
  } finally {
    bitmap.close();
  }
}

/**
 * Re-encode an already-stored data URL if it is large enough to threaten the
 * Server Action body limit. Returns the input unchanged for remote/relative
 * URLs, small payloads, or if decoding fails — the server-side size check stays
 * the backstop.
 */
export async function shrinkStoredDataUrl(
  url: string,
  maxEdge: number,
): Promise<string> {
  if (!url.startsWith("data:image/")) return url;
  if (url.length <= REENCODE_ABOVE_BYTES) return url;
  try {
    const blob = await (await fetch(url)).blob();
    return await downscaleImage(blob, maxEdge);
  } catch {
    return url;
  }
}
