"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Newspaper,
  Briefcase,
  FileText,
  LogOut,
  Home,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminStoreProvider } from "../_store";
import { ConfirmProvider } from "./confirm";
import { logout } from "../auth-actions";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/berita", label: "Berita & Kegiatan", icon: Newspaper },
  { href: "/admin/lowongan", label: "Lowongan Kerja", icon: Briefcase },
  { href: "/admin/lamaran", label: "Lamaran (CV)", icon: FileText },
];

export default function PanelLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="mx-4 flex items-center justify-between gap-2 border-b border-white/15 px-1 pb-7 pt-7">
        <Link href="/" className="relative block aspect-[1834/383] w-[148px] shrink-0">
          <Image
            src="/images/logo-white-trim.png"
            alt="Yayasan Tarumanagara"
            fill
            sizes="148px"
            className="object-contain object-left"
          />
        </Link>
        <span className="shrink-0 rounded-md bg-white/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/80">
          Admin
        </span>
      </div>

      <nav className="mt-3 flex flex-1 flex-col gap-1 px-3">
        {nav.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-white/18 font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
                  : "font-medium text-white/70 hover:bg-white/10 hover:text-white",
              )}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2 p-3">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="glass-rim flex flex-1 items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm font-semibold text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white"
        >
          <Home className="h-[18px] w-[18px]" />
          Beranda
        </Link>
        <button
          type="button"
          onClick={() => logout()}
          aria-label="Keluar"
          title="Keluar"
          className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl bg-white/15 text-white transition-colors hover:bg-white/25"
        >
          <LogOut className="h-[18px] w-[18px]" />
        </button>
      </div>
    </div>
  );

  return (
    <AdminStoreProvider>
      <ConfirmProvider>
      <div className="relative min-h-screen overflow-x-clip bg-white">
        {/* Background accent image (same as the Berita & Kegiatan hero), covering
            ~top half and fading to transparent — pure accent, glows stay visible */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[55vh] [mask-image:linear-gradient(to_bottom,black_0%,black_35%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_35%,transparent_100%)]"
        >
          <Image
            src="/images/about-hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-top opacity-[0.22]"
            style={{
              filter:
                "grayscale(1) sepia(1) hue-rotate(185deg) saturate(1.9) brightness(0.95)",
            }}
          />
        </div>

        {/* Decorative radial circles (same treatment as the Karir page, tuned
            lighter for the white admin background) */}
        <div
          aria-hidden
          className="pointer-events-none fixed left-[38%] -top-[360px] z-0 h-[900px] w-[900px] rounded-full"
          style={{ background: "radial-gradient(circle closest-side, rgba(1,93,219,0.12), rgba(1,93,219,0))" }}
        />
        <div
          aria-hidden
          className="pointer-events-none fixed -right-[300px] top-[8%] z-0 h-[820px] w-[820px] rounded-full"
          style={{ background: "radial-gradient(circle closest-side, rgba(0,53,125,0.12), rgba(0,53,125,0))" }}
        />
        <div
          aria-hidden
          className="pointer-events-none fixed -left-[280px] -bottom-[320px] z-0 h-[900px] w-[900px] rounded-full"
          style={{ background: "radial-gradient(circle closest-side, rgba(1,93,219,0.10), rgba(1,93,219,0))" }}
        />

        {/* Sidebar — desktop (floating glass panel, detached from edges) */}
        <aside className="glass-rim fixed left-9 top-9 bottom-9 z-40 hidden w-[272px] flex-col rounded-[26px] bg-[linear-gradient(160deg,rgba(1,74,175,0.9)_0%,rgba(0,77,182,0.72)_100%)] shadow-[0px_18px_50px_rgba(1,74,175,0.28)] backdrop-blur-[10px] lg:flex">
          {SidebarContent}
        </aside>

        {/* Mobile top bar */}
        <div className="glass-rim glass-card sticky top-0 z-30 flex items-center justify-between px-4 py-3 lg:hidden">
          <span className="font-extrabold text-[#00224f]">Admin Tarumanagara</span>
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="glass-rim glass-btn grid h-9 w-9 place-items-center rounded-lg text-[#00224f]"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile drawer */}
        {open && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={() => setOpen(false)}
            />
            <aside className="glass-rim fixed left-3 top-3 bottom-3 z-50 w-[250px] rounded-[24px] bg-[linear-gradient(160deg,rgba(1,74,175,0.95)_0%,rgba(0,77,182,0.86)_100%)] shadow-[0px_18px_50px_rgba(1,74,175,0.35)] backdrop-blur-[12px] lg:hidden">
              {SidebarContent}
            </aside>
          </>
        )}

        <main className="relative z-10 px-5 py-6 sm:px-8 sm:py-8 lg:ml-[320px] lg:py-10 lg:pr-10">{children}</main>
      </div>
      </ConfirmProvider>
    </AdminStoreProvider>
  );
}
