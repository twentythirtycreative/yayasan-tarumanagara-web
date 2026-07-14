"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RotateCw } from "lucide-react";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-[70vh] place-items-center px-6 py-24 text-center">
      <div className="max-w-md">
        <p className="text-header font-extrabold text-navy">Ups</p>
        <h1 className="mt-1 text-title-1 font-bold text-ink">Terjadi kesalahan</h1>
        <p className="mt-3 text-body font-medium text-ink/60">
          Maaf, halaman gagal dimuat. Silakan coba lagi beberapa saat lagi.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="glass-rim inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#00357d] to-[#0060e3] px-5 text-sm font-semibold text-white shadow-[0px_8px_20px_rgba(1,93,219,0.25)] backdrop-blur-sm transition-transform hover:scale-[1.02]"
          >
            <RotateCw className="h-4 w-4" /> Coba lagi
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-black/10 px-5 text-sm font-semibold text-ink/70 transition-colors hover:bg-black/[0.03]"
          >
            <Home className="h-4 w-4" /> Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
