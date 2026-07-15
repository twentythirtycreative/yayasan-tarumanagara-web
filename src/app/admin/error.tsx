"use client";

import { useEffect } from "react";
import { RotateCw } from "lucide-react";

export default function AdminError({
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
    <main className="grid min-h-screen place-items-center bg-white px-6 text-center">
      <div className="max-w-md">
        <h1 className="text-title-1 font-extrabold text-[#00224f]">
          Terjadi kesalahan
        </h1>
        <p className="mt-2 text-sm text-ink/60">
          Gagal memuat data admin. Periksa koneksi database lalu coba lagi.
        </p>
        <button
          type="button"
          onClick={reset}
          className="glass-rim mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#00357d] to-[#0060e3] px-5 text-sm font-semibold text-[#f5f5f5] shadow-[0px_4px_13.8px_rgba(0,0,0,0.12)] transition-transform hover:scale-[1.03]"
        >
          <RotateCw className="h-4 w-4" /> Coba lagi
        </button>
      </div>
    </main>
  );
}
