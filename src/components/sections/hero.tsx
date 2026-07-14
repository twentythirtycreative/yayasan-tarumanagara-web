"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";

// Smooth entrance easing (easeOutExpo-ish) — plays once on load.
const easeOut = [0.22, 1, 0.36, 1] as const;

// Building framing — matches the Figma hero background exactly:
//   background: url(...) -15.681px -49.574px / 122.763% 139.248% no-repeat
// i.e. ~1.228× zoom over cover, centre shifted +10.3% right / +13.7% down.
const imgClass =
  "object-cover object-[50%_0%] grayscale brightness-[0.68] contrast-[1.05] scale-[1.1] translate-x-[4%]";

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-[#0a0e13]">
      {/* Background skyscraper photo, desaturated to B&W as in Figma */}
      <Image src="/images/hero-building.jpg" alt="Gedung Tarumanagara" fill priority sizes="100vw" className={`z-0 ${imgClass}`} />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/15 via-black/5 to-black/45" />

      {/* "Membangun Nilai," bar — sits BEHIND the central building peak (z-10) */}
      <div className="relative z-10 flex w-full max-w-[720px] translate-y-[14px] flex-col items-center px-6 text-center">
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

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.25, duration: 0.7, ease: easeOut }}
        >
          <Link
            href="#sambutan"
            className="glass-rim mt-12 inline-flex h-[46px] items-center justify-center rounded-[86px] bg-white/5 px-[17px] text-headline font-semibold shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-sm transition-transform hover:scale-[1.03]"
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
