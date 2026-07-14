"use client";

import Link from "next/link";
import { Newspaper, Briefcase, FileText, CheckCircle2, ArrowRight } from "lucide-react";
import { useAdmin } from "../_store";

export default function AdminDashboard() {
  const { news, applications, jobs, loading } = useAdmin();
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
      <h1 className="text-[clamp(2rem,3.2vw,2.75rem)] font-extrabold leading-[1.1] text-[#00224f]">Dashboard</h1>
      <p className="mt-1 text-sm text-ink/60">Ringkasan konten &amp; lamaran.</p>

      {/* Stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="glass-rim glass-card rounded-[22px] p-5">
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
        <section className="glass-rim glass-card rounded-[22px] p-5">
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
        <section className="glass-rim glass-card rounded-[22px] p-5">
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
                  <span className="shrink-0 text-xs text-ink/50">{a.createdAt}</span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
