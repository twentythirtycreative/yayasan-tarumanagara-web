import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * News cover photo that shows something the moment the card paints.
 *
 * Covers are BLOBs served by `/api/images/[id]`, so the first request for each
 * one costs a function invocation plus a Turso round trip. A bare <Image> is
 * transparent for that whole time — the card renders as a hole in the navy
 * panel and then snaps the photo in. The wash below sits *behind* an always
 * opaque photo: no bytes, no extra request, no JavaScript, and the photo simply
 * covers it once it decodes. `cover-wash` (globals.css) sweeps a slow highlight
 * across it so the wait reads as loading rather than as an empty card.
 *
 * Deliberately NOT a JS cross-fade (img at opacity 0, revealed by `onLoad`).
 * Covers routinely finish loading before React hydrates, so gating visibility
 * on hydration keeps an already-loaded photo hidden until the bundle runs —
 * worse than the problem it set out to solve, and permanent if hydration fails.
 */
export function CoverImage({
  src,
  alt,
  sizes,
  className,
  eager = false,
  preload = false,
}: {
  src: string;
  alt: string;
  sizes: string;
  /** Extra classes for the <img> itself, e.g. the card's hover zoom. */
  className?: string;
  /** Skip lazy-loading — for cards that are above the fold on first paint. */
  eager?: boolean;
  /** Emit a <link rel="preload">. Only for a single, certain LCP image. */
  preload?: boolean;
}) {
  return (
    <span className="cover-wash absolute inset-0 block overflow-hidden bg-[linear-gradient(135deg,#0a3e86_0%,#00224f_55%,#001630_100%)]">
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        // Mutually exclusive on purpose: Next warns when `preload` is combined
        // with an explicit `loading`, and preloading already implies eager.
        {...(preload ? { preload: true } : { loading: eager ? "eager" : "lazy" })}
        className={cn("object-cover", className)}
      />
    </span>
  );
}
