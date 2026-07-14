"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

// Figma 298:1190 — blue bar with two clickable tabs; the active one is bold
// white with a 5px underline, the other is dimmed.
const TABS = ["Semua Berita", "Media Tarumanagara"] as const;

export function NewsTabs() {
  const [active, setActive] = useState(0);

  return (
    <div className="w-full bg-gradient-to-r from-[#00357d] to-[#28599c] shadow-[0px_4px_13.8px_rgba(0,0,0,0.07)]">
      <div className="site-container flex items-center gap-12 sm:gap-16">
        {TABS.map((tab, i) => {
          const isActive = i === active;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative cursor-pointer py-6 text-[24px] transition-colors",
                isActive
                  ? "font-bold text-[#f5f5f5]"
                  : "font-normal text-[rgba(245,245,245,0.51)] hover:text-[#f5f5f5]",
              )}
            >
              {tab}
              {isActive && (
                <span className="absolute bottom-0 left-0 h-[5px] w-full bg-white" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
