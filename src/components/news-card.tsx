import Link from "next/link";
import { CoverImage } from "@/components/cover-image";

export type NewsCardData = {
  slug: string;
  title: string;
  dateLabel?: string | null;
  /** Full article body — the card shows an auto snippet of it. */
  content?: string | null;
  coverImageUrl: string | null;
  tags: string[];
};

/** A short single-line-ish snippet from the article body (no stored excerpt). */
export function snippet(text: string | null | undefined, max = 200): string {
  if (!text) return "";
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, max).replace(/\s+\S*$/, "").trimEnd() + "…";
}

// Figma 342:1167 — navy (#00224f) card, image on top, and a translucent GLASS
// panel (rgba(118,118,118,.16) + blur) that overlaps the bottom of the image
// and holds the title, dated excerpt, tag row and a "Baca Selengkapnya" pill.
// The card lifts (larger shadow) on hover.
export function NewsCard({
  item,
  eager = false,
}: {
  item: NewsCardData;
  /** Set on the cards visible without scrolling so they skip lazy-loading. */
  eager?: boolean;
}) {
  return (
    <article className="group relative flex h-full w-full flex-col overflow-hidden rounded-[22px] bg-[#00224f] text-[#f5f5f5] shadow-[0px_10px_24px_rgba(0,0,0,0.14)] transition-shadow duration-500 hover:shadow-[0px_14px_28px_rgba(0,0,0,0.18)]">
      <Link
        href={`/berita/${item.slug}`}
        className="relative block aspect-[472/300] w-full overflow-hidden"
      >
        {item.coverImageUrl ? (
          <CoverImage
            src={item.coverImageUrl}
            alt={item.title}
            sizes="(max-width: 768px) 100vw, 33vw"
            eager={eager}
            className="transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center bg-[#001a3c] text-sm text-white/40">
            Tarumanagara
          </div>
        )}
      </Link>

      {/* Glass info box — overlaps the image bottom, backdrop-blurred */}
      <div className="glass-rim relative z-10 -mt-8 flex flex-1 flex-col rounded-[22px] bg-[rgba(118,118,118,0.16)] p-5 backdrop-blur-[7px] sm:p-6">
        <h3 className="line-clamp-2 text-title-2 font-bold">
          <Link href={`/berita/${item.slug}`} className="hover:underline">
            {item.title}
          </Link>
        </h3>
        {item.content && (
          <p className="mt-6 line-clamp-3 text-meta font-medium text-[#f5f5f5]/90">
            {item.dateLabel && (
              <span className="font-bold">{item.dateLabel} </span>
            )}
            – {snippet(item.content)}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-6">
          <p className="text-meta font-bold text-[#f5f5f5]">
            {item.tags.join("   |   ")}
          </p>
          <Link
            href={`/berita/${item.slug}`}
            className="glass-rim shrink-0 whitespace-nowrap rounded-[22px] bg-[rgba(250,250,250,0.16)] px-3 py-1.5 text-meta font-medium text-[#f5f5f5] backdrop-blur-sm transition-colors hover:bg-white/25"
          >
            Baca Selengkapnya
          </Link>
        </div>
      </div>
    </article>
  );
}
