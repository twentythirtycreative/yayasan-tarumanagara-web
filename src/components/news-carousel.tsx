"use client";

import { useEffect, useRef, useState } from "react";
import { NewsCard, type NewsCardData } from "@/components/news-card";

/**
 * Horizontal news carousel (Figma 342:1167…). Cards start at the global content
 * margin and bleed off the right edge of the white panel. The card nearest the
 * left content edge is "featured": it scales up to full size with a large soft
 * shadow, while the others shrink (~0.82×, matching the 472px vs 375px Figma
 * ratio). A progress bar tracks the scroll position.
 */
export function NewsCarousel({ items }: { items: NewsCardData[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  // Grab-to-scroll (mouse drag across the cards themselves).
  const grab = useRef({ down: false, startX: 0, startScroll: 0, moved: false });
  // Scrollbar thumb geometry, as percentages of the track width.
  const [thumb, setThumb] = useState({ width: 100, left: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const sw = el.scrollWidth;
      const cw = el.clientWidth;
      const width = sw > 0 ? Math.max(14, (cw / sw) * 100) : 100;
      const left = sw > 0 ? Math.min((el.scrollLeft / sw) * 100, 100 - width) : 0;
      setThumb({ width, left: Math.max(0, left) });
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [items.length]);

  // Drag the scrollbar (or click anywhere on the track) to scroll the carousel.
  const scrollToPointer = (clientX: number) => {
    const el = ref.current;
    const track = trackRef.current;
    if (!el || !track) return;
    const rect = track.getBoundingClientRect();
    const frac = (clientX - rect.left) / rect.width;
    const max = el.scrollWidth - el.clientWidth;
    // Centre the thumb under the pointer for a natural scrollbar feel.
    el.scrollLeft = Math.max(0, Math.min(max, frac * el.scrollWidth - el.clientWidth / 2));
  };

  return (
    <div className="mt-6">
      {/* Full-bleed BOTH sides (nothing clips at the margins): the scroller
          stretches to the viewport edges via `margin-inline: 50% - 50vw`, while
          `padding-left: 50vw - 50%` pushes the FIRST card back to the global
          content margin. Both use `50%` relative to this `site-container`, the
          same reference as the "Berita Terbaru" heading, so the first card lines
          up exactly — at rest and when snapped — yet cards can still travel out
          past the left and right edges. */}
      <div className="site-container">
        <div
          ref={ref}
          onPointerDown={(e) => {
            if (e.pointerType !== "mouse") return;
            const el = ref.current;
            if (!el) return;
            el.setPointerCapture(e.pointerId);
            grab.current = {
              down: true,
              startX: e.clientX,
              startScroll: el.scrollLeft,
              moved: false,
            };
          }}
          onPointerMove={(e) => {
            if (!grab.current.down) return;
            const el = ref.current;
            if (!el) return;
            const dx = e.clientX - grab.current.startX;
            if (Math.abs(dx) > 4) grab.current.moved = true;
            el.scrollLeft = grab.current.startScroll - dx;
          }}
          onPointerUp={() => {
            grab.current.down = false;
          }}
          onPointerCancel={() => {
            grab.current.down = false;
          }}
          onClickCapture={(e) => {
            // Swallow the click that ends a drag so cards don't navigate.
            if (grab.current.moved) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          className="flex cursor-grab gap-[40px] overflow-x-auto py-14 select-none [margin-inline:calc(50%-50vw)] [overscroll-behavior-x:contain] [padding-inline:calc(50vw-50%)] active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => (
            <div
              key={item.slug}
              className="relative w-[300px] shrink-0 origin-center transition-transform duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform hover:z-10 hover:scale-[1.12] sm:w-[412px]"
            >
              <NewsCard item={item} />
            </div>
          ))}
        </div>
      </div>

      {/* Draggable scrollbar (Figma 342:1165 — 825px wide, centred) */}
      <div className="mx-auto mt-4 w-[min(825px,100%-3rem)]">
        <div
          ref={trackRef}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            dragging.current = true;
            scrollToPointer(e.clientX);
          }}
          onPointerMove={(e) => {
            if (dragging.current) scrollToPointer(e.clientX);
          }}
          onPointerUp={() => {
            dragging.current = false;
          }}
          onPointerCancel={() => {
            dragging.current = false;
          }}
          className="relative h-[9px] cursor-grab touch-none select-none rounded-[47px] bg-[#d9d9d9] active:cursor-grabbing"
        >
          <div
            className="absolute top-0 h-full rounded-[47px] bg-gradient-to-r from-[#00357d] to-[#28599c]"
            style={{ left: `${thumb.left}%`, width: `${thumb.width}%` }}
          />
        </div>
      </div>
    </div>
  );
}
