"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: string;
  /** Optional rich content shown in the list row (falls back to `label`). */
  labelNode?: ReactNode;
  /** Optional keywords for search. */
  keywords?: string;
  /** Optional compact content shown in the trigger when selected. */
  trigger?: ReactNode;
};

// Custom dropdown with an Apple-style glass panel. Shared across the app (Kirim
// CV form, admin Lowongan form, …) so every dropdown looks the same.
export function GlassSelect({
  options,
  value,
  onChange,
  placeholder = "Pilih",
  searchable = false,
  triggerClassName,
  panelClassName,
  align = "left",
}: {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  triggerClassName?: string;
  panelClassName?: string;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);
  const q = query.trim().toLowerCase();
  const filtered = q
    ? options.filter((o) =>
        `${o.label} ${o.keywords ?? ""}`.toLowerCase().includes(q),
      )
    : options;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex w-full cursor-pointer items-center justify-between gap-2 outline-none",
          triggerClassName,
        )}
      >
        <span className={cn("truncate", !selected && "text-[#9f9f9f]")}>
          {selected ? (selected.trigger ?? selected.label) : placeholder}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-[#262626] transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          className={cn(
            "glass-rim absolute z-30 mt-2 overflow-hidden rounded-2xl border border-white/60 bg-[rgba(255,255,255,0.99)] shadow-[0px_16px_44px_rgba(0,34,79,0.18)] backdrop-blur-xl",
            align === "right" ? "right-0" : "left-0",
            panelClassName,
          )}
        >
          {searchable && (
            <div className="p-2">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari negara / kode…"
                className="w-full rounded-lg border border-black/10 bg-white/70 px-3 py-1.5 text-[14px] text-[#262626] outline-none placeholder:text-[#9f9f9f] focus:border-[#015ddb]"
              />
            </div>
          )}
          <ul
            data-lenis-prevent-wheel
            className="max-h-56 overflow-y-auto py-1"
          >
            {filtered.map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={cn(
                    "flex w-full items-center px-4 py-2 text-left text-[14px] text-[#262626] transition-colors hover:bg-white/70",
                    o.value === value && "bg-white/50 font-semibold text-[#015ddb]",
                  )}
                >
                  {o.labelNode ?? o.label}
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-[14px] text-[#9f9f9f]">Tidak ditemukan</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
