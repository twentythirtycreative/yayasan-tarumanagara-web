"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, EyeOff, Search, MoreVertical, ImageOff } from "lucide-react";
import { FilterMenu } from "../filter-menu";
import { useAnchoredMenu } from "../use-anchored-menu";
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
  const { open, setOpen, toggle, anchorRef, menuRef, menuStyle } = useAnchoredMenu();

  const itemCls =
    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors";

  return (
    <>
      <button
        ref={anchorRef}
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
            ref={menuRef}
            style={menuStyle}
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

type NewsItem = ReturnType<typeof useAdmin>["news"][number];

function StatusBadge({ published }: { published: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        published ? "bg-[#e6f6ec] text-[#137a37]" : "bg-[#fdf1df] text-[#9a5b00]",
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", published ? "bg-[#22a745]" : "bg-[#e0a52b]")} />
      {published ? "Publik" : "Draf"}
    </span>
  );
}

// Wraps RowActions with the confirm/mutation wiring so the table and the mobile
// card list can share one implementation.
function NewsRowActions({ item }: { item: NewsItem }) {
  const { deleteNews, togglePublish } = useAdmin();
  const confirm = useConfirm();
  return (
    <RowActions
      published={item.published}
      editHref={`/admin/berita/${item.id}`}
      onTogglePublish={async () => {
        const ok = await confirm({
          ...(item.published
            ? {
                title: "Matikan publikasi?",
                description: `"${item.title}" akan disembunyikan dari halaman publik dan menjadi draf.`,
                confirmText: "Jadikan Draf",
                variant: "danger" as const,
              }
            : {
                title: "Publikasikan berita?",
                description: `"${item.title}" akan tampil di halaman publik.`,
                confirmText: "Publikasikan",
                variant: "primary" as const,
              }),
          onConfirm: async () => {
            try {
              await togglePublish(item.id);
            } catch (error) {
              toast.error("Gagal mengubah status berita. Coba lagi.");
              throw error;
            }
          },
        });
        if (!ok) return;
        toast.success(item.published ? "Dijadikan draf" : "Dipublikasikan");
      }}
      onDelete={async () => {
        const ok = await confirm({
          title: "Hapus berita?",
          description: `"${item.title}" akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.`,
          confirmText: "Hapus",
          variant: "danger",
          onConfirm: async () => {
            try {
              await deleteNews(item.id);
            } catch (error) {
              toast.error("Gagal menghapus berita. Coba lagi.");
              throw error;
            }
          },
        });
        if (!ok) return;
        toast.success("Berita dihapus");
      }}
    />
  );
}

export default function AdminBeritaList() {
  const { news, loading } = useAdmin();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Record<string, string[]>>({ status: [] });

  const toggleFilter = (key: string, value: string) =>
    setSelected((prev) => {
      const arr = prev[key] ?? [];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  const resetFilter = () => setSelected({ status: [] });

  const statusFilter = selected.status ?? [];
  const filtered = news.filter((n) => {
    const status = n.published ? "published" : "draft";
    return (
      n.title.toLowerCase().includes(q.trim().toLowerCase()) &&
      (statusFilter.length === 0 || statusFilter.includes(status))
    );
  });

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-start justify-between gap-4 sm:items-end">
        <div>
          <h1 className="text-[clamp(2rem,3.2vw,2.75rem)] font-extrabold leading-[1.1] text-[#00224f]">Berita &amp; Kegiatan</h1>
          <p className="mt-1 text-sm text-ink/60">Kelola, publikasikan, dan sunting artikel.</p>
        </div>
        <Link
          href="/admin/berita/baru"
          aria-label="Tambah Berita"
          className="glass-rim inline-flex h-11 w-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00357d] to-[#0060e3] text-sm font-semibold text-[#f5f5f5] shadow-[0px_4px_13.8px_rgba(0,0,0,0.12)] transition-transform hover:scale-[1.03] sm:w-auto sm:px-5"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Tambah Berita</span>
        </Link>
      </div>

      {/* Search + filter */}
      <div className="mt-6 flex items-center gap-3">
        <div className="glass-rim glass-card flex w-full items-center gap-2 rounded-xl px-3.5 sm:max-w-sm">
          <Search className="h-4 w-4 text-ink/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari judul…"
            className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-ink/40"
          />
        </div>
        <FilterMenu
          groups={[
            {
              key: "status",
              label: "Status",
              options: [
                { value: "published", label: "Publik" },
                { value: "draft", label: "Draf" },
              ],
            },
          ]}
          selected={selected}
          onToggle={toggleFilter}
          onReset={resetFilter}
        />
      </div>

      {/* Mobile: card list (the table below scrolls awkwardly on phones) */}
      <div className="mt-4 flex flex-col gap-3 md:hidden">
        {filtered.map((n) => (
          <div key={n.id} className="glass-rim glass-card rounded-[16px] p-4">
            <div className="flex gap-3.5">
              <div className="relative grid h-14 w-20 shrink-0 place-items-center overflow-hidden rounded-lg bg-black/5 ring-1 ring-black/5">
                {n.coverImageUrl ? (
                  <Image src={n.coverImageUrl} alt="" fill sizes="80px" className="object-cover" />
                ) : (
                  <ImageOff className="h-5 w-5 text-ink/25" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <span className="line-clamp-2 font-semibold text-[#00224f]">{n.title}</span>
                  <NewsRowActions item={n} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge published={n.published} />
                  <span className="text-xs text-ink/55">{n.dateLabel}</span>
                </div>
              </div>
            </div>
            {n.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {n.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-xs font-medium text-[#014aaf]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="glass-rim glass-card rounded-[16px] px-5 py-10 text-center text-ink/45">
            Memuat…
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="glass-rim glass-card rounded-[16px] px-5 py-10 text-center text-ink/45">
            {news.length === 0 ? "Belum ada berita." : "Berita tidak ditemukan."}
          </div>
        )}
      </div>

      {/* Desktop: table */}
      <div className="glass-rim glass-card mt-4 hidden overflow-hidden rounded-[20px] md:block">
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
                      <div className="relative grid h-11 w-16 shrink-0 place-items-center overflow-hidden rounded-md bg-black/5 ring-1 ring-black/5">
                        {n.coverImageUrl ? (
                          <Image src={n.coverImageUrl} alt="" fill sizes="64px" className="object-cover" />
                        ) : (
                          <ImageOff className="h-4 w-4 text-ink/25" />
                        )}
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
                    <StatusBadge published={n.published} />
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex justify-start">
                      <NewsRowActions item={n} />
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
