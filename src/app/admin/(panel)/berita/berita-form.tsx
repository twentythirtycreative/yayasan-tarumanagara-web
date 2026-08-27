"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, Save, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  NEWS_TAGS,
  slugify,
  shortId,
  useAdmin,
  type AdminNews,
} from "../../_store";
import { useConfirm } from "../confirm";
import { FieldError } from "@/components/form-error";
import { GlassSelect } from "@/components/glass-select";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
  formatMB,
} from "@/lib/validators/upload";
import {
  COVER_MAX_EDGE,
  downscaleImage,
  shrinkStoredDataUrl,
} from "@/lib/image-downscale";
import { formatDateId } from "@/lib/format-date";

const field =
  "w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-[#014aaf] focus:ring-2 focus:ring-[#014aaf]/20";
const fieldErr =
  "w-full rounded-xl border border-[#dc2626] bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-[#dc2626] focus:ring-2 focus:ring-[#dc2626]/20";
const labelCls = "text-sm font-medium text-ink/80";

type BeritaErrors = {
  title?: string;
  content?: string;
  dateISO?: string;
  coverImageUrl?: string;
};

function validateBerita(v: {
  title: string;
  content: string;
  dateISO: string;
  coverImageUrl: string;
}): BeritaErrors {
  const errors: BeritaErrors = {};
  if (!v.title.trim()) errors.title = "Judul wajib diisi.";
  else if (v.title.trim().length < 3) errors.title = "Judul minimal 3 karakter.";
  if (!v.content.trim()) errors.content = "Isi konten wajib diisi.";
  else if (v.content.trim().length < 20)
    errors.content = "Isi konten terlalu pendek (minimal 20 karakter).";
  if (!v.dateISO) errors.dateISO = "Tanggal wajib diisi.";
  if (!v.coverImageUrl.trim())
    errors.coverImageUrl = "Gambar sampul wajib diunggah.";
  return errors;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

function TagInput({
  value,
  onChange,
  suggestions,
  max = 3,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions: readonly string[];
  max?: number;
}) {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const atMax = value.length >= max;

  const add = (t: string) => {
    const tag = t.trim();
    if (tag && !value.includes(tag) && value.length < max) onChange([...value, tag]);
    setInput("");
    setOpen(false);
  };
  const remove = (t: string) => onChange(value.filter((x) => x !== t));

  const filtered = suggestions.filter(
    (s) => !value.includes(s) && s.toLowerCase().includes(input.trim().toLowerCase()),
  );

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-black/10 bg-white px-2 py-2 transition-colors focus-within:border-[#014aaf] focus-within:ring-2 focus-within:ring-[#014aaf]/20">
        {value.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 rounded-full bg-[#eef4ff] py-1 pl-3 pr-1.5 text-xs font-medium text-[#014aaf]"
          >
            {t}
            <button
              type="button"
              onClick={() => remove(t)}
              className="grid h-4 w-4 place-items-center rounded-full transition-colors hover:bg-[#014aaf]/20"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {!atMax && (
          <input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                add(input);
              } else if (e.key === "Backspace" && !input && value.length) {
                remove(value[value.length - 1]);
              }
            }}
            placeholder={value.length ? "" : "Ketik tag lalu Enter…"}
            className="min-w-[100px] flex-1 bg-transparent px-1 py-0.5 text-sm outline-none placeholder:text-ink/40"
          />
        )}
      </div>
      <p className="mt-1 text-xs text-ink/45">Maksimal {max} tag.</p>
      {open && !atMax && filtered.length > 0 && (
        <div className="absolute z-20 mt-1 w-full rounded-xl border border-black/[0.06] bg-white p-1 shadow-[0px_12px_30px_rgba(0,34,79,0.15)]">
          {filtered.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => add(s)}
              className="flex w-full items-center rounded-lg px-3 py-1.5 text-sm text-ink/75 transition-colors hover:bg-black/[0.04] hover:text-[#014aaf]"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function BeritaForm({ initial }: { initial?: AdminNews }) {
  const router = useRouter();
  const { saveNews, newsCategories } = useAdmin();
  const confirm = useConfirm();
  const editing = Boolean(initial);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [author, setAuthor] = useState(initial?.author ?? "Redaksi");
  const [caption, setCaption] = useState(initial?.caption ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  // "" = Tanpa Kategori. An id whose category was deleted behaves the same way:
  // no option matches, so the select falls back to showing the placeholder.
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(
    initial?.coverImageUrl ?? "",
  );
  const [coverName, setCoverName] = useState("");
  const [dateISO, setDateISO] = useState(initial?.publishedAt || todayISO());
  const [published, setPublished] = useState(initial?.published ?? false);
  const [errors, setErrors] = useState<BeritaErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [saving, setSaving] = useState(false);

  // After the first submit attempt, keep errors in sync as fields are fixed.
  const revalidate = (patch: Partial<Parameters<typeof validateBerita>[0]>) => {
    if (!attempted) return;
    setErrors(
      validateBerita({ title, content, dateISO, coverImageUrl, ...patch }),
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    const nextErrors = validateBerita({ title, content, dateISO, coverImageUrl });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Lengkapi dulu bagian yang wajib diisi.");
      return;
    }
    const ok = await confirm({
      title: published ? "Publikasikan berita?" : "Simpan sebagai draft?",
      description: published
        ? "Berita akan tampil di halaman publik."
        : "Berita akan disimpan sebagai draft dan tidak tampil di publik.",
      confirmText: published ? "Publikasikan" : "Simpan Draft",
      variant: "primary",
    });
    if (!ok) return;
    // New articles get a short id suffix so duplicate titles never collide;
    // edits keep the existing slug so the published URL stays stable.
    const baseSlug = (slug || slugify(title)).trim();
    const item: AdminNews = {
      id: initial?.id ?? `n_${Date.now()}`,
      title: title.trim(),
      slug: editing ? baseSlug : `${baseSlug}-${shortId()}`,
      content: content.trim(),
      author: author.trim() || "Redaksi",
      caption: caption.trim(),
      tags,
      categoryId,
      coverImageUrl: coverImageUrl.trim(),
      dateLabel: formatDateId(dateISO || todayISO()),
      publishedAt: dateISO || todayISO(),
      published,
    };
    try {
      setSaving(true);
      // Articles saved before uploads were downscaled still carry an oversized
      // cover data URL, which the Server Action's body limit would reject.
      await saveNews({
        ...item,
        coverImageUrl: await shrinkStoredDataUrl(item.coverImageUrl, COVER_MAX_EDGE),
      });
      toast.success(published ? "Berita dipublikasikan" : "Disimpan sebagai draft");
      router.push("/admin/berita");
    } catch (err) {
      setSaving(false);
      toast.error(
        err instanceof Error && err.message
          ? err.message
          : "Gagal menyimpan berita. Coba lagi.",
      );
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href="/admin/berita"
        className="glass-rim glass-btn inline-flex h-10 items-center gap-1 rounded-[86px] pl-1.5 pr-4 text-sm font-semibold text-[#014aaf] transition-transform hover:scale-[1.03] sm:h-[46px] sm:pl-2 sm:pr-6 sm:text-[18px]"
      >
        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.25} /> Kembali
      </Link>
      <h1 className="mt-4 text-[clamp(2rem,3.2vw,2.75rem)] font-extrabold leading-[1.1] text-[#00224f]">
        {editing ? "Sunting Berita" : "Tambah Berita"}
      </h1>

      <form onSubmit={submit} noValidate className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main */}
        <div className="flex flex-col gap-5 glass-rim glass-card rounded-[18px] p-6">
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Judul</label>
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!editing) setSlug(slugify(e.target.value));
                revalidate({ title: e.target.value });
              }}
              aria-invalid={Boolean(errors.title)}
              className={errors.title ? fieldErr : field}
              placeholder="Judul berita"
            />
            <FieldError message={errors.title} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Penulis</label>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className={field}
              placeholder="Redaksi"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Kategori</label>
            <GlassSelect
              value={categoryId}
              onChange={setCategoryId}
              placeholder="Tanpa Kategori"
              triggerClassName={field}
              options={[
                { value: "", label: "Tanpa Kategori" },
                ...[...newsCategories]
                  .sort(
                    (a, b) =>
                      a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
                  )
                  .map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
            <p className="text-xs text-ink/45">
              Menentukan tab tempat berita ini tampil di halaman publik. Tanpa
              kategori tetap tampil di tab Semua Berita.{" "}
              <Link
                href="/admin/berita/kategori"
                className="font-medium text-[#014aaf] hover:underline"
              >
                Kelola kategori
              </Link>
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Tags</label>
            <TagInput value={tags} onChange={setTags} suggestions={NEWS_TAGS} />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <label className={labelCls}>Isi Konten</label>
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                revalidate({ content: e.target.value });
              }}
              aria-invalid={Boolean(errors.content)}
              className={cn(errors.content ? fieldErr : field, "min-h-[220px] flex-1 resize-y leading-relaxed")}
              placeholder="Tulis isi artikel di sini…"
            />
            <FieldError message={errors.content} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-5">
          <div className="glass-rim glass-card rounded-[18px] p-5">
            <p className="mb-3 text-sm font-semibold text-[#00224f]">Publikasi</p>
            <label className="flex cursor-pointer items-center justify-between">
              <span className="text-sm text-ink/70">Terpublikasi</span>
              <button
                type="button"
                onClick={() => setPublished((v) => !v)}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  published ? "bg-[#014aaf]" : "bg-black/15",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                    published ? "left-0.5 translate-x-5" : "left-0.5",
                  )}
                />
              </button>
            </label>
            <div className="mt-4 flex flex-col gap-1.5">
              <label className={labelCls}>Tanggal</label>
              <input
                type="date"
                value={dateISO}
                onChange={(e) => {
                  setDateISO(e.target.value || todayISO());
                  revalidate({ dateISO: e.target.value || todayISO() });
                }}
                aria-invalid={Boolean(errors.dateISO)}
                className={errors.dateISO ? fieldErr : field}
              />
              <FieldError message={errors.dateISO} />
              <p className="text-xs text-ink/45">
                Ditampilkan sebagai: {formatDateId(dateISO)}
              </p>
            </div>
          </div>

          <div className="glass-rim glass-card rounded-[18px] p-5">
            <p className="mb-3 text-sm font-semibold text-[#00224f]">Gambar Sampul</p>
            <div
              className={cn(
                "relative mb-3 grid aspect-[16/9] w-full place-items-center overflow-hidden rounded-xl bg-black/5",
                errors.coverImageUrl && "ring-2 ring-[#dc2626]",
              )}
            >
              {coverImageUrl ? (
                <Image
                  src={coverImageUrl}
                  alt=""
                  fill
                  sizes="300px"
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <span className="text-xs text-ink/40">Belum ada gambar</span>
              )}
            </div>
            <label className="glass-rim glass-btn flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-semibold text-[#014aaf] shadow-none">
              <Upload className="h-4 w-4" /> Unggah Gambar
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
                    toast.error("Gambar harus JPG, PNG, atau WebP.");
                    e.target.value = "";
                    return;
                  }
                  if (file.size > MAX_IMAGE_SIZE) {
                    toast.error(`Ukuran gambar maksimal ${formatMB(MAX_IMAGE_SIZE)}.`);
                    e.target.value = "";
                    return;
                  }
                  e.target.value = ""; // let the same file be re-picked after an error
                  try {
                    const url = await downscaleImage(file, COVER_MAX_EDGE);
                    setCoverName(file.name);
                    setCoverImageUrl(url);
                    revalidate({ coverImageUrl: url });
                  } catch {
                    toast.error("Gagal memproses gambar. Coba file lain.");
                  }
                }}
              />
            </label>
            <p className="mt-2 text-xs text-ink/45">
              JPG/PNG/WebP, maksimal {formatMB(MAX_IMAGE_SIZE)}.
            </p>
            {coverName && (
              <p className="mt-1 truncate text-xs text-ink/50">{coverName}</p>
            )}
            <FieldError message={errors.coverImageUrl} />

            <div className="mt-4 flex flex-col gap-1.5 border-t border-black/5 pt-4">
              <label className={labelCls}>Keterangan Gambar (opsional)</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={2}
                className={cn(field, "resize-y")}
                placeholder="Keterangan di bawah gambar sampul artikel"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 items-center justify-center gap-2 glass-rim rounded-xl bg-gradient-to-r from-[#00357d] to-[#0060e3] text-sm font-semibold text-[#f5f5f5] shadow-[0px_4px_13.8px_rgba(0,0,0,0.12)] transition-transform hover:scale-[1.03] disabled:opacity-70 disabled:hover:scale-100"
          >
            {saving ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Menyimpan…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />{" "}
                {published ? "Publikasikan Berita" : "Simpan Berita sebagai Draft"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
