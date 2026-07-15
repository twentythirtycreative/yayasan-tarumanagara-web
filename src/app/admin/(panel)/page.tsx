"use client";

import Link from "next/link";
import { toast } from "sonner";
import {
  Newspaper,
  Briefcase,
  FileText,
  CheckCircle2,
  ArrowRight,
  Download,
} from "lucide-react";
import { useAdmin } from "../_store";
import { getApplicationCv } from "../actions";
import { parseDbTimestamp } from "@/lib/format-date";

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

const shortDate = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});
const formatShort = (iso: string) => {
  const d = parseDbTimestamp(iso);
  return Number.isNaN(d.getTime()) ? iso : shortDate.format(d);
};

const initialsFromEmail = (email: string) => {
  const name = email.split("@")[0] ?? "";
  const parts = name.split(/[.\-_]+/).filter(Boolean);
  const letters = (parts.length >= 2 ? parts[0][0] + parts[1][0] : name.slice(0, 2)) || "AD";
  return letters.toUpperCase();
};

export default function AdminDashboard() {
  const { news, applications, jobs, adminEmail, loading } = useAdmin();
  const published = news.filter((n) => n.published).length;
  const openJobs = jobs.filter((j) => j.isOpen).length;

  const stats = [
    { label: "Total Berita", value: news.length, icon: Newspaper, tint: "bg-[rgba(1,74,175,0.14)]", fg: "text-[#014aaf]" },
    { label: "Berita Publik", value: published, icon: CheckCircle2, tint: "bg-[rgba(54,146,73,0.16)]", fg: "text-[#2f7d3f]" },
    { label: "Lowongan Dibuka", value: openJobs, icon: Briefcase, tint: "bg-[rgba(185,119,10,0.16)]", fg: "text-[#b9770a]" },
    { label: "Lamaran Masuk", value: applications.length, icon: FileText, tint: "bg-[rgba(124,58,237,0.15)]", fg: "text-[#7c3aed]" },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[clamp(2rem,3.2vw,2.75rem)] font-extrabold leading-[1.1] text-[#00224f]">Dashboard</h1>
          <p className="mt-1 text-sm text-ink/60">Ringkasan konten &amp; lamaran.</p>
        </div>

        {/* Admin avatar — hidden on mobile, where the top-right slot is taken by
            the floating menu (hamburger) button instead. */}
        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          <span className="hidden text-right sm:block">
            <span className="block text-xs text-ink/50">Admin</span>
            <span className="block max-w-[200px] truncate text-sm font-semibold text-[#00224f]">
              {adminEmail || "Admin"}
            </span>
          </span>
          <span
            title={adminEmail || "Admin"}
            className="glass-rim grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/50 bg-[linear-gradient(160deg,rgba(1,74,175,0.95)_0%,rgba(0,77,182,0.82)_100%)] text-sm font-bold text-white shadow-[0px_8px_20px_rgba(1,74,175,0.28)]"
          >
            {adminEmail ? initialsFromEmail(adminEmail) : "AD"}
          </span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="glass-rim glass-card rounded-[18px] p-5">
            <div className={`glass-rim grid h-11 w-11 place-items-center rounded-xl border border-white/50 backdrop-blur-sm ${s.tint} ${s.fg}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-3xl font-extrabold text-[#00224f]">{s.value}</p>
            <p className="text-sm text-ink/60">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent berita */}
        <section className="glass-rim glass-card rounded-[18px] p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[#00224f]">Berita Terbaru</h2>
            <Link href="/admin/berita" className="inline-flex items-center gap-1 text-sm font-medium text-[#014aaf] hover:underline">
              Kelola <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-black/5">
            {loading ? (
              <li className="grid min-h-[200px] place-items-center text-center text-sm text-ink/45">Memuat…</li>
            ) : news.length === 0 ? (
              <li className="grid min-h-[200px] place-items-center text-center text-sm text-ink/45">
                Belum ada berita.
              </li>
            ) : (
              news.slice(0, 5).map((n) => (
                <li key={n.id} className="flex items-center justify-between gap-3 py-3">
                  <span className="line-clamp-1 text-sm font-medium text-ink">{n.title}</span>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      n.published ? "bg-[#e6f6ec] text-[#137a37]" : "bg-[#fdf1df] text-[#9a5b00]"
                    }`}
                  >
                    {n.published ? "Publik" : "Draf"}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* Recent lamaran */}
        <section className="glass-rim glass-card rounded-[18px] p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[#00224f]">Lamaran Terbaru</h2>
            <Link href="/admin/lamaran" className="inline-flex items-center gap-1 text-sm font-medium text-[#014aaf] hover:underline">
              Lihat <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-black/5">
            {loading ? (
              <li className="grid min-h-[200px] place-items-center text-center text-sm text-ink/45">Memuat…</li>
            ) : applications.length === 0 ? (
              <li className="grid min-h-[200px] place-items-center text-center text-sm text-ink/45">
                Belum ada lamaran masuk.
              </li>
            ) : (
              applications.slice(0, 5).map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink">{a.fullName}</span>
                    <span className="block truncate text-xs text-ink/50">{a.position}</span>
                  </span>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs text-ink/50">{formatShort(a.createdAt)}</span>
                    <button
                      type="button"
                      onClick={() => downloadCv(a.id)}
                      title="Unduh CV"
                      aria-label={`Unduh CV ${a.fullName}`}
                      className="glass-rim glass-btn inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#014aaf] transition-colors hover:text-[#00224f]"
                    >
                      <Download className="h-3.5 w-3.5" /> CV
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
