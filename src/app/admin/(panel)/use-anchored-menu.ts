"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";

/** Jarak menu ke tombol pemicunya. */
const GAP = 6;
/** Jarak minimum menu ke tepi layar. */
const EDGE = 8;

/**
 * Dropdown yang menempel pada tombolnya, dengan penempatan sadar-tepi-layar.
 *
 * Menu ini `position: fixed` dan menutup saat halaman di-scroll — jadi kalau ia
 * muncul melewati bawah layar, isinya benar-benar tidak bisa diraih: di-scroll
 * malah tertutup. Itu yang terjadi pada baris terakhir sebuah daftar.
 *
 * Karena itu posisinya dihitung SETELAH menu masuk DOM, bukan saat tombol
 * diklik: tinggi menu berbeda-beda (jumlah item tidak selalu sama), dan
 * menebaknya persis itulah yang bikin ia jatuh ke luar layar. Urutannya:
 * pasang menu dalam keadaan tak terlihat → ukur tinggi aslinya → taruh di bawah
 * tombol kalau muat, balik ke atas kalau tidak, dan kalau dua-duanya tidak muat
 * (layar sangat pendek) dijepit supaya tetap utuh di dalam layar.
 *
 * Pengukurannya lewat callback ref, bukan useLayoutEffect: ref dipanggil pada
 * fase commit begitu node ada, sehingga posisi sudah final sebelum frame
 * dilukis, dan `style` tetap dikendalikan React — penting karena induknya bisa
 * re-render selagi menu terbuka (mis. state `downloading` di halaman Lamaran),
 * yang akan menimpa gaya kalau disetel manual ke DOM.
 *
 * `dismissable` untuk menahan penutupan selagi ada proses berjalan (mis. unduh
 * CV) supaya menu tidak hilang di tengah jalan.
 */
export function useAnchoredMenu({ dismissable = true }: { dismissable?: boolean } = {}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const menuRef = useCallback((node: HTMLDivElement | null) => {
    // Menu tertutup → elemennya dilepas; buang posisi lama supaya pembukaan
    // berikutnya mengukur ulang, bukan memakai angka baris sebelumnya.
    if (!node) {
      setPos(null);
      return;
    }
    const anchor = anchorRef.current?.getBoundingClientRect();
    if (!anchor) return;
    const menu = node.getBoundingClientRect();

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Rata kanan dengan tombol, lalu jepit supaya tidak keluar kiri/kanan.
    const left = Math.max(EDGE, Math.min(anchor.right - menu.width, vw - menu.width - EDGE));

    let top = anchor.bottom + GAP;
    if (top + menu.height > vh - EDGE) {
      const above = anchor.top - menu.height - GAP;
      top = above >= EDGE ? above : Math.max(EDGE, vh - menu.height - EDGE);
    }

    setPos({ top, left });
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = () => {
      if (dismissable) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    // Capture: menu fixed tidak ikut bergerak bersama container yang di-scroll.
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, dismissable]);

  /**
   * Sebelum terukur, menu tetap dirender (supaya bisa diukur) tapi disembunyikan
   * — tanpa ini ia sempat berkedip di pojok kiri atas.
   */
  const menuStyle: CSSProperties = {
    top: pos?.top ?? 0,
    left: pos?.left ?? 0,
    visibility: pos ? "visible" : "hidden",
  };

  return {
    open,
    setOpen,
    toggle: () => setOpen((v) => !v),
    anchorRef,
    menuRef,
    menuStyle,
  };
}
