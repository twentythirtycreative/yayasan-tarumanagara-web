"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { units } from "@/lib/site";

// Figma 342:1167 — the highlight card next to the unit list. Selecting a unit
// swaps the card to that unit's dummy content.
export function UnitSelector() {
  // Initial selection: "Unit Pendidikan".
  const [selected, setSelected] = useState("pendidikan");
  const activeUnit = units.find((u) => u.slug === selected) ?? units[0];

  return (
    <div className="mt-12 flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-8">
      {/* Vertical unit list with connecting line */}
      <Reveal className="w-full lg:w-[340px] lg:shrink-0">
        <div className="relative flex flex-col gap-6">
          <span className="absolute bottom-6 left-[27px] top-6 w-px bg-[#d9d9d9]" />
          {units.map((unit) => {
            const active = unit.slug === selected;
            const twoLine = unit.label.includes(" & ")
              ? unit.label.split(" & ")
              : null;
            return (
              <button
                key={unit.slug}
                type="button"
                onClick={() => setSelected(unit.slug)}
                className={
                  active
                    ? "glass-rim relative z-10 inline-flex w-fit cursor-pointer items-center gap-[18px] rounded-[31px] border border-[#88b7f7] bg-gradient-to-r from-[#00357d] to-[#28599c] py-3 pl-[22px] pr-[30px] text-left shadow-[0px_4px_6.9px_rgba(0,0,0,0.07)] transition-transform hover:scale-[1.02]"
                    : "glass-rim relative z-10 inline-flex w-fit cursor-pointer items-center gap-[18px] rounded-[31px] bg-[rgba(250,250,250,0.16)] py-3 pl-[22px] pr-[30px] text-left shadow-[0px_4px_13.8px_rgba(0,0,0,0.07)] backdrop-blur-[6px] transition-transform hover:scale-[1.02]"
                }
              >
                <span
                  className={
                    active
                      ? "h-3 w-3 shrink-0 rounded-full border-[3px] border-[#015ddb] bg-[#d9d9d9]"
                      : "h-3 w-3 shrink-0 rounded-full bg-[#d9d9d9]"
                  }
                />
                <span
                  className={
                    active
                      ? "whitespace-nowrap text-headline font-extrabold text-[#f5f5f5]"
                      : "whitespace-nowrap text-headline font-bold text-[#015ddb]"
                  }
                >
                  {twoLine ? (
                    <>
                      {twoLine[0]}
                      <br />&amp; {twoLine[1]}
                    </>
                  ) : (
                    unit.label
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </Reveal>

      {/* Member cards for the selected unit — up to 3 in a single row (Figma),
          left-aligned. On desktop they never wrap: each card flexes to fill the
          space, capped at the Figma 249px so 1–2 cards keep their natural size
          and 3 shrink just enough to sit on one line. Wraps on small screens. */}
      <Reveal delay={0.1} className="w-full lg:flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeUnit.slug}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-[8px] lg:flex-nowrap lg:justify-start"
          >
            {activeUnit.cards.map((card) => (
              /* Not a single card-wide link: each campus line carries its own
                 map URL (Universitas Tarumanagara has two), and anchors cannot
                 nest. The pins and the CTA row below are the links. */
              <div
                key={card.image}
                className="group relative flex w-full flex-col overflow-hidden rounded-[14px] bg-white p-3 sm:w-[249px] lg:w-auto lg:min-w-0 lg:flex-1 lg:basis-0 lg:max-w-[249px]"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-[19px]">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    quality={90}
                    sizes="(min-width:640px) 249px, 90vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <p className="mt-5 line-clamp-2 px-5 text-body font-extrabold leading-[1.2] text-[#262626]">
                  {card.title}
                </p>
                {/* Figma 542:1075 — one pin + site line per location. */}
                <div className="mt-2 flex flex-col gap-[2px] px-5">
                  {card.locations.map((loc) => (
                    <a
                      key={loc.label}
                      href={loc.map}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-1 text-meta font-normal leading-[1.4] text-[#262626] hover:underline"
                    >
                      <MapPin className="mt-[1px] h-3 w-3 shrink-0" />
                      {loc.label}
                    </a>
                  ))}
                </div>
                {/* CTA opens the card's primary location on Google Maps. */}
                <a
                  href={card.locations[0].map}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Lihat lokasi ${card.title} di Google Maps`}
                  className="group/cta mt-auto flex items-center justify-between px-5 pt-6 pb-1"
                >
                  <span className="text-[12px] font-semibold text-[#015ddb] group-hover/cta:underline">
                    Pelajari lebih lanjut
                  </span>
                  <span className="glass-rim grid h-9 w-9 shrink-0 place-items-center rounded-[78px] bg-gradient-to-br from-[rgba(237,245,255,0.46)] to-white/0 shadow-[0px_4px_4.1px_rgba(0,0,0,0.07)]">
                    <ArrowUpRight className="h-5 w-5 text-[#015ddb]" />
                  </span>
                </a>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </Reveal>
    </div>
  );
}
