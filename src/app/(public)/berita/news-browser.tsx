"use client";

import { useState } from "react";
import { NewsTabs, type NewsTab } from "./news-tabs";
import { NewsGrid } from "./news-grid";
import type { NewsCardData } from "@/components/news-card";

type Item = NewsCardData & { category: NewsTab | null };

/**
 * The tab bar and the grid it filters. They live in one component because they
 * share the selected tab but sit in different sections of the page — the bar is
 * a full-bleed blue strip pulled up over the hero, the grid a padded section
 * below it.
 */
export function NewsBrowser({
  items,
  categories,
}: {
  items: Item[];
  categories: NewsTab[];
}) {
  // null = "Semua Berita", i.e. every article whatever its category.
  const [active, setActive] = useState<string | null>(null);
  const shown =
    active === null ? items : items.filter((n) => n.category?.slug === active);
  const activeName = categories.find((c) => c.slug === active)?.name;

  return (
    <>
      {/* Tab bar (Figma 298:1190). Pulled up so the glass box above tucks
          slightly UNDER the blue bar. */}
      <div className="relative z-20 -mt-6">
        <NewsTabs categories={categories} active={active} onChange={setActive} />
      </div>

      <section className="bg-surface py-16 sm:py-20">
        <div className="site-container">
          {shown.length === 0 ? (
            <p className="py-10 text-center text-body font-medium text-ink/50">
              {items.length === 0
                ? "Belum ada berita yang dipublikasikan. Silakan cek kembali nanti."
                : `Belum ada berita di kategori ${activeName ?? "ini"}.`}
            </p>
          ) : (
            // Keyed on the tab so switching category starts the "Lebih Lanjut"
            // counter over instead of carrying the previous tab's count.
            <NewsGrid key={active ?? "__all__"} items={shown} />
          )}
        </div>
      </section>
    </>
  );
}
