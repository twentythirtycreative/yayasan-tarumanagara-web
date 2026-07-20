"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";

// Smooth entrance easing (easeOutExpo-ish) — plays once on load.
const easeOut = [0.22, 1, 0.36, 1] as const;

// Building framing — matches the Figma hero background exactly:
//   background: url(...) -15.681px -49.574px / 122.763% 139.248% no-repeat
// i.e. ~1.228× zoom over cover, centre shifted +10.3% right / +13.7% down.
// Full colour (node 543:1683) — the blue sky/glass stays saturated, but the
// whole frame is darkened hard. Sampling the Figma render against the source
// photo puts its sky at ~0.50x source, near-uniform top to bottom; 0.58 here
// plus the overlay below composites to that.
//
// The photo (2400x1596, aspect 1.50) is narrower than the hero box, so
// object-cover fits it by width and leaves NO horizontal slack — object-position
// X is inert here. `scale` is what creates the slack (half the excess per side)
// and `translate-x` spends it. Keep scale >= 2 * translate + 1 or the right edge
// pulls away from the photo and the section background shows through.
const imgClass =
  "object-cover object-[50%_0%] brightness-[0.58] contrast-[1.05] scale-[1.22] translate-x-[10%]";

export function Hero() {
  return (
    // z-10: the Sambutan section's glow band is pulled 80px above its own top
    // edge, which lands it over the bottom of this photo and washes it pale.
    // Figma has no such haze on the hero, so the hero paints above it.
    <section className="relative isolate z-10 flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-[#0a0e13] [@media(max-height:800px)]:pt-[64px]">
      {/* Background skyscraper photo, full colour and darkened as in Figma */}
      <Image src="/images/hero-building.jpg" alt="Gedung Tarumanagara" fill priority sizes="100vw" className={`z-0 ${imgClass}`} />
      {/* Figma darkens near-uniformly, so this is now a light grade rather than
          the heavy bottom vignette it used to be — just enough to seat the
          tagline and Discover More against the glass. */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/10 via-black/5 to-black/30" />

      {/* "Membangun Nilai," bar — sits BEHIND the building peak (z-10) only in the
          band where the peak actually covers it, and IN FRONT (z-30 > the fg
          image's z-20) outside it. The window is 1024-2000px:
            < 1024   tablet/phone framing, where the peak no longer lines up with
                     the bar at all, so it must read on its own -> in front
            1024-2000 the peak covers the bar -> behind, the intended Figma look.
                     Deliberately generous at the low end: staying covered through
                     the first few zoom-in steps is fine.
            >= 2000  text is capped at 73px / 720px while the building keeps
                     growing, so it swallows the bar -> in front
          Browser zoom changes the effective viewport width, which is why the
          look flips as you zoom. Widen or narrow the band with these two numbers
          if the crossover lands in the wrong place on your screen. */}
      <div className="relative z-30 flex w-full max-w-[720px] translate-y-[14px] flex-col items-center px-6 text-center lg:z-10 min-[2000px]:z-30">
        <motion.span
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.8, ease: easeOut }}
          className="inline-flex items-center justify-center whitespace-nowrap border border-[#73aeff] bg-gradient-to-r from-[#00357d] to-[#28599c] px-[0.48em] text-hero font-semibold text-[#f5f5f5] shadow-lg"
        >
          Membangun Nilai,
        </motion.span>
      </div>

      {/* Foreground building (cropped PNG, transparent sky) — same framing as
          the grey background, but layered IN FRONT of the bar (z-20) so its
          peaks overlap "Membangun Nilai,". The grey backdrop shows through the
          transparent sky. */}
      <Image
        src="/images/hero-building-fg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className={`pointer-events-none z-20 ${imgClass}`}
      />

      {/* Heading + Discover */}
      <div className="relative z-30 mt-4 flex w-full max-w-[720px] flex-col items-center px-6 text-center sm:mt-6">
        <motion.h1
          initial={{ opacity: 0, y: 70 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 1, ease: easeOut }}
          className="text-display text-[#f5f5f5]"
        >
          <span className="inline-block bg-gradient-to-r from-[#fafafa] from-[31%] to-[#949494] bg-clip-text pb-[0.28em] pr-[0.06em] font-bold italic leading-[1] text-transparent">
            Menginspirasi
          </span>
          <span className="mt-[-0.28em] block font-bold">Masa Depan</span>
        </motion.h1>

        {/* Tagline between the headline and Discover More (node 543:1642) */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.7, ease: easeOut }}
          className="mt-6 max-w-[390px] text-balance text-caption font-medium text-white [text-shadow:46px_36px_59.1px_rgba(0,0,0,0.25)] sm:mt-8"
        >
          Berdasarkan core value Integrity, Professionalism, dan Entrepreneurship
          &ndash; sejak tahun 1959.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.25, duration: 0.7, ease: easeOut }}
        >
          <Link
            href="#sambutan"
            className="glass-rim mt-8 inline-flex h-[46px] items-center justify-center rounded-[86px] bg-white/5 px-[17px] text-headline font-semibold shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-sm transition-transform hover:scale-[1.03]"
          >
            <span className="bg-gradient-to-r from-white to-[#013275] bg-clip-text text-transparent">
              Discover More
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
