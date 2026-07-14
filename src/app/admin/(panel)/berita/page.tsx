"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, EyeOff, Search, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdmin } from "../../_store";
import { useConfirm } from "../confirm";

function RowActions({
  published,
  editHref,
  onTogglePublish,
  onDelete,
}: {
  published: boolean;
  editHref: string;
  onTogglePublish: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (r) {
      const width = 192; // w-48
      const left = Math.max(8, Math.min(r.right - width, window.innerWidth - width - 8));
      setPos({ top: r.bottom + 6, left });
    }
    setOpen((v) => !v);
  };

  const itemCls =
    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors";

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label="Aksi"
        onClick={toggle}
        className="glass-rim glass-btn grid h-9 w-9 place-items-center rounded-xl text-ink/55 hover:text-[#00224f]"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            style={{ top: pos.top, left: pos.left }}
            className="fixed z-50 w-48 rounded-2xl border border-black/[0.06] bg-white p-1.5 shadow-[0px_16px_40px_rgba(0,34,79,0.18)]"
          >
            <button
              type="button"
              onClick={() => {
                onTogglePublish();
                setOpen(false);
              }}
              className={cn(itemCls, "text-ink/75 hover:bg-black/[0.04] hover:text-[#014aaf]")}
            >
              {published ? (
                <EyeOff className="h-4 w-4 text-[#014aaf]" />
              ) : (
                <Eye className="h-4 w-4 text-[#014aaf]" />
              )}
              {published ? "Jadikan draf" : "Publikasikan"}
            </button>
            <Link
              href={editHref}
              onClick={() => setOpen(false)}
              className={cn(itemCls, "text-ink/75 hover:bg-black/[0.04] hover:text-[#014aaf]")}
            >
              <Pencil className="h-4 w-4 text-[#014aaf]" /> Sunting
            </Link>
            <button
              type="button"
              onClick={() => {
                onDelete();
                setOpen(false);
              }}
              className={cn(itemCls, "text-[#dc2626] hover:bg-[#fdecec]")}
            >
              <Trash2 className="h-4 w-4" /> Hapus
            </button>
          </div>
        </>
      )}
    </>
  );
}

export default function AdminBeritaList() {
  const { news, deleteNews, togglePublish, loading } = useAdmin();
  const confirm = useConfirm();
  const [q, setQ] = useState("");

  const filtered = news.filter((n) =>
    n.title.toLowerCase().includes(q.trim().toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[clamp(2rem,3.2vw,2.75rem)] font-extrabold leading-[1.1] text-[#00224f]">Berita &amp; Kegiatan</h1>
          <p className="mt-1 text-sm text-ink/60">Kelola, publikasikan, dan sunting artikel.</p>
        </div>
        <Link
          href="/admin/berita/baru"
          className="glass-rim glass-btn-primary inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold transition-transform hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" /> Tambah Berita
        </Link>
      </div>

      {/* Search */}
      <div className="glass-rim glass-card mt-6 flex items-center gap-2 rounded-xl px-3.5 sm:max-w-sm">
        <Search className="h-4 w-4 text-ink/40" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari judul…"
          className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-ink/40"
        />
      </div>

      {/* Table */}
      <div className="glass-rim glass-card mt-4 overflow-hidden rounded-[24px]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-black/[0.06] text-[11px] font-semibold uppercase tracking-wider text-ink/40">
                <th className="px-6 py-4">Berita</th>
                <th className="px-6 py-4">Tag</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((n) => (
                <tr
                  key={n.id}
                  className="group border-b border-black/[0.04] transition-colors last:border-0 hover:bg-white/70"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3.5">
                      <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-md bg-black/5 ring-1 ring-black/5">
                        <Image src={n.coverImageUrl} alt="" fill sizes="64px" className="object-cover" />
                      </div>
                      <span className="line-clamp-2 max-w-[260px] font-semibold text-[#00224f]">
                        {n.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex max-w-[200px] flex-wrap gap-1.5">
                      {n.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-xs font-medium text-[#014aaf]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-3.5 text-ink/55">{n.dateLabel}</td>
                  <td className="px-6 py-3.5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                        n.published ? "bg-[#e6f6ec] text-[#137a37]" : "bg-[#fdf1df] text-[#9a5b00]",
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full", n.published ? "bg-[#22a745]" : "bg-[#e0a52b]")} />
                      {n.published ? "Publik" : "Draf"}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex justify-start">
                      <RowActions
                        published={n.published}
                        editHref={`/admin/berita/${n.id}`}
                        onTogglePublish={async () => {
                          const ok = await confirm(
                            n.published
                              ? {
                                  title: "Matikan publikasi?",
                                  description: `"${n.title}" akan disembunyikan dari halaman publik dan menjadi draf.`,
                                  confirmText: "Jadikan Draf",
                                  variant: "danger",
                                }
                              : {
                                  title: "Publikasikan berita?",
                                  description: `"${n.title}" akan tampil di halaman publik.`,
                                  confirmText: "Publikasikan",
                                  variant: "primary",
                                },
                          );
                          if (!ok) return;
                          await togglePublish(n.id);
                          toast.success(n.published ? "Dijadikan draf" : "Dipublikasikan");
                        }}
                        onDelete={async () => {
                          const ok = await confirm({
                            title: "Hapus berita?",
                            description: `"${n.title}" akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.`,
                            confirmText: "Hapus",
                            variant: "danger",
                          });
                          if (!ok) return;
                          await deleteNews(n.id);
                          toast.success("Berita dihapus");
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-ink/45">
                    Memuat…
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-ink/45">
                    {news.length === 0 ? "Belum ada berita." : "Berita tidak ditemukan."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
