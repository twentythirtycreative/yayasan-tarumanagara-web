"use client";

import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterOption = { value: string; label: string };
export type FilterGroup = { key: string; label: string; options: FilterOption[] };

/**
 * "Filter" button + dropdown popover, meant to sit next to a search field. Each
 * group is a set of multi-select checkboxes; an empty selection means "all".
 * The parent owns the `selected` state and applies it to its list.
 */
export function FilterMenu({
  groups,
  selected,
  onToggle,
  onReset,
}: {
  groups: FilterGroup[];
  selected: Record<string, string[]>;
  onToggle: (groupKey: string, value: string) => void;
  onReset: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const activeCount = Object.values(selected).reduce((n, arr) => n + arr.length, 0);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "glass-rim glass-btn inline-flex h-11 items-center gap-2 rounded-xl px-4 text-[13px] font-semibold transition-transform hover:scale-[1.02] sm:text-sm",
          activeCount > 0 ? "text-[#014aaf]" : "text-[#00224f]",
        )}
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filter
        {activeCount > 0 && (
          <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-[#014aaf] px-1 text-[11px] font-bold text-white">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-black/[0.06] bg-white p-3 shadow-[0px_16px_40px_rgba(0,34,79,0.18)]">
            {groups.map((g) => (
              <div key={g.key} className="mb-3 last:mb-0">
                <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wider text-ink/40">
                  {g.label}
                </p>
                <div className="flex flex-col gap-0.5">
                  {g.options.map((o) => {
                    const active = selected[g.key]?.includes(o.value) ?? false;
                    return (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => onToggle(g.key, o.value)}
                        className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] transition-colors hover:bg-black/[0.04] sm:text-sm"
                      >
                        <span className={cn("text-ink/75", active && "font-semibold text-[#014aaf]")}>
                          {o.label}
                        </span>
                        <span
                          className={cn(
                            "grid h-4 w-4 shrink-0 place-items-center rounded border transition-colors",
                            active ? "border-[#014aaf] bg-[#014aaf] text-white" : "border-black/20",
                          )}
                        >
                          {active && <Check className="h-3 w-3" strokeWidth={3} />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {activeCount > 0 && (
              <button
                type="button"
                onClick={onReset}
                className="mt-1 flex w-full items-center justify-center gap-1.5 border-t border-black/5 pt-2 text-xs font-medium text-ink/50 transition-colors hover:text-[#dc2626]"
              >
                <X className="h-3.5 w-3.5" /> Reset filter
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
