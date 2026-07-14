import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-[#00224f] via-[#00357d] to-[#013275] px-6 text-center text-[#f5f5f5]">
      <div className="max-w-md">
        <p className="text-[clamp(4rem,18vw,10rem)] font-extrabold leading-none tracking-tight">
          404
        </p>
        <h1 className="mt-2 text-title-1 font-bold">Halaman tidak ditemukan</h1>
        <p className="mt-3 text-body font-medium text-white/70">
          Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
        <Link
          href="/"
          className="glass-rim mt-7 inline-flex h-11 items-center gap-2 rounded-xl bg-white/15 px-5 text-sm font-semibold backdrop-blur-sm transition-colors hover:bg-white/25"
        >
          <Home className="h-4 w-4" /> Kembali ke Beranda
        </Link>
      </div>
    </main>
  );
}
