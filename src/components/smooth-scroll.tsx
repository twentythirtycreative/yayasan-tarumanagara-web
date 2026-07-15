"use client";

import { useEffect } from "react";
import Lenis from "lenis";

// Site-wide smooth (eased) scrolling. Disabled when the user prefers reduced
// motion. Elements marked `data-lenis-prevent` (e.g. the news carousel) keep
// their own native scrolling.
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Skip Lenis on touch devices: it only smooths the mouse WHEEL (touch is
    // already native), and its resize handling hitches when the mobile address
    // bar shows/hides mid-scroll. Native touch scrolling is smoother there.
    if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 3), // easeOutCubic — gentle glide
      smoothWheel: true,
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Keep Lenis's cached scroll bounds fresh. If the page grows AFTER init
    // (web fonts finishing, images loading, the Sambutan card expanding, …),
    // its stale max-scroll would clamp early and feel "stuck" near the bottom.
    const recalc = () => lenis.resize();
    const ro = new ResizeObserver(recalc);
    ro.observe(document.body);
    window.addEventListener("load", recalc);
    document.fonts?.ready.then(recalc).catch(() => {});

    // Smooth-scroll in-page anchor links (e.g. "Discover More" → #sambutan).
    // Runs in the CAPTURE phase and stops propagation so Next.js's own (instant)
    // hash handling doesn't fire first.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const anchor = (e.target as HTMLElement).closest?.('a[href^="#"]');
      const hash = anchor?.getAttribute("href");
      if (!hash || hash === "#") return;
      const targetEl = document.querySelector(hash);
      if (!targetEl) return;
      e.preventDefault();
      e.stopPropagation();
      lenis.scrollTo(targetEl as HTMLElement, {
        offset: -20,
        duration: 2.2, // slow, smooth glide
        easing: (t) => 1 - Math.pow(1 - t, 4), // easeOutQuart
      });
    };
    document.addEventListener("click", onClick, true);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("load", recalc);
      document.removeEventListener("click", onClick, true);
      lenis.destroy();
    };
  }, []);

  return null;
}
