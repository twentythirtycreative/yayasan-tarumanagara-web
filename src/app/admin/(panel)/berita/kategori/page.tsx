"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
  ChevronLeft,
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ALL_NEWS_TAB_LABEL,
  useAdmin,
  type AdminNewsCategory,
} from "../../../_store";
import { useConfirm } from "../../confirm";

const field =
  "w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-[#014aaf] focus:ring-2 focus:ring-[#014aaf]/20";
const labelCls = "text-sm font-medium text-ink/80";
const iconBtn =
  "glass-rim glass-btn grid h-9 w-9 place-items-center rounded-lg text-ink/60 disabled:pointer-events-none disabled:opacity-35";

/**
 * Berita → Kelola Kategori. One row per tab on the public /berita bar, in the
 * order they appear there.
 *
 * "Semua Berita" has no row and never will: it is the unfiltered list, not a
 * category. It is printed as a fixed first entry only so the order on screen
 * matches the public bar.
 */
export default function AdminKategoriBerita() {
  const {
    news,
    newsCategories,
    saveNewsCategory,
    deleteNewsCategory,
    moveNewsCategory,
    loading,
  } = useAdmin();
  const confirm = useConfirm();

  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  // Same ordering the public tab bar uses, so this list reads top-to-bottom as
  // the bar reads left-to-right.
  const ordered = [...newsCategories].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
  );
  const countIn = (id: string) => news.filter((n) => n.categoryId === id).length;

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim();
    if (!finalName) {
      toast.error("Nama kategori wajib diisi.");
      return;
    }
    setAdding(true);
    try {
      // `slug` is a placeholder: the action derives the real one from the name
      // and hands it back, and the store keeps what came back.
      await saveNewsCategory({
        id: `c_${Date.now()}`,
        name: finalName,
        slug: "",
        sortOrder: ordered.length,
      });
      setName("");
      toast.success("Kategori ditambahkan");
    } catch (err) {
      toast.error(
        err instanceof Error && err.message
          ? err.message
          : "Gagal menambah kategori. Coba lagi.",
      );
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (c: AdminNewsCategory) => {
    setEditingId(c.id);
    setEditName(c.name);
  };

  const saveEdit = async (c: AdminNewsCategory) => {
    const finalName = editName.trim();
    if (!finalName) {
      toast.error("Nama kategori wajib diisi.");
      return;
    }
    setBusy(c.id);
    try {
      await saveNewsCategory({ ...c, name: finalName });
      setEditingId(null);
      toast.success("Kategori disimpan");
    } catch (err) {
      toast.error(
        err instanceof Error && err.message
          ? err.message
          : "Gagal menyimpan kategori. Coba lagi.",
      );
    } finally {
      setBusy(null);
    }
  };

  const move = async (id: string, direction: -1 | 1) => {
    setBusy(id);
    try {
      await moveNewsCategory(id, direction);
    } catch {
      toast.error("Gagal mengubah urutan. Coba lagi.");
    } finally {
      setBusy(null);
    }
  };

  const remove = async (c: AdminNewsCategory) => {
    const used = countIn(c.id);
    const ok = await confirm({
      title: "Hapus kategori?",
      description: used
        ? `Tab "${c.name}" akan hilang dari halaman Berita. ${used} berita di dalamnya tidak ikut terhapus — statusnya kembali tanpa kategori dan tetap tampil di ${ALL_NEWS_TAB_LABEL}.`
        : `Tab "${c.name}" akan hilang dari halaman Berita. Tindakan ini tidak bisa dibatalkan.`,
      confirmText: "Hapus",
      variant: "danger",
      onConfirm: async () => {
        try {
          await deleteNewsCategory(c.id);
        } catch (error) {
          toast.error("Gagal menghapus kategori. Coba lagi.");
          throw error;
        }
      },
    });
    if (!ok) return;
    toast.success("Kategori dihapus");
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/berita"
        className="glass-rim glass-btn inline-flex h-10 items-center gap-1 rounded-[86px] pl-1.5 pr-4 text-sm font-semibold text-[#014aaf] transition-transform hover:scale-[1.03] sm:h-[46px] sm:pl-2 sm:pr-6 sm:text-[18px]"
      >
        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.25} /> Kembali
      </Link>

      <h1 className="mt-4 text-[clamp(2rem,3.2vw,2.75rem)] font-extrabold leading-[1.1] text-[#00224f]">
        Kategori Berita
      </h1>
      <p className="mt-1 text-sm text-ink/60">
        Kategori di sini menjadi tab di halaman Berita &amp; Kegiatan publik.
        Urutan tab mengikuti urutan daftar ini, dari atas ke bawah.
      </p>

      {/* Add */}
      <form
        onSubmit={add}
        className="glass-rim glass-card mt-6 grid gap-4 rounded-[18px] p-5 sm:grid-cols-[1fr_auto] sm:items-end"
      >
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Nama Kategori</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={field}
            placeholder="mis. Media Tarumanagara"
          />
        </div>
        <button
          type="submit"
          disabled={adding}
          className="glass-rim inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00357d] to-[#0060e3] px-5 text-sm font-semibold text-[#f5f5f5] shadow-[0px_4px_13.8px_rgba(0,0,0,0.12)] transition-transform hover:scale-[1.03] disabled:opacity-70 disabled:hover:scale-100"
        >
          <Plus className="h-4 w-4" /> Tambah
        </button>
      </form>

      {/* List */}
      <div className="mt-6 flex flex-col gap-3">
        {/* The built-in first tab, shown for context only. */}
        <div className="glass-rim glass-card flex items-center gap-4 rounded-[16px] px-4 py-3.5 opacity-70">
          <span className="w-6 shrink-0 text-center text-xs tabular-nums text-ink/45">
            1
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-[#00224f]">
              {ALL_NEWS_TAB_LABEL}
            </p>
            <p className="mt-0.5 text-xs text-ink/50">
              Tab bawaan — memuat semua berita &amp; kegiatan. Tidak bisa diubah
              atau dihapus.
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-black/[0.06] px-2.5 py-0.5 text-xs font-semibold text-ink/55">
            {news.length} berita
          </span>
        </div>

        {ordered.map((c, i) => {
          const editing = editingId === c.id;
          return (
            <div
              key={c.id}
              className="glass-rim glass-card flex flex-wrap items-center gap-3 rounded-[16px] px-4 py-3.5 sm:flex-nowrap sm:gap-4"
            >
              <span className="w-6 shrink-0 text-center text-xs tabular-nums text-ink/45">
                {i + 2}
              </span>

              {editing ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      saveEdit(c);
                    } else if (e.key === "Escape") {
                      setEditingId(null);
                    }
                  }}
                  autoFocus
                  className={cn(field, "min-w-0 flex-1")}
                  placeholder="Nama kategori"
                />
              ) : (
                <p className="min-w-0 flex-1 truncate font-semibold text-[#00224f]">
                  {c.name}
                </p>
              )}

              {!editing && (
                <span className="shrink-0 rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-xs font-semibold text-[#014aaf]">
                  {countIn(c.id)} berita
                </span>
              )}

              <div className="ml-auto flex shrink-0 items-center gap-1">
                {editing ? (
                  <>
                    <button
                      type="button"
                      title="Simpan"
                      disabled={busy === c.id}
                      onClick={() => saveEdit(c)}
                      className={cn(iconBtn, "hover:text-[#137a37]")}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      title="Batal"
                      onClick={() => setEditingId(null)}
                      className={cn(iconBtn, "hover:text-[#dc2626]")}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      title="Naikkan urutan"
                      disabled={i === 0 || busy === c.id}
                      onClick={() => move(c.id, -1)}
                      className={cn(iconBtn, "hover:text-[#014aaf]")}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      title="Turunkan urutan"
                      disabled={i === ordered.length - 1 || busy === c.id}
                      onClick={() => move(c.id, 1)}
                      className={cn(iconBtn, "hover:text-[#014aaf]")}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      title="Sunting"
                      onClick={() => startEdit(c)}
                      className={cn(iconBtn, "hover:text-[#014aaf]")}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      title="Hapus"
                      onClick={() => remove(c)}
                      className={cn(iconBtn, "hover:text-[#dc2626]")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="glass-rim glass-card rounded-[16px] px-5 py-10 text-center text-ink/45">
            Memuat…
          </div>
        )}
        {!loading && ordered.length === 0 && (
          <div className="glass-rim glass-card rounded-[16px] px-5 py-10 text-center text-ink/45">
            Belum ada kategori tambahan. Halaman Berita hanya menampilkan tab{" "}
            {ALL_NEWS_TAB_LABEL}.
          </div>
        )}
      </div>
    </div>
  );
}
