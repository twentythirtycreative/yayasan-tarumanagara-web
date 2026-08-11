"use client";

import Link from "next/link";
import { use } from "react";
import { TataKelolaForm } from "../tata-kelola-form";
import { useAdmin } from "../../../_store";

export default function TataKelolaEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { getGovernanceMember, loading } = useAdmin();
  const item = getGovernanceMember(id);

  if (loading) {
    return (
      <div className="grid place-items-center py-24 text-ink/50">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#014aaf]/30 border-t-[#014aaf]" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="glass-rim glass-card mx-auto max-w-4xl rounded-[18px] p-10 text-center">
        <p className="text-ink/60">Pengurus tidak ditemukan.</p>
        <Link
          href="/admin/tata-kelola"
          className="glass-rim glass-btn mt-4 inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium text-[#014aaf]"
        >
          Kembali ke daftar
        </Link>
      </div>
    );
  }

  return <TataKelolaForm initial={item} />;
}
