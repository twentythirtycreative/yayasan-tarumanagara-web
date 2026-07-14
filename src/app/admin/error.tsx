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
          className="glass-rim glass-btn-primary mt-6 inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold transition-transform hover:scale-[1.02]"
        >
          <RotateCw className="h-4 w-4" /> Coba lagi
        </button>
      </div>
    </main>
  );
}
