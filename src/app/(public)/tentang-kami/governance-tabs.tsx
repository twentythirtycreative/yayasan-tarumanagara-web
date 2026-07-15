"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Person = { name: string; role: string; photo: string; pos: string };

// Figma 376:993 — two colour portraits (man / woman) alternate down the row.
// `pos` mirrors each card's Figma crop (mask-position), keeping the framing.
const NAME = "Dr. Ir. Steven Darmawan, S.T., M.T";
const ROLE = "Kepala Lembaga Pembelajaran dan Inovasi Akademik";
const PORTRAITS = [
  { photo: "/images/person-3.jpg", pos: "50% 14%" }, // man
  { photo: "/images/person-woman.jpg", pos: "50% 16%" }, // woman (Figma 364:4419)
];

const makePeople = (): Person[] =>
  Array.from({ length: 8 }).map((_, i) => ({
    name: NAME,
    role: ROLE,
    ...PORTRAITS[i % PORTRAITS.length],
  }));

const PEOPLE: Record<string, Person[]> = {
  Pembina: makePeople(),
  Pengurus: makePeople(),
  Pengawas: makePeople(),
};

const TABS = ["Pembina", "Pengurus", "Pengawas"] as const;

export function GovernanceTabs() {
  const [active, setActive] = useState<(typeof TABS)[number]>("Pembina");
  const count = PEOPLE[active].length;
  // The centred card is "selected" — coloured + raised. Arrows move it.
  const [selected, setSelected] = useState(Math.floor(8 / 2));

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [tx, setTx] = useState(0);
  const [animate, setAnimate] = useState(false);
  const first = useRef(true);

  // Slide the whole track with translateX so the selected card is dead-centre.
  // Pure transform (no scrollLeft) → GPU-composited, so the card's translateY
  // rise runs perfectly smoothly alongside it.
  useEffect(() => {
    const recalc = () => {
      const vp = viewportRef.current;
      const card = trackRef.current?.children[selected] as HTMLElement | undefined;
      if (!vp || !card) return;
      setTx(vp.clientWidth / 2 - (card.offsetLeft + card.offsetWidth / 2));
    };
    recalc();
    window.addEventListener("resize", recalc);
    let raf = 0;
    if (first.current) {
      first.current = false;
      raf = requestAnimationFrame(() => setAnimate(true)); // enable transition post-mount
    }
    return () => {
      window.removeEventListener("resize", recalc);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [selected, active]);

  const go = (dir: 1 | -1) =>
    setSelected((prev) => Math.max(0, Math.min(count - 1, prev + dir)));

  return (
    <div>
      {/* Heading (left) + tab selector (right), bottom-aligned with "Organisasi";
          subtitle sits below the row (Figma 376:1074 / 376:991). */}
      <div className="site-container relative">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 className="text-header font-extrabold text-[#262626]">
            Tata Kelola
            <br />
            <span className="text-[#dadada]">Organisasi</span>
          </h2>
          <div className="flex flex-wrap gap-3">
            {TABS.map((tab) => {
              const isActive = tab === active;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActive(tab);
                    setSelected(Math.floor(count / 2));
                  }}
                  className={cn(
                    "glass-rim h-[46px] cursor-pointer rounded-[43px] px-8 text-headline shadow-[0px_4px_13.8px_rgba(0,0,0,0.07)] backdrop-blur-sm transition",
                    isActive
                      ? "bg-gradient-to-r from-[#00357d] to-[#28599c] font-extrabold text-[#f5f5f5]"
                      : "bg-[rgba(250,250,250,0.6)] font-bold text-[#015ddb] hover:bg-[#eef4ff]",
                  )}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>
        <p className="mt-5 text-body font-medium text-[#262626]">
          Membangun Dampak Melalui Kepemimpinan yang Kuat
        </p>
      </div>

      {/* Transform-based carousel (arrow navigation only) */}
      <div className="relative mt-10">
        <div className="site-container">
          <div
            ref={viewportRef}
            className="overflow-x-hidden [margin-inline:calc(50%-50vw)]"
          >
            <div
              ref={trackRef}
              style={{ transform: `translate3d(${tx}px,0,0)` }}
              className={cn(
                "flex gap-[32px] py-12 will-change-transform",
                animate &&
                  "transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              )}
            >
              {PEOPLE[active].map((p, i) => (
                <PersonCard
                  key={i}
                  person={p}
                  selected={i === selected}
                  onSelect={() => setSelected(i)}
                  // Preload the two unique photos (cards 0 & 1 cover both) so
                  // they're decoded before the first slide → smooth cold-load.
                  priority={i < 2}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Arrows — vertically centred at the left/right ends of the carousel */}
        <div className="site-container pointer-events-none absolute inset-0 flex items-center justify-between">
          <button
            type="button"
            aria-label="Sebelumnya"
            onClick={() => go(-1)}
            className={cn(
              "glass-rim pointer-events-auto grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-[#015ddb] text-white shadow-[0px_6px_16px_rgba(1,93,219,0.35)] transition duration-300 hover:scale-110",
              selected === 0 && "invisible",
            )}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Berikutnya"
            onClick={() => go(1)}
            className={cn(
              "glass-rim pointer-events-auto grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-[#015ddb] text-white shadow-[0px_6px_16px_rgba(1,93,219,0.35)] transition duration-300 hover:scale-110",
              selected === count - 1 && "invisible",
            )}
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function PersonCard({
  person,
  selected,
  onSelect,
  priority,
}: {
  person: Person;
  selected: boolean;
  onSelect: () => void;
  priority?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        // Rise is a PURE GPU transform, transitioned on its own — no box-shadow
        // in the transition (box-shadow can't be GPU-animated and would stutter
        // the lift). The elevated shadow fades via the opacity layer below.
        "group relative h-[378px] w-[296px] shrink-0 transform-gpu cursor-pointer text-left transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform sm:w-[316px]",
        selected ? "z-10 -translate-y-12" : "",
      )}
    >
      {/* Elevated shadow as an opacity layer (button itself has no overflow) */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[16px] shadow-[0px_22px_42px_rgba(0,0,0,0.2)] transition-opacity duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
          selected ? "opacity-100" : "opacity-0",
        )}
      />
      {/* Clipped content (rounded image + glass box) */}
      <div className="absolute inset-0 overflow-hidden rounded-[16px] border border-[#fafafa] bg-[#d9d9d9]">
        <Image
          src={person.photo}
          alt={person.name}
          fill
          sizes="316px"
          priority={priority}
          draggable={false}
          style={{ objectPosition: person.pos }}
          className={cn(
            "origin-top scale-[1.32] object-cover transition-[filter] duration-[1600ms] ease-out",
            selected ? "grayscale-0" : "grayscale",
          )}
        />
        {/* Glass name/role box (Figma 376:999) — glass surface + white rim */}
        <div className="glass-rim absolute inset-x-0 bottom-0 flex h-[118px] flex-col justify-center rounded-b-[16px] border-t border-white/40 bg-[rgba(255,255,255,0.45)] px-[22px] backdrop-blur-[18px] backdrop-saturate-150">
          <p className="text-[18px] leading-[22px] font-extrabold text-[#262626]">
            {person.name}
          </p>
          <p className="mt-2.5 text-[12px] leading-[16px] font-medium text-[#262626]">
            {person.role}
          </p>
        </div>
      </div>
    </button>
  );
}
