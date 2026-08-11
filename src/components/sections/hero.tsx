"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";

// Smooth entrance easing (easeOutExpo-ish) — plays once on load.
const easeOut = [0.22, 1, 0.36, 1] as const;

// Building framing (Figma node 1:952). The hero photo is now the real Untar
// tower, and Figma shows it whole — no zoom, no pan, the frame is the photo.
// Figma stretches it to 1440x844; we object-cover instead so it stays undistorted
// at arbitrary viewport aspects. The photo (1332x882, aspect 1.51) is wider than
// tall, so a 100svh hero crops it vertically: 45% biases the visible window
// slightly toward the top, which keeps the roofline and antenna clear above the
// "Membangun Nilai," bar and spends the crop on the empty forecourt instead.
// Grade: brightness 0.46, deliberately a step lighter than Figma. The fitted
// value was 0.38, measured against the Figma render sampled at the source
// photo's own pixels — with contrast 1.25 it reproduced Figma's greys within a
// couple of levels (sky 171 -> 49, 210 -> 68, facade 141 -> 35). That reads
// heavier on a real screen than it does in the Figma canvas, so the brightness
// is the one value off the fit; contrast and saturate still carry the rest of
// the look, the latter because Figma keeps more blue in the shadows than a
// plain brightness cut does. Adjust here rather than in the two overlays
// below — this is the only knob that moves the whole image evenly.
const imgClass =
  "object-cover object-[50%_45%] brightness-[0.46] contrast-[1.25] saturate-[1.3]";

export function Hero() {
  return (
    // z-10: the Sambutan section's glow band is pulled 80px above its own top
    // edge, which lands it over the bottom of this photo and washes it pale.
    // Figma has no such haze on the hero, so the hero paints above it.
    <section className="relative isolate z-10 flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-[#0a0e13] [@media(max-height:800px)]:pt-[64px]">
      {/* Background photo of the Untar tower, full colour and darkened as in Figma */}
      <Image src="/images/hero-untar.jpg" alt="Gedung Universitas Tarumanagara" fill priority sizes="100vw" className={`z-0 ${imgClass}`} />
      {/* Figma's shadows keep more blue than any brightness/contrast/saturate
          combination can hold on to — after the filter above the sky lands on
          rgb(50,59,69) where Figma has rgb(49,66,85). Screening this near-black
          navy over it lifts only the green and blue channels and puts it there. */}
      <div className="absolute inset-0 z-0 bg-[#000a19] mix-blend-screen" />
      {/* The filter above already carries nearly all of Figma's darkening, and
          Figma's own bottom band is if anything lighter than its middle, so this
          is only a whisper of a vignette to seat the tagline and Discover More. */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />

      {/* "Membangun Nilai," bar. The old design had a second, cropped copy of the
          photo layered on top so the building's peak cut across this bar; the new
          Figma frames the tower head-on with nothing in front of it, so the bar
          simply sits above the photo and the whole z-index dance is gone. */}
      <div className="relative z-30 flex w-full max-w-[720px] translate-y-[14px] flex-col items-center px-6 text-center">
        <motion.span
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.8, ease: easeOut }}
          className="inline-flex items-center justify-center whitespace-nowrap border border-[#73aeff] bg-gradient-to-r from-[#00357d] to-[#28599c] px-[0.48em] text-hero font-semibold text-[#f5f5f5] shadow-lg"
        >
          Membangun Nilai,
        </motion.span>
      </div>

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
