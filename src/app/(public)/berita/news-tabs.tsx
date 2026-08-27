"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

/** One category tab. The `null` slug is reserved for "Semua Berita". */
export type NewsTab = { slug: string; name: string };

// Figma 298:1190 — blue bar with clickable tabs; the active one is bold white
// with a 5px underline, the rest are dimmed.
//
// The tabs are data now, not a constant. "Semua Berita" is not a category: it
// is the unfiltered list, so it is always first and always there even with an
// empty `news_categories` table. Everything after it is one row of that table,
// in the order admin arranged them.
export function NewsTabs({
  categories,
  active,
  onChange,
}: {
  categories: NewsTab[];
  /** Slug of the active category, or null for "Semua Berita". */
  active: string | null;
  /**
   * Filter in place (the /berita listing). Omit it on pages that have nothing
   * to filter — the article page reuses this bar as a header, and there each
   * tab is a way back to the listing rather than a filter.
   */
  onChange?: (slug: string | null) => void;
}) {
  const tabs: { slug: string | null; name: string }[] = [
    { slug: null, name: "Semua Berita" },
    ...categories,
  ];

  const tabClass = (isActive: boolean) =>
    cn(
      "relative cursor-pointer whitespace-nowrap py-6 text-[16px] transition-colors sm:text-[24px]",
      isActive
        ? "font-bold text-[#f5f5f5]"
        : "font-normal text-[rgba(245,245,245,0.51)] hover:text-[#f5f5f5]",
    );

  return (
    <div className="w-full bg-gradient-to-r from-[#00357d] to-[#28599c] shadow-[0px_4px_13.8px_rgba(0,0,0,0.07)]">
      {/* Scrollable on narrow screens: the number of tabs is admin-controlled
          now, so the bar has to survive more of them than the two Figma drew. */}
      <div className="site-container flex items-center gap-6 overflow-x-auto [scrollbar-width:none] sm:gap-16 [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => {
          const isActive = tab.slug === active;
          const underline = isActive && (
            <span className="absolute bottom-0 left-0 h-[5px] w-full bg-white" />
          );
          return onChange ? (
            <button
              key={tab.slug ?? "__all__"}
              type="button"
              onClick={() => onChange(tab.slug)}
              className={tabClass(isActive)}
            >
              {tab.name}
              {underline}
            </button>
          ) : (
            <Link
              key={tab.slug ?? "__all__"}
              href="/berita"
              className={tabClass(isActive)}
            >
              {tab.name}
              {underline}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
