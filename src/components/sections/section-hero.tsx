import Image from "next/image";

/**
 * Inner-page hero band (Figma "Tentang Kami" 376:968–972). Full-bleed photo
 * anchored to its BOTTOM edge + a 35% dark overlay. The two-line title is a
 * centred group with a diagonal cascade: line 1 (Medium) sits upper-left,
 * line 2 (ExtraBold, white→grey gradient) is indented right and dropped down.
 *
 * Figma metrics (1440×486 frame): group centred at (720, 243); font 45.954px,
 * line 2 offset +77.97px x / +49.96px y from line 1. Those offsets are baked in
 * as `em` units so the whole thing scales with the responsive font size.
 */
export function SectionHero({
  image,
  line1,
  line2,
  imageClassName,
  overlayClassName = "bg-black/35",
  line2Indent = "1.696em",
}: {
  image: string;
  line1: string;
  line2: string;
  imageClassName?: string;
  overlayClassName?: string;
  /** Horizontal indent of line 2 in `em` (Figma per-page offset). */
  line2Indent?: string;
}) {
  return (
    <section className="relative aspect-[1440/486] max-h-[486px] min-h-[340px] w-full overflow-hidden">
      <Image
        src={image}
        alt=""
        fill
        priority
        sizes="100vw"
        className={imageClassName ?? "object-cover object-bottom grayscale"}
      />
      <div className={`absolute inset-0 ${overlayClassName}`} />

      <div className="relative z-10 flex h-full items-center justify-center px-6">
        {/* Staggered title group. `--fs` drives font size; the em-based offsets
            (1.696em ≈ 78px, 1.087em ≈ 50px at 46px) scale with it.

            This is the page's <h1> — the two lines are one heading, split into
            block spans. Purely a tag swap: Tailwind's preflight gives h1
            `font-size: inherit; font-weight: inherit` and zeroes every margin,
            and `block` restores what <p> gave the lines, so it renders
            identically to the div/p markup it replaces. */}
        <h1
          className="relative w-fit [--fs:clamp(1.55rem,5.4vw,45.954px)]"
          style={{ fontSize: "var(--fs)" }}
        >
          <span className="block leading-[1.087] font-medium whitespace-nowrap text-[#fafafa]">
            {line1}
          </span>
          <span
            style={{ marginLeft: line2Indent }}
            className="-mb-[0.22em] block bg-gradient-to-r from-[#fafafa] from-[31%] to-[#949494] bg-clip-text pb-[0.22em] leading-[1.087] font-extrabold whitespace-nowrap text-transparent"
          >
            {line2}
          </span>
        </h1>
      </div>
    </section>
  );
}
