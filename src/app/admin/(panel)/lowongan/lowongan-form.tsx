"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdmin, type AdminJob } from "../../_store";
import { useConfirm } from "../confirm";
import { FieldError } from "@/components/form-error";
import { GlassSelect } from "@/components/glass-select";

const field =
  "w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-[#014aaf] focus:ring-2 focus:ring-[#014aaf]/20";
const fieldErr =
  "w-full rounded-xl border border-[#dc2626] bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-[#dc2626] focus:ring-2 focus:ring-[#dc2626]/20";
const labelCls = "text-sm font-medium text-ink/80";

type LowonganErrors = { title?: string; desc?: string };

function validateLowongan(v: { title: string; desc: string }): LowonganErrors {
  const errors: LowonganErrors = {};
  if (!v.title.trim()) errors.title = "Judul posisi wajib diisi.";
  else if (v.title.trim().length < 3)
    errors.title = "Judul posisi minimal 3 karakter.";
  if (!v.desc.trim()) errors.desc = "Deskripsi wajib diisi.";
  else if (v.desc.trim().length < 10)
    errors.desc = "Deskripsi terlalu pendek (minimal 10 karakter).";
  return errors;
}

export function LowonganForm({ initial }: { initial?: AdminJob }) {
  const router = useRouter();
  const { saveJob } = useAdmin();
  const confirm = useConfirm();
  const editing = Boolean(initial);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [desc, setDesc] = useState(initial?.desc ?? "");
  const [type, setType] = useState(initial?.type ?? "Full-Time");
  const [location, setLocation] = useState(initial?.location ?? "Work From Office");
  const [isOpen, setIsOpen] = useState(initial?.isOpen ?? true);
  const [errors, setErrors] = useState<LowonganErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [saving, setSaving] = useState(false);

  const revalidate = (patch: Partial<{ title: string; desc: string }>) => {
    if (!attempted) return;
    setErrors(validateLowongan({ title, desc, ...patch }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    const nextErrors = validateLowongan({ title, desc });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Lengkapi dulu bagian yang wajib diisi.");
      return;
    }
    const ok = await confirm({
      title: editing ? "Simpan perubahan?" : "Tambah lowongan?",
      description: editing
        ? "Perubahan pada lowongan ini akan disimpan."
        : "Lowongan baru akan ditambahkan ke daftar.",
      confirmText: editing ? "Simpan" : "Tambah",
      variant: "primary",
    });
    if (!ok) return;
    const item: AdminJob = {
      id: initial?.id ?? `j_${Date.now()}`,
      title: title.trim(),
      desc: desc.trim(),
      type: type.trim(),
      location: location.trim(),
      isOpen,
    };
    try {
      setSaving(true);
      await saveJob(item);
      toast.success(editing ? "Perubahan disimpan" : "Lowongan ditambahkan");
      router.push("/admin/lowongan");
    } catch {
      setSaving(false);
      toast.error("Gagal menyimpan lowongan. Coba lagi.");
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href="/admin/lowongan"
        className="glass-rim glass-btn inline-flex h-10 items-center gap-1 rounded-[86px] pl-1.5 pr-4 text-sm font-semibold text-[#014aaf] transition-transform hover:scale-[1.03] sm:h-[46px] sm:pl-2 sm:pr-6 sm:text-[18px]"
      >
        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.25} /> Kembali
      </Link>
      <h1 className="mt-4 text-[clamp(2rem,3.2vw,2.75rem)] font-extrabold leading-[1.1] text-[#00224f]">
        {editing ? "Sunting Lowongan" : "Tambah Lowongan"}
      </h1>

      <form
        onSubmit={submit}
        noValidate
        className="glass-rim glass-card mt-6 flex flex-col gap-5 rounded-[18px] p-6"
      >
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Judul Posisi</label>
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              revalidate({ title: e.target.value });
            }}
            aria-invalid={Boolean(errors.title)}
            className={errors.title ? fieldErr : field}
            placeholder="mis. Human Resources Generalist Manager"
          />
          <FieldError message={errors.title} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Tipe</label>
            <GlassSelect
              value={type}
              onChange={setType}
              triggerClassName={field}
              options={[
                { value: "Full-Time", label: "Full-Time" },
                { value: "Part-Time", label: "Part-Time" },
                { value: "Kontrak", label: "Kontrak" },
                { value: "Magang", label: "Magang" },
              ]}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Lokasi Kerja</label>
            <GlassSelect
              value={location}
              onChange={setLocation}
              triggerClassName={field}
              options={[
                { value: "Work From Office", label: "Work From Office" },
                { value: "Work From Home", label: "Work From Home" },
                { value: "Hybrid", label: "Hybrid" },
              ]}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Deskripsi</label>
          <textarea
            value={desc}
            onChange={(e) => {
              setDesc(e.target.value);
              revalidate({ desc: e.target.value });
            }}
            rows={5}
            data-lenis-prevent
            aria-invalid={Boolean(errors.desc)}
            className={cn(errors.desc ? fieldErr : field, "resize-y leading-relaxed")}
            placeholder="Deskripsi singkat tanggung jawab posisi…"
          />
          <FieldError message={errors.desc} />
        </div>

        <label className="flex cursor-pointer items-center justify-between border-t border-black/5 pt-4">
          <span className="text-sm text-ink/70">Lowongan dibuka</span>
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className={cn(
              "relative h-6 w-11 rounded-full transition-colors",
              isOpen ? "bg-[#014aaf]" : "bg-black/15",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                isOpen ? "left-0.5 translate-x-5" : "left-0.5",
              )}
            />
          </button>
        </label>

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
              <Save className="h-4 w-4" /> {editing ? "Simpan Perubahan" : "Simpan Lowongan"}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
