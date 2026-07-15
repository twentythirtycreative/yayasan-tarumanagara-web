"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AlertTriangle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "danger" | "primary";

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: Variant;
};

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmCtx = createContext<ConfirmFn>(async () => false);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<((v: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((options) => {
    setOpts(options);
    return new Promise<boolean>((resolve) => setResolver(() => resolve));
  }, []);

  const close = useCallback(
    (value: boolean) => {
      resolver?.(value);
      setResolver(null);
      setOpts(null);
    },
    [resolver],
  );

  useEffect(() => {
    if (!opts) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(false);
      if (e.key === "Enter") close(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [opts, close]);

  const danger = opts?.variant === "danger";

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      {opts && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            aria-label="Tutup"
            onClick={() => close(false)}
            className="absolute inset-0 cursor-default bg-[#00224f]/40 backdrop-blur-[3px]"
          />
          <div className="glass-rim relative w-full max-w-sm rounded-3xl border border-white/70 bg-[rgba(255,255,255,0.9)] p-6 shadow-[0px_30px_80px_rgba(0,34,79,0.35)] backdrop-blur-2xl sm:p-7">
            <div
              className={cn(
                "grid h-12 w-12 place-items-center rounded-2xl",
                danger ? "bg-[#fdecec] text-[#dc2626]" : "bg-[#eef4ff] text-[#014aaf]",
              )}
            >
              {danger ? (
                <AlertTriangle className="h-6 w-6" />
              ) : (
                <HelpCircle className="h-6 w-6" />
              )}
            </div>

            <h2 className="mt-4 text-lg font-extrabold text-[#00224f]">{opts.title}</h2>
            {opts.description && (
              <p className="mt-1.5 text-sm leading-relaxed text-ink/60">
                {opts.description}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => close(false)}
                className="glass-rim glass-btn inline-flex h-10 items-center rounded-xl px-4 text-sm font-semibold text-ink/70"
              >
                {opts.cancelText ?? "Batal"}
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => close(true)}
                className={cn(
                  "glass-rim inline-flex h-10 items-center rounded-xl px-4 text-sm font-semibold text-white transition-transform hover:scale-[1.02]",
                  danger
                    ? "bg-[#dc2626] shadow-[0px_8px_20px_rgba(220,38,38,0.28)]"
                    : "bg-gradient-to-r from-[#00357d] to-[#0060e3] shadow-[0px_4px_13.8px_rgba(0,0,0,0.12)]",
                )}
              >
                {opts.confirmText ?? "Konfirmasi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmCtx.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmCtx);
