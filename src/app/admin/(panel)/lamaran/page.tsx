"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Download, Trash2, Mail, Phone, MoreVertical, Search } from "lucide-react";
import { useAdmin } from "../../_store";
import { getApplicationCv } from "../../actions";
import { useConfirm } from "../confirm";

async function downloadCv(id: string) {
  try {
    const cv = await getApplicationCv(id);
    if (!cv) {
      toast.error("File CV tidak ditemukan.");
      return;
    }
    const bytes = Uint8Array.from(atob(cv.base64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: cv.type || "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = cv.name || "cv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch {
    toast.error("Gagal mengunduh CV.");
  }
}

function RowActions({
  onDownload,
  onDelete,
}: {
  onDownload: () => void;
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
      const width = 176; // w-44
      const left = Math.max(8, Math.min(r.right - width, window.innerWidth - width - 8));
      setPos({ top: r.bottom + 6, left });
    }
    setOpen((v) => !v);
  };

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
            className="fixed z-50 w-44 rounded-2xl border border-black/[0.06] bg-white p-1.5 shadow-[0px_16px_40px_rgba(0,34,79,0.18)]"
          >
            <button
              type="button"
              onClick={() => {
                onDownload();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-ink/75 transition-colors hover:bg-black/[0.04] hover:text-[#014aaf]"
            >
              <Download className="h-4 w-4 text-[#014aaf]" /> Unduh CV
            </button>
            <button
              type="button"
              onClick={() => {
                onDelete();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-[#dc2626] transition-colors hover:bg-[#fdecec]"
            >
              <Trash2 className="h-4 w-4" /> Hapus
            </button>
          </div>
        </>
      )}
    </>
  );
}

const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

const dateFmt = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const timeFmt = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
});
const formatWhen = (iso: string) => {
  const d = new Date(iso);
  return { date: dateFmt.format(d), time: `${timeFmt.format(d)} WIB` };
};

export default function AdminLamaranList() {
  const { applications, deleteApplication, loading } = useAdmin();
  const confirm = useConfirm();
  const [q, setQ] = useState("");

  const filtered = applications.filter((a) =>
    `${a.fullName} ${a.email} ${a.university} ${a.major} ${a.position}`
      .toLowerCase()
      .includes(q.trim().toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-[clamp(2rem,3.2vw,2.75rem)] font-extrabold leading-[1.1] text-[#00224f]">Lamaran (CV)</h1>
      <p className="mt-1 text-sm text-ink/60">
        Daftar pelamar yang mengirim CV melalui halaman Karir.
      </p>

      {/* Search */}
      <div className="glass-rim glass-card mt-6 flex items-center gap-2 rounded-xl px-3.5 sm:max-w-sm">
        <Search className="h-4 w-4 text-ink/40" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari pelamar…"
          className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-ink/40"
        />
      </div>

      <div className="glass-rim glass-card mt-4 overflow-hidden rounded-[24px]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-black/[0.06] text-[11px] font-semibold uppercase tracking-wider text-ink/40">
                <th className="px-6 py-4">Pelamar</th>
                <th className="px-6 py-4">Universitas / Jurusan</th>
                <th className="px-6 py-4">Posisi</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr
                  key={a.id}
                  className="group border-b border-black/[0.04] align-middle transition-colors last:border-0 hover:bg-white/70"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#00357d] to-[#004db6] text-xs font-bold text-white shadow-sm">
                        {initials(a.fullName)}
                      </div>
                      <div className="min-w-0">
                        <span className="block font-semibold text-[#00224f]">{a.fullName}</span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-ink/45">
                          <span className="inline-flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {a.email}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {a.phone}
                          </span>
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="block font-medium text-ink/80">{a.university}</span>
                    <span className="text-xs text-ink/45">{a.major}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="inline-block max-w-[180px] rounded-xl bg-[#eef4ff] px-3 py-1.5 text-center text-xs font-medium leading-snug text-[#014aaf]">
                      {a.position}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-3.5">
                    <span className="block font-medium text-ink/75">{formatWhen(a.createdAt).date}</span>
                    <span className="mt-0.5 block text-xs text-ink/45">
                      Pukul {formatWhen(a.createdAt).time}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex justify-start">
                      <RowActions
                        onDownload={() => downloadCv(a.id)}
                        onDelete={async () => {
                          const ok = await confirm({
                            title: "Hapus lamaran?",
                            description: `Lamaran dari ${a.fullName} akan dihapus permanen.`,
                            confirmText: "Hapus",
                            variant: "danger",
                          });
                          if (!ok) return;
                          await deleteApplication(a.id);
                          toast.success("Lamaran dihapus");
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
                    {applications.length === 0
                      ? "Belum ada lamaran masuk."
                      : "Pelamar tidak ditemukan."}
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
