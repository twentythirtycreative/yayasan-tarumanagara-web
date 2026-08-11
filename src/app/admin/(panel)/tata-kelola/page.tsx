"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdmin, GOVERNANCE_ROLES, type GovernanceRole } from "../../_store";
import { useConfirm } from "../confirm";

export default function AdminTataKelolaList() {
  const {
    governance,
    deleteGovernanceMember,
    toggleGovernancePublished,
    moveGovernanceMember,
    loading,
  } = useAdmin();
  const confirm = useConfirm();
  const [tab, setTab] = useState<GovernanceRole>("Pembina");
  const [q, setQ] = useState("");
  const [moving, setMoving] = useState<string | null>(null);

  // Same ordering the public page uses, so what admin sees left-to-right here is
  // what visitors get: sortOrder first, name as the tie-breaker.
  const inTab = governance
    .filter((m) => m.role === tab)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  const needle = q.trim().toLowerCase();
  const filtered = needle
    ? inTab.filter((m) => `${m.name} ${m.position}`.toLowerCase().includes(needle))
    : inTab;

  const move = async (id: string, direction: -1 | 1) => {
    setMoving(id);
    try {
      await moveGovernanceMember(id, direction);
    } catch {
      toast.error("Gagal mengubah urutan. Coba lagi.");
    } finally {
      setMoving(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-start justify-between gap-4 sm:items-end">
        <div>
          <h1 className="text-[clamp(2rem,3.2vw,2.75rem)] font-extrabold leading-[1.1] text-[#00224f]">
            Tata Kelola Organisasi
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            Kelola pengurus yang tampil di halaman Tentang Kami. Urutan kartu
            mengikuti urutan di sini, dari kiri ke kanan.
          </p>
        </div>
        <Link
          href={`/admin/tata-kelola/baru?kategori=${encodeURIComponent(tab)}`}
          aria-label={`Tambah ${tab}`}
          className="glass-rim inline-flex h-11 w-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00357d] to-[#0060e3] text-sm font-semibold text-[#f5f5f5] shadow-[0px_4px_13.8px_rgba(0,0,0,0.12)] transition-transform hover:scale-[1.03] sm:w-auto sm:px-5"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Tambah {tab}</span>
        </Link>
      </div>

      {/* Role tabs — mirror the three tabs on the public page */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {GOVERNANCE_ROLES.map((r) => {
          const count = governance.filter((m) => m.role === r).length;
          return (
            <button
              key={r}
              type="button"
              onClick={() => setTab(r)}
              className={cn(
                "glass-rim h-11 cursor-pointer rounded-xl px-5 text-sm transition-colors",
                r === tab
                  ? "bg-gradient-to-r from-[#00357d] to-[#0060e3] font-semibold text-[#f5f5f5]"
                  : "glass-btn font-medium text-[#014aaf]",
              )}
            >
              {r}
              <span className={cn("ml-2 text-xs", r === tab ? "text-white/70" : "text-ink/45")}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="glass-rim glass-card flex w-full items-center gap-2 rounded-xl px-3.5 sm:max-w-sm">
          <Search className="h-4 w-4 text-ink/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama atau jabatan…"
            className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-ink/40"
          />
        </div>
      </div>

      {needle && (
        <p className="mt-3 text-xs text-ink/50">
          Tombol urutan dinonaktifkan selama pencarian aktif — urutan hanya bisa
          diubah pada daftar penuh.
        </p>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {filtered.map((m, i) => (
          <div key={m.id} className="glass-rim glass-card flex gap-4 rounded-[18px] p-4">
            <div className="relative h-[104px] w-[82px] shrink-0 overflow-hidden rounded-[12px] bg-black/[0.04]">
              {m.photoUrl ? (
                <Image
                  src={m.photoUrl}
                  alt={m.name}
                  fill
                  sizes="82px"
                  unoptimized
                  style={{ objectPosition: m.photoPosition }}
                  className="object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center text-[10px] text-ink/40">
                  Tanpa foto
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-bold text-[#00224f]">{m.name}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-ink/60">{m.position}</p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    m.published
                      ? "bg-[#e6f6ec] text-[#137a37]"
                      : "bg-black/[0.06] text-ink/55",
                  )}
                >
                  {m.published ? "Tampil" : "Disembunyikan"}
                </span>
              </div>

              <div className="mt-auto flex items-center justify-between gap-1 border-t border-black/5 pt-3">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Geser ke kiri"
                    disabled={Boolean(needle) || i === 0 || moving === m.id}
                    onClick={() => move(m.id, -1)}
                    className="glass-rim glass-btn grid h-8 w-8 place-items-center rounded-lg text-ink/60 hover:text-[#014aaf] disabled:pointer-events-none disabled:opacity-35"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <span className="w-6 text-center text-xs tabular-nums text-ink/45">
                    {i + 1}
                  </span>
                  <button
                    type="button"
                    title="Geser ke kanan"
                    disabled={
                      Boolean(needle) || i === filtered.length - 1 || moving === m.id
                    }
                    onClick={() => move(m.id, 1)}
                    className="glass-rim glass-btn grid h-8 w-8 place-items-center rounded-lg text-ink/60 hover:text-[#014aaf] disabled:pointer-events-none disabled:opacity-35"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title={m.published ? "Sembunyikan" : "Tampilkan"}
                    onClick={async () => {
                      const ok = await confirm({
                        ...(m.published
                          ? {
                              title: "Sembunyikan dari halaman publik?",
                              description: `"${m.name}" tidak akan tampil di Tata Kelola Organisasi.`,
                              confirmText: "Sembunyikan",
                              variant: "danger" as const,
                            }
                          : {
                              title: "Tampilkan di halaman publik?",
                              description: `"${m.name}" akan tampil di tab ${m.role}.`,
                              confirmText: "Tampilkan",
                              variant: "primary" as const,
                            }),
                        onConfirm: async () => {
                          try {
                            await toggleGovernancePublished(m.id);
                          } catch (error) {
                            toast.error("Gagal mengubah status. Coba lagi.");
                            throw error;
                          }
                        },
                      });
                      if (!ok) return;
                      toast.success(m.published ? "Disembunyikan" : "Ditampilkan");
                    }}
                    className="glass-rim glass-btn grid h-8 w-8 place-items-center rounded-lg text-ink/60 hover:text-[#014aaf]"
                  >
                    {m.published ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  <Link
                    href={`/admin/tata-kelola/${m.id}`}
                    title="Sunting"
                    className="glass-rim glass-btn grid h-8 w-8 place-items-center rounded-lg text-ink/60 hover:text-[#014aaf]"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    title="Hapus"
                    onClick={async () => {
                      const ok = await confirm({
                        title: `Hapus ${m.role}?`,
                        description: `"${m.name}" akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.`,
                        confirmText: "Hapus",
                        variant: "danger",
                        onConfirm: async () => {
                          try {
                            await deleteGovernanceMember(m.id);
                          } catch (error) {
                            toast.error("Gagal menghapus. Coba lagi.");
                            throw error;
                          }
                        },
                      });
                      if (!ok) return;
                      toast.success(`${m.role} dihapus`);
                    }}
                    className="glass-rim glass-btn grid h-8 w-8 place-items-center rounded-lg text-ink/60 hover:text-[#dc2626]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="glass-rim glass-card col-span-full rounded-[18px] px-5 py-10 text-center text-ink/50">
            Memuat…
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="glass-rim glass-card col-span-full rounded-[18px] px-5 py-10 text-center text-ink/50">
            {inTab.length === 0
              ? `Belum ada pengurus di kategori ${tab}.`
              : "Pengurus tidak ditemukan."}
          </div>
        )}
      </div>
    </div>
  );
}
