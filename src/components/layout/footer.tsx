import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

// Social icons exported from Figma (footer node 332:962). The PNGs are alpha
// masks, tinted #f5f5f5 via CSS mask so they match the design exactly.
const socials = [
  { label: "LinkedIn", href: siteConfig.social.linkedin, icon: "/images/social/linkedin.png" },
  { label: "Instagram", href: siteConfig.social.instagram, icon: "/images/social/instagram.png" },
  { label: "TikTok", href: siteConfig.social.tiktok, icon: "/images/social/tiktok.png" },
  { label: "YouTube", href: siteConfig.social.youtube, icon: "/images/social/youtube.png" },
];

// Figma 332:961 — "Ekosistem" column. Spellings follow the design.
// TODO: replace the "#" placeholders with each institution's real site.
const ekosistem = [
  { label: "Untar", href: "https://untar.ac.id" },
  { label: "Tarumanegara Xinya College", href: "#" },
  { label: "Institut Tarumanegara", href: "#" },
  { label: "Taruma Enterprise", href: "#" },
];

// Figma 543:8429 — "Alamat" column, rendered as two sub-columns. The second
// has no heading; it starts level with the first link of column one.
// TODO: point these at the real map / detail links.
const alamat = [
  [
    { label: "Kampus 1", href: "#" },
    { label: "Kampus 2", href: "#" },
    { label: "Kampus 3", href: "#" },
    { label: "Kampus 4", href: "#" },
  ],
  [
    { label: "RS Royal Taruma", href: "#" },
    { label: "Untar Residence", href: "#" },
  ],
];

const footerLink =
  "font-normal leading-none underline decoration-solid underline-offset-2 hover:opacity-80";

export function Footer() {
  return (
    <footer className="mt-auto bg-gradient-to-r from-[#00357d] to-[#28599c] text-[#f5f5f5]">
      {/* Four columns on one row. The bar is 1032 wide (--content-max 1080 less
          the 24px gutters); at text-caption the columns totalled ~1169 and wrapped,
          so the type steps down to text-meta and the fixed widths scale with it
          (x 11/14). Budget now: 242 + 250 + 147 + ~150 + 3x48 = ~933.
          justify-between spends the ~100px of slack on the gutters instead of
          letting it pool after the last column, so the outer edges sit flush with
          the container on both sides — as in Figma, where the row starts at x=124
          and ends at ~1315 on a 1440 frame. Only from lg, since below that the
          row wraps and spreading each line would look uneven. */}
      <div className="site-container flex flex-wrap items-start gap-x-[48px] gap-y-10 py-[49px] lg:justify-between">
        {/* Brand + copyright */}
        <div className="w-[242px] max-w-full">
          <Link
            href="/"
            aria-label="Beranda Yayasan Tarumanagara"
            className="relative block h-[40px] w-[192px] max-w-full transition-opacity hover:opacity-90 sm:h-[50px] sm:w-[240px]"
          >
            <Image
              src="/images/logo-white-trim.png"
              alt="Yayasan Tarumanagara"
              fill
              sizes="240px"
              className="object-contain object-left"
            />
          </Link>
          <p className="mt-4 text-meta font-normal">
            {siteConfig.foundationLabel}
          </p>
        </div>

        {/* About blurb + socials */}
        <div className="flex w-[250px] max-w-full flex-col gap-[27px]">
          <p className="text-meta font-normal">
            {siteConfig.footerAbout}
          </p>
          <div className="flex items-center gap-5">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="transition-opacity hover:opacity-80"
              >
                <span
                  aria-hidden
                  className="block h-[23px] w-[23px] bg-[#f5f5f5]"
                  style={{
                    maskImage: `url(${s.icon})`,
                    WebkitMaskImage: `url(${s.icon})`,
                    maskSize: "contain",
                    WebkitMaskSize: "contain",
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                    maskPosition: "center",
                    WebkitMaskPosition: "center",
                  }}
                />
              </a>
            ))}
          </div>
        </div>

        {/* Ekosistem */}
        <div className="flex w-[147px] max-w-full flex-col gap-3 text-meta">
          <p className="mb-1 font-bold leading-none">Ekosistem</p>
          {ekosistem.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={footerLink}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Alamat — heading spans both sub-columns; the second has no heading of
            its own, so it is padded down to line up with the first link row. */}
        <div className="flex max-w-full flex-col gap-3 text-meta">
          <p className="mb-1 font-bold leading-none">Alamat</p>
          <div className="flex gap-x-[19px]">
            {alamat.map((column, i) => (
              <div key={i} className="flex flex-col gap-3">
                {column.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className={`${footerLink} whitespace-nowrap`}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
