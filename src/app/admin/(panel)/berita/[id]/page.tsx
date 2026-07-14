"use client";

import Link from "next/link";
import { use } from "react";
import { BeritaForm } from "../berita-form";
import { useAdmin } from "../../../_store";

export default function BeritaEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { getNews, loading } = useAdmin();
  const item = getNews(id);

  if (loading) {
    return (
      <div className="grid place-items-center py-24 text-ink/50">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#014aaf]/30 border-t-[#014aaf]" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="glass-rim glass-card mx-auto max-w-4xl rounded-[22px] p-10 text-center">
        <p className="text-ink/60">Berita tidak ditemukan.</p>
        <Link href="/admin/berita" className="glass-rim glass-btn mt-4 inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium text-[#014aaf]">
          Kembali ke daftar
        </Link>
      </div>
    );
  }

  return <BeritaForm initial={item} />;
}
