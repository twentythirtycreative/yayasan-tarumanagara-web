"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdmin, type AdminJob } from "../../_store";
import { useConfirm } from "../confirm";

const field =
  "w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-[#014aaf] focus:ring-2 focus:ring-[#014aaf]/20";
const labelCls = "text-sm font-medium text-ink/80";

export function LowonganForm({ initial }: { initial?: AdminJob }) {
  const router = useRouter();
  const { saveJob } = useAdmin();
  const confirm = useConfirm();
  const editing = Boolean(initial);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [desc, setDesc] = useState(initial?.desc ?? "");
  const [type, setType] = useState(initial?.type ?? "Fulltime");
  const [location, setLocation] = useState(initial?.location ?? "Work From Office");
  const [isOpen, setIsOpen] = useState(initial?.isOpen ?? true);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      await saveJob(item);
      toast.success(editing ? "Perubahan disimpan" : "Lowongan ditambahkan");
      router.push("/admin/lowongan");
    } catch {
      toast.error("Gagal menyimpan lowongan. Coba lagi.");
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/lowongan"
        className="glass-rim glass-btn inline-flex h-[46px] items-center gap-1 rounded-[86px] pl-2 pr-6 text-[18px] font-semibold text-[#014aaf] transition-transform hover:scale-[1.03]"
      >
        <ChevronLeft className="h-6 w-6" strokeWidth={2.25} /> Kembali
      </Link>
      <h1 className="mt-4 text-[clamp(2rem,3.2vw,2.75rem)] font-extrabold leading-[1.1] text-[#00224f]">
        {editing ? "Sunting Lowongan" : "Tambah Lowongan"}
      </h1>

      <form
        onSubmit={submit}
        className="glass-rim glass-card mt-6 flex flex-col gap-5 rounded-[22px] p-6"
      >
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Judul Posisi</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={field}
            placeholder="mis. Human Resources Generalist Manager"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Tipe</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className={field}>
              <option>Fulltime</option>
              <option>Parttime</option>
              <option>Kontrak</option>
              <option>Magang</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Lokasi Kerja</label>
            <select value={location} onChange={(e) => setLocation(e.target.value)} className={field}>
              <option>Work From Office</option>
              <option>Work From Home</option>
              <option>Hybrid</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Deskripsi</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={5}
            className={cn(field, "resize-y leading-relaxed")}
            placeholder="Deskripsi singkat tanggung jawab posisi…"
          />
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
          className="inline-flex h-11 items-center justify-center gap-2 glass-rim glass-btn-primary rounded-xl text-sm font-semibold transition-transform hover:scale-[1.02]"
        >
          <Save className="h-4 w-4" /> {editing ? "Simpan Perubahan" : "Simpan Lowongan"}
        </button>
      </form>
    </div>
  );
}
