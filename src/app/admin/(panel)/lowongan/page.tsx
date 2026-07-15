"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, EyeOff, MapPin, Clock, Search } from "lucide-react";
import { useAdmin } from "../../_store";
import { useConfirm } from "../confirm";
import { FilterMenu } from "../filter-menu";

export default function AdminLowonganList() {
  const { jobs, deleteJob, toggleJobOpen, loading } = useAdmin();
  const confirm = useConfirm();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Record<string, string[]>>({
    status: [],
    type: [],
  });

  const toggleFilter = (key: string, value: string) =>
    setSelected((prev) => {
      const arr = prev[key] ?? [];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  const resetFilter = () => setSelected({ status: [], type: [] });

  const statusFilter = selected.status ?? [];
  const typeFilter = selected.type ?? [];
  const filtered = jobs.filter((j) => {
    const status = j.isOpen ? "open" : "closed";
    return (
      `${j.title} ${j.type} ${j.location}`
        .toLowerCase()
        .includes(q.trim().toLowerCase()) &&
      (statusFilter.length === 0 || statusFilter.includes(status)) &&
      (typeFilter.length === 0 || typeFilter.includes(j.type))
    );
  });

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-start justify-between gap-4 sm:items-end">
        <div>
          <h1 className="text-[clamp(2rem,3.2vw,2.75rem)] font-extrabold leading-[1.1] text-[#00224f]">Lowongan Kerja</h1>
          <p className="mt-1 text-sm text-ink/60">
            Kelola posisi yang tampil di halaman Karir.
          </p>
        </div>
        <Link
          href="/admin/lowongan/baru"
          aria-label="Tambah Lowongan"
          className="glass-rim inline-flex h-11 w-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00357d] to-[#0060e3] text-sm font-semibold text-[#f5f5f5] shadow-[0px_4px_13.8px_rgba(0,0,0,0.12)] transition-transform hover:scale-[1.03] sm:w-auto sm:px-5"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Tambah Lowongan</span>
        </Link>
      </div>

      {/* Search + filter */}
      <div className="mt-6 flex items-center gap-3">
        <div className="glass-rim glass-card flex w-full items-center gap-2 rounded-xl px-3.5 sm:max-w-sm">
          <Search className="h-4 w-4 text-ink/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari lowongan…"
            className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-ink/40"
          />
        </div>
        <FilterMenu
          groups={[
            {
              key: "status",
              label: "Status",
              options: [
                { value: "open", label: "Dibuka" },
                { value: "closed", label: "Ditutup" },
              ],
            },
            {
              key: "type",
              label: "Tipe Kerja",
              options: [
                { value: "Full-Time", label: "Full-Time" },
                { value: "Part-Time", label: "Part-Time" },
                { value: "Kontrak", label: "Kontrak" },
                { value: "Magang", label: "Magang" },
              ],
            },
          ]}
          selected={selected}
          onToggle={toggleFilter}
          onReset={resetFilter}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {filtered.map((j) => (
          <div
            key={j.id}
            className="glass-rim glass-card flex flex-col rounded-[18px] p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-bold text-[#00224f]">{j.title}</h3>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  j.isOpen ? "bg-[#e6f6ec] text-[#137a37]" : "bg-black/[0.06] text-ink/55"
                }`}
              >
                {j.isOpen ? "Dibuka" : "Ditutup"}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink/60">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {j.type}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {j.location}
              </span>
            </div>
            <p className="mt-3 line-clamp-3 flex-1 text-sm text-ink/70">{j.desc}</p>

            <div className="mt-4 flex items-center justify-end gap-1 border-t border-black/5 pt-3">
              <button
                type="button"
                title={j.isOpen ? "Tutup lowongan" : "Buka lowongan"}
                onClick={async () => {
                  const ok = await confirm(
                    j.isOpen
                      ? {
                          title: "Tutup lowongan?",
                          description: `"${j.title}" akan ditandai ditutup dan tidak menerima pelamar baru.`,
                          confirmText: "Tutup",
                          variant: "danger",
                        }
                      : {
                          title: "Buka lowongan?",
                          description: `"${j.title}" akan tampil sebagai lowongan yang dibuka.`,
                          confirmText: "Buka",
                          variant: "primary",
                        },
                  );
                  if (!ok) return;
                  await toggleJobOpen(j.id);
                  toast.success(j.isOpen ? "Lowongan ditutup" : "Lowongan dibuka");
                }}
                className="glass-rim glass-btn grid h-8 w-8 place-items-center rounded-lg text-ink/60 hover:text-[#014aaf]"
              >
                {j.isOpen ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <Link
                href={`/admin/lowongan/${j.id}`}
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
                    title: "Hapus lowongan?",
                    description: `"${j.title}" akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.`,
                    confirmText: "Hapus",
                    variant: "danger",
                  });
                  if (!ok) return;
                  await deleteJob(j.id);
                  toast.success("Lowongan dihapus");
                }}
                className="glass-rim glass-btn grid h-8 w-8 place-items-center rounded-lg text-ink/60 hover:text-[#dc2626]"
              >
                <Trash2 className="h-4 w-4" />
              </button>
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
            {jobs.length === 0 ? "Belum ada lowongan." : "Lowongan tidak ditemukan."}
          </div>
        )}
      </div>
    </div>
  );
}
