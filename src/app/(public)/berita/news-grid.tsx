"use client";

import { useState } from "react";
import { Reveal } from "@/components/motion/reveal";
import { NewsCard, type NewsCardData } from "@/components/news-card";

const INITIAL = 3;
const STEP = 6;

/** Grid of published news with a "Lebih Lanjut" load-more (client-side). */
export function NewsGrid({ items }: { items: NewsCardData[] }) {
  const [visible, setVisible] = useState(INITIAL);
  const shown = items.slice(0, visible);
  const hasMore = visible < items.length;

  return (
    <>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((item, i) => (
          <Reveal key={item.slug} className="h-full" delay={(i % 3) * 0.06}>
            <NewsCard item={item} />
          </Reveal>
        ))}
      </div>

      {hasMore && (
        <div className="mt-14 flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + STEP)}
            className="glass-rim inline-flex h-[46px] w-[160px] items-center justify-center rounded-[31px] bg-[rgba(250,250,250,0.6)] text-headline font-bold text-[#015ddb] shadow-[0px_4px_13.8px_rgba(0,0,0,0.07)] backdrop-blur-sm transition-transform hover:scale-[1.03]"
          >
            Lebih Lanjut
          </button>
        </div>
      )}
    </>
  );
}
