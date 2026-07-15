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
  const contactRef = useRef<HTMLDivElement>(null);

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
        {/* White logo (aspect 199/42) */}
        <Link href="/" className="relative aspect-[199/42] h-[46px] shrink-0 sm:h-[60px]">
          <Image
            src="/images/logo-white.png"
            alt="Yayasan Tarumanagara"
            fill
            priority
            sizes="199px"
            className="object-contain object-left"
          />
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-[clamp(1.25rem,2.6vw,48px)] text-body text-[#f5f5f5] lg:flex">
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
        </ul>

        {/* CTA + mobile toggle */}
        <div className="flex items-center gap-2">
          {/* Kontak Kami — social dropdown on hover (Figma 332:481) */}
          <div
            ref={contactRef}
            onMouseEnter={() => setContactOpen(true)}
            onMouseLeave={() => setContactOpen(false)}
            className="relative hidden shrink-0 sm:block"
          >
            <button
              type="button"
              onClick={() => setContactOpen((v) => !v)}
              aria-expanded={contactOpen}
              className="glass-rim inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-[52px] bg-gradient-to-r from-[rgba(0,53,125,0.61)] to-[rgba(0,96,227,0.61)] py-[11px] pl-4 pr-3 text-body font-medium text-[#f5f5f5] shadow-[0px_4px_13.8px_0px_rgba(0,0,0,0.07)] backdrop-blur-sm transition-transform hover:scale-[1.03]"
            >
              Kontak Kami
              <ChevronDown
                className={cn("h-4 w-4 shrink-0 transition-transform", contactOpen && "rotate-180")}
              />
            </button>

            {contactOpen && (
              // top-full + pt bridges the gap so hover doesn't drop between the
              // button and the panel.
              <div className="absolute left-0 top-full z-50 pt-[14px]">
                <div className="glass-rim w-[190px] rounded-[17px] bg-[linear-gradient(90deg,rgba(0,53,125,0.4)_0%,rgba(0,96,227,0.4)_100%)] p-[18px] shadow-[0px_8px_24px_rgba(0,0,0,0.2)] backdrop-blur-[12px]">
                  <ul className="flex flex-col gap-[18px]">
                    {contacts.map((c) => (
                      <li key={c.label}>
                        <a
                          href={c.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-[16px] font-medium text-[#f5f5f5] transition-opacity hover:opacity-80"
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
          </div>
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
