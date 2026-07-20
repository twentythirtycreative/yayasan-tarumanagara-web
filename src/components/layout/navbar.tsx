"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { navLinks, siteConfig } from "@/lib/site";

// Figma 332:481 — "Kontak Kami" dropdown items (icon + label).
const contacts = [
  { label: "Tiktok", href: siteConfig.social.tiktok, icon: "/images/social/tiktok.png" },
  { label: "LinkedIn", href: siteConfig.social.linkedin, icon: "/images/social/linkedin.png" },
  { label: "YouTube", href: siteConfig.social.youtube, icon: "/images/social/youtube.png" },
  { label: "Instagram", href: siteConfig.social.instagram, icon: "/images/social/instagram.png" },
];

function SocialIcon({ src }: { src: string }) {
  return (
    <span
      aria-hidden
      className="block h-[18px] w-[18px] shrink-0 bg-[#f5f5f5]"
      style={{
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const contactRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    setOpen(false);
    setContactOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!contactOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (contactRef.current && !contactRef.current.contains(e.target as Node))
        setContactOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [contactOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="fixed inset-x-0 top-[12px] z-50 lg:top-[24px]">
      {/* Aligned to the global content container so the bar edges sit exactly on
          the same left/right margin as every section. */}
      <div className="site-container">
      {/* Figma: translucent navy→blue gradient bar (10% tint), rounded-[52px], h-67 */}
      <nav className="glass-rim flex h-[58px] w-full items-center justify-between gap-[clamp(0.75rem,2vw,1.5rem)] rounded-[52px] bg-[linear-gradient(90deg,rgba(0,53,125,0.1)_0%,rgba(0,96,227,0.1)_100%)] px-5 shadow-[0px_4px_13.8px_0px_rgba(0,0,0,0.07)] backdrop-blur-[6px] sm:h-[67px] sm:px-[25px]">
        {/* White logo — Figma 342:1764 sizes this box 185x39 inside the 67px
            bar. Must use the *trimmed* asset: logo-white.png is 1980x715 with
            baked-in vertical padding, so object-contain leaves ~118px of dead
            space to the right of the mark and shoves the CTA out of the bar. */}
        <Link href="/" className="relative aspect-[199/42] h-[30px] shrink-0 sm:h-[39px]">
          <Image
            src="/images/logo-white-trim.png"
            alt="Yayasan Tarumanagara"
            fill
            priority
            sizes="185px"
            className="object-contain object-left"
          />
        </Link>

        {/* Desktop links. Figma spaces these 48px apart on a 1200px bar; ours is
            1032 (--content-max 1080 minus the container's 24px gutters), so the
            gap scales down by the same ratio — 48 * 1032/1200 ~= 28. */}
        <ul className="hidden shrink items-center gap-[clamp(1rem,2.2vw,28px)] text-caption text-[#f5f5f5] lg:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "whitespace-nowrap leading-none transition-opacity",
                  isActive(link.href)
                    ? "font-extrabold opacity-100"
                    : "font-medium opacity-50 hover:opacity-90",
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}

          {/* Kontak Kami — plain nav item that opens the social submenu on
              hover (Figma 342:1764 / panel 332:481) */}
          <li
            ref={contactRef}
            onMouseEnter={() => setContactOpen(true)}
            onMouseLeave={() => setContactOpen(false)}
            className="relative"
          >
            <button
              type="button"
              onClick={() => setContactOpen((v) => !v)}
              aria-expanded={contactOpen}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1 whitespace-nowrap leading-none transition-opacity",
                contactOpen ? "font-medium opacity-90" : "font-medium opacity-50 hover:opacity-90",
              )}
            >
              Kontak Kami
              <ChevronDown
                className={cn("h-4 w-4 shrink-0 transition-transform", contactOpen && "rotate-180")}
              />
            </button>

            {contactOpen && (
              // top-full + pt bridges the gap so hover doesn't drop between the
              // trigger and the panel.
              <div className="absolute left-0 top-full z-50 pt-[14px]">
                <div className="glass-rim w-[190px] rounded-[17px] bg-[linear-gradient(90deg,rgba(0,53,125,0.4)_0%,rgba(0,96,227,0.4)_100%)] p-[18px] shadow-[0px_8px_24px_rgba(0,0,0,0.2)] backdrop-blur-[12px]">
                  <ul className="flex flex-col gap-[18px]">
                    {contacts.map((c) => (
                      <li key={c.label}>
                        <a
                          href={c.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-caption font-medium text-[#f5f5f5] transition-opacity hover:opacity-80"
                        >
                          <SocialIcon src={c.icon} />
                          {c.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </li>
        </ul>

        {/* CTA + mobile toggle — never squeezed by the links row. */}
        <div className="flex shrink-0 items-center gap-2">
          <a
            href={siteConfig.daftarUntarUrl}
            target="_blank"
            rel="noopener noreferrer"
            /* Figma: 122x45 pill, ~14px side padding, flush to the bar's right inset. */
            className="glass-rim hidden h-[45px] shrink-0 items-center whitespace-nowrap rounded-[52px] bg-gradient-to-r from-[rgba(0,53,125,0.61)] to-[rgba(0,96,227,0.61)] px-[14px] text-caption font-medium text-[#f5f5f5] shadow-[0px_4px_13.8px_0px_rgba(0,0,0,0.07)] backdrop-blur-sm transition-transform hover:scale-[1.03] sm:inline-flex"
          >
            Daftar Untar
          </a>
          <button
            type="button"
            aria-label="Buka menu"
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full text-[#f5f5f5] lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="mt-2 w-full rounded-3xl border border-white/15 bg-gradient-to-r from-[rgba(0,53,125,0.92)] to-[rgba(0,96,227,0.85)] p-3 text-[#f5f5f5] backdrop-blur-[6px] lg:hidden">
          <ul className="flex flex-col gap-1.5">
            <li>
              <p className="px-4 py-1 text-xs font-semibold uppercase tracking-wide opacity-60">
                Menu
              </p>
            </li>
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "block rounded-2xl px-4 py-3 text-sm",
                    isActive(link.href)
                      ? "bg-white/15 font-extrabold"
                      : "font-medium opacity-80 hover:bg-white/10",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {/* The pill CTA is hidden below sm, so surface it here instead. */}
            <li className="sm:hidden">
              <a
                href={siteConfig.daftarUntarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl px-4 py-3 text-sm font-medium opacity-80 hover:bg-white/10"
              >
                Daftar Untar
              </a>
            </li>
            <li className="mt-2 border-t border-white/15 pt-2">
              <p className="px-4 py-1 text-xs font-semibold uppercase tracking-wide opacity-60">
                Kontak Kami
              </p>
              <div className="flex flex-col gap-1.5">
                {contacts.map((c) => (
                  <a
                    key={c.label}
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium opacity-80 hover:bg-white/10"
                  >
                    <SocialIcon src={c.icon} />
                    {c.label}
                  </a>
                ))}
              </div>
            </li>
          </ul>
        </div>
      )}
      </div>
    </header>
  );
}
