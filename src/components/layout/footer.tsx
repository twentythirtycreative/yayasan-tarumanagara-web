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

// Figma: footer menu — note the spelling "Karier" (differs from the navbar's "Karir").
const footerMenu = [
  { label: "Beranda", href: "/" },
  { label: "Tentang Kami", href: "/tentang-kami" },
  { label: "Karier", href: "/karir" },
  { label: "Berita & Kegiatan", href: "/berita" },
];

export function Footer() {
  return (
    <footer className="mt-auto bg-gradient-to-r from-[#00357d] to-[#28599c] text-[#f5f5f5]">
      <div className="site-container flex flex-wrap items-start gap-x-[150px] gap-y-10 py-[58px]">
        {/* Brand + copyright */}
        <div className="w-[289px] max-w-full">
          <Link
            href="/"
            aria-label="Beranda Yayasan Tarumanagara"
            className="relative block h-[48px] w-[230px] max-w-full transition-opacity hover:opacity-90 sm:h-[60px] sm:w-[287px]"
          >
            <Image
              src="/images/logo-white-trim.png"
              alt="Yayasan Tarumanagara"
              fill
              sizes="287px"
              className="object-contain object-left"
            />
          </Link>
          <p className="mt-4 text-caption font-normal">
            {siteConfig.foundationLabel}
          </p>
        </div>

        {/* Address + socials */}
        <div className="flex w-[310px] max-w-full flex-col gap-[23px]">
          <p className="text-caption font-normal">
            {siteConfig.address}
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

        {/* Menu */}
        <div className="flex w-[114px] max-w-full flex-col gap-3 text-caption">
          <p className="mb-1 font-bold leading-none">Menu</p>
          {footerMenu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-normal leading-none underline decoration-solid underline-offset-2 hover:opacity-80"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
