"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, Save, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useAdmin,
  GOVERNANCE_ROLES,
  type AdminGovernanceMember,
  type GovernanceRole,
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
  PORTRAIT_MAX_EDGE,
  downscaleImage,
  shrinkStoredDataUrl,
} from "@/lib/image-downscale";

const field =
  "w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-[#014aaf] focus:ring-2 focus:ring-[#014aaf]/20";
const fieldErr =
  "w-full rounded-xl border border-[#dc2626] bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-[#dc2626] focus:ring-2 focus:ring-[#dc2626]/20";
const labelCls = "text-sm font-medium text-ink/80";

type Errors = { name?: string; position?: string; photoUrl?: string };

function validate(v: {
  name: string;
  position: string;
  photoUrl: string;
}): Errors {
  const errors: Errors = {};
  if (!v.name.trim()) errors.name = "Nama wajib diisi.";
  else if (v.name.trim().length < 3) errors.name = "Nama minimal 3 karakter.";
  if (!v.position.trim()) errors.position = "Jabatan wajib diisi.";
  if (!v.photoUrl.trim()) errors.photoUrl = "Foto wajib diunggah.";
  return errors;
}

export function TataKelolaForm({
  initial,
  /** Preselected tab when adding, taken from the list's active tab. */
  defaultRole = "Pembina",
}: {
  initial?: AdminGovernanceMember;
  defaultRole?: GovernanceRole;
}) {
  const router = useRouter();
  const { saveGovernanceMember, governance } = useAdmin();
  const confirm = useConfirm();
  const editing = Boolean(initial);

  const [role, setRole] = useState<GovernanceRole>(initial?.role ?? defaultRole);
  const [name, setName] = useState(initial?.name ?? "");
  const [position, setPosition] = useState(initial?.position ?? "");
  const [photoUrl, setPhotoUrl] = useState(initial?.photoUrl ?? "");
  const [photoY, setPhotoY] = useState(() => readPos(initial?.photoPosition, 1));
  const [published, setPublished] = useState(initial?.published ?? true);
  const [errors, setErrors] = useState<Errors>({});
  const [attempted, setAttempted] = useState(false);
  const [saving, setSaving] = useState(false);

  const revalidate = (patch: Partial<{ name: string; position: string; photoUrl: string }>) => {
    if (!attempted) return;
    setErrors(validate({ name, position, photoUrl, ...patch }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    const nextErrors = validate({ name, position, photoUrl });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Lengkapi dulu bagian yang wajib diisi.");
      return;
    }
    const item: AdminGovernanceMember = {
      id: initial?.id ?? `g_${Date.now()}`,
      role,
      name: name.trim(),
      position: position.trim(),
      photoUrl: photoUrl.trim(),
      // Horizontal is always centred: a portrait upload is narrower than the
      // card is tall, so object-cover leaves no sideways slack to shift into.
      photoPosition: `50% ${photoY}%`,
      // New members go to the end of their tab; moving them is the list's job.
      // Changing role on an existing member also sends them to the end of the
      // new tab, since its old index means nothing there.
      sortOrder:
        initial && initial.role === role
          ? initial.sortOrder
          : governance.filter((m) => m.role === role).length,
      published,
    };
    const ok = await confirm({
      title: editing ? "Simpan perubahan?" : `Tambah ${role}?`,
      description: editing
        ? `Perubahan pada data ${role} ini akan disimpan.`
        : `Akan ditambahkan ke tab ${role} di halaman Tentang Kami.`,
      confirmText: editing ? "Simpan Perubahan" : "Simpan",
      variant: "primary",
      onConfirm: async () => {
        try {
          setSaving(true);
          // Members saved before uploads were downscaled still carry an
          // oversized data URL, which the form would send back verbatim and the
          // Server Action would reject. Re-encode it on the way out.
          await saveGovernanceMember({
            ...item,
            photoUrl: await shrinkStoredDataUrl(item.photoUrl, PORTRAIT_MAX_EDGE),
          });
        } catch (error) {
          setSaving(false);
          toast.error(
            error instanceof Error ? error.message : "Gagal menyimpan. Coba lagi.",
          );
          throw error;
        }
      },
    });
    if (!ok) return;
    toast.success(editing ? "Perubahan disimpan" : `${role} ditambahkan`);
    router.push("/admin/tata-kelola");
  };

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href="/admin/tata-kelola"
        className="glass-rim glass-btn inline-flex h-10 items-center gap-1 rounded-[86px] pl-1.5 pr-4 text-sm font-semibold text-[#014aaf] transition-transform hover:scale-[1.03] sm:h-[46px] sm:pl-2 sm:pr-6 sm:text-[18px]"
      >
        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.25} /> Kembali
      </Link>
      <h1 className="mt-4 text-[clamp(2rem,3.2vw,2.75rem)] font-extrabold leading-[1.1] text-[#00224f]">
        {/* Follows the Kategori field, so switching it retitles the page too. */}
        {editing ? `Sunting ${role}` : `Tambah ${role}`}
      </h1>

      <form
        onSubmit={submit}
        noValidate
        className="glass-rim glass-card mt-6 grid gap-5 rounded-[18px] p-6 lg:grid-cols-[300px_1fr]"
      >
        {/* Photo + crop */}
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Foto</label>
          <div
            className={cn(
              "relative aspect-[296/378] w-full overflow-hidden rounded-[16px] border border-black/10 bg-black/[0.03]",
              errors.photoUrl && "ring-2 ring-[#dc2626]",
            )}
          >
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt=""
                fill
                sizes="300px"
                unoptimized
                style={{ objectPosition: `50% ${photoY}%` }}
                className="object-cover"
              />
            ) : (
              <div className="grid h-full place-items-center text-sm text-ink/40">
                Belum ada foto
              </div>
            )}
          </div>
          <p className="text-xs text-ink/50">
            Pratinjau memakai pemotongan yang sama dengan kartu di halaman
            publik.
          </p>
          <label className="glass-rim glass-btn mt-1 inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-semibold text-[#014aaf]">
            <Upload className="h-4 w-4" />
            {photoUrl ? "Ganti Foto" : "Unggah Foto"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
                  toast.error("Foto harus JPG, PNG, atau WebP.");
                  e.target.value = "";
                  return;
                }
                if (file.size > MAX_IMAGE_SIZE) {
                  toast.error(`Ukuran foto maksimal ${formatMB(MAX_IMAGE_SIZE)}.`);
                  e.target.value = "";
                  return;
                }
                e.target.value = ""; // let the same file be re-picked after an error
                try {
                  const url = await downscaleImage(file, PORTRAIT_MAX_EDGE);
                  setPhotoUrl(url);
                  revalidate({ photoUrl: url });
                } catch {
                  toast.error("Gagal memproses foto. Coba file lain.");
                }
              }}
            />
          </label>
          <p className="text-xs text-ink/50">
            JPG/PNG/WebP, maksimal {formatMB(MAX_IMAGE_SIZE)}.
          </p>
          <FieldError message={errors.photoUrl} />

          {/* Only the vertical axis has slack to crop into — see photoPosition
              in submit() — so a horizontal slider would be a dead control. */}
          <div className="mt-2 flex flex-col gap-1">
            <label className="text-xs text-ink/60">Geser tegak: {photoY}%</label>
            <input
              type="range"
              min={0}
              max={100}
              value={photoY}
              onChange={(e) => setPhotoY(Number(e.target.value))}
              className="accent-[#014aaf]"
            />
          </div>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Nama</label>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                revalidate({ name: e.target.value });
              }}
              aria-invalid={Boolean(errors.name)}
              className={errors.name ? fieldErr : field}
              placeholder="mis. Dr. Ir. Steven Darmawan, S.T., M.T"
            />
            <FieldError message={errors.name} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Jabatan</label>
            <input
              value={position}
              onChange={(e) => {
                setPosition(e.target.value);
                revalidate({ position: e.target.value });
              }}
              aria-invalid={Boolean(errors.position)}
              className={errors.position ? fieldErr : field}
              placeholder="mis. Kepala Lembaga Pembelajaran dan Inovasi Akademik"
            />
            <FieldError message={errors.position} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Kategori</label>
            <GlassSelect
              value={role}
              onChange={(v) => setRole(v as GovernanceRole)}
              triggerClassName={field}
              options={GOVERNANCE_ROLES.map((r) => ({ value: r, label: r }))}
            />
            <p className="text-xs text-ink/50">
              Menentukan tab tempat orang ini muncul di Tata Kelola Organisasi.
            </p>
          </div>

          <label className="flex cursor-pointer items-center justify-between border-t border-black/5 pt-4">
            <span className="text-sm text-ink/70">Tampilkan di halaman publik</span>
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

          <button
            type="submit"
            disabled={saving}
            className="glass-rim inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00357d] to-[#0060e3] text-sm font-semibold text-[#f5f5f5] shadow-[0px_4px_13.8px_rgba(0,0,0,0.12)] transition-transform hover:scale-[1.03] disabled:opacity-70 disabled:hover:scale-100"
          >
            {saving ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Menyimpan…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> {editing ? "Simpan Perubahan" : "Simpan"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/** Pull one axis out of a stored "50% 14%", falling back to centre. */
function readPos(value: string | undefined, axis: 0 | 1): number {
  const part = (value ?? "50% 50%").split(/\s+/)[axis];
  const n = Number.parseFloat(part ?? "");
  return Number.isFinite(n) ? Math.min(100, Math.max(0, Math.round(n))) : 50;
}
