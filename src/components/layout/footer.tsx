import Image from "next/image";
import Link from "next/link";
import { mapLinks, siteConfig } from "@/lib/site";

// Social icons exported from Figma (footer node 332:962). The PNGs are alpha
// masks, tinted #f5f5f5 via CSS mask so they match the design exactly.
const socials = [
  { label: "LinkedIn", href: siteConfig.social.linkedin, icon: "/images/social/linkedin.png" },
  { label: "Instagram", href: siteConfig.social.instagram, icon: "/images/social/instagram.png" },
  { label: "TikTok", href: siteConfig.social.tiktok, icon: "/images/social/tiktok.png" },
  { label: "YouTube", href: siteConfig.social.youtube, icon: "/images/social/youtube.png" },
];

// "Ekosistem" — one heading over two sub-columns (client's footer layout,
// Aug 2026). The second sub-column has no heading of its own; it starts level
// with the first link of the first one. The design spells these
// "Tarumanegara"; corrected to "Tarumanagara" here at the client's request.
// Only Untar has a site of its own; the rest point at their campus on Google
// Maps, per the client's link list.
const ekosistem = [
  [
    { label: "Untar", href: "https://untar.ac.id" },
    { label: "Tarumanagara Xinya College", href: mapLinks.kampus2 },
    { label: "Institut Tarumanagara", href: mapLinks.kampus3 },
    { label: "Taruma Enterprise", href: mapLinks.kampus1 },
  ],
  [
    { label: "RS Royal Taruma", href: mapLinks.royalTaruma },
    { label: "Untar Residence", href: mapLinks.kampus2 },
  ],
];

const footerLink =
  "font-normal leading-none underline decoration-solid underline-offset-2 hover:opacity-80";

export function Footer() {
  return (
    <footer className="mt-auto bg-gradient-to-r from-[#00357d] to-[#28599c] text-[#f5f5f5]">
      {/* Three groups on one row to the right of the brand column. The bar is
          1032 wide (--content-max 1080 less the 24px gutters) and the type is
          text-meta (11px); budget: 220 brand + ~250 ekosistem + ~440 alamat/jam
          + 2x32 gutters ≈ 975. justify-between spends the slack on the gutters
          so the outer edges sit flush with the container on both sides. Only
          from lg, since below that the row wraps and spreading each line would
          look uneven. */}
      <div className="site-container flex flex-wrap items-start gap-x-[32px] gap-y-10 py-[49px] lg:flex-nowrap lg:justify-between">
        {/* Brand: logo, blurb, socials, copyright */}
        <div className="flex w-[220px] max-w-full flex-col gap-[27px]">
          <Link
            href="/"
            aria-label="Beranda Yayasan Tarumanagara"
            className="relative block h-[40px] w-[192px] max-w-full transition-opacity hover:opacity-90 sm:h-[50px] sm:w-[220px]"
          >
            <Image
              src="/images/logo-white-trim.png"
              alt="Yayasan Tarumanagara"
              fill
              sizes="220px"
              className="object-contain object-left"
            />
          </Link>
          <p className="text-meta font-normal">{siteConfig.footerAbout}</p>
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
          <p className="text-meta font-normal">{siteConfig.foundationLabel}</p>
        </div>

        {/* Ekosistem — heading spans both sub-columns; the second has no heading
            of its own, so it starts level with the first link row. */}
        <div className="flex max-w-full flex-col gap-3 text-meta">
          <p className="mb-1 font-bold leading-none">Ekosistem</p>
          <div className="flex gap-x-[19px]">
            {ekosistem.map((column, i) => (
              <div key={i} className="flex flex-col gap-3">
                {column.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${footerLink} whitespace-nowrap`}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Alamat + Jam Operasional share one grid so the "Kantor" line and the
            phone number sit on the same row, as in the client's layout. */}
        <div className="grid max-w-full grid-cols-[minmax(0,auto)_minmax(0,auto)] gap-x-[32px] gap-y-6 text-meta">
          <div className="flex flex-col gap-2">
            <p className="mb-1 font-bold leading-none">Alamat</p>
            <address className="not-italic leading-[1.55]">
              {siteConfig.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </div>

          <div className="flex flex-col gap-2">
            <p className="mb-1 font-bold leading-none">Jam Operasional</p>
            <p className="leading-[1.55]">
              <span className="block">{siteConfig.hours.days}</span>
              <span className="block">{siteConfig.hours.time}</span>
            </p>
          </div>

          <div className="flex flex-col gap-2 self-end">
            <p className="mb-1 font-bold leading-none">Kantor</p>
            <p className="leading-[1.55]">{siteConfig.office}</p>
          </div>

          <a
            href={`tel:${siteConfig.phone.replace(/[^\d+]/g, "")}`}
            className="self-end leading-[1.55] hover:opacity-80"
          >
            {siteConfig.phone}
          </a>
        </div>
      </div>
    </footer>
  );
}
