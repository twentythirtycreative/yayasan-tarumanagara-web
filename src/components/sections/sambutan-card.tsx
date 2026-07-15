"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

// Figma 347:835 (collapsed) → 263:1701 (expanded). Clicking the button expands
// the welcome card in place with a smooth height animation instead of navigating.
export function SambutanCard() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`glass-rim relative z-10 w-full max-w-[660px] rounded-[34px] bg-gradient-to-b from-[rgba(250,250,250,0.85)] from-[29.808%] to-[rgba(255,255,255,0.15)] px-8 pt-6 pb-[64px] shadow-[36px_37px_60.1px_rgba(0,0,0,0.16)] backdrop-blur-[10px] transition-[transform,margin] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-[38px] sm:pt-[30px] sm:pb-[64px] ${
        open
          ? "-mb-[152px] -translate-y-[140px] sm:-mb-[200px] sm:-translate-y-[185px] lg:-mb-[240px] lg:-translate-y-[220px]"
          : "-translate-y-12"
      }`}
    >
      <p className="text-body font-medium text-[#262626]">
        Sebagai Ketua Yayasan Tarumanagara
        <br className="hidden sm:block" /> periode 2022-2027 saya ucapkan,
      </p>
      <h2 className="mt-5 max-w-[624px] text-title-1 font-bold text-[#262626]">
        Selamat datang kepada Bapak/Ibu
        <br className="hidden sm:block" /> di Yayasan Tarumanagara.
      </h2>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="more"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-6 space-y-4 text-body font-medium text-[#262626]">
              <p>
                Sebagaimana kita ketahui, Yayasan Tarumanagara adalah yayasan
                yang bergerak di bidang pendidikan dan kesehatan. Berdiri sejak
                tahun 1959 dan bisa saya katakan adalah yayasan terbesar di
                Indonesia. Melihat visi dan misi Yayasan Tarumanagara untuk
                menyelenggarakan pendidikan dan kesehatan yang berkualitas dengan
                biaya terjangkau, kami sebagai yayasan berharap bisa menjangkau
                semua lapisan tanpa membedakan ras, suku, agama, budaya, atau
                latar belakang, karena kami ingin Yayasan Tarumanagara memiliki
                kontribusi besar dalam masyarakat, khususnya di Indonesia.
              </p>
              <p>
                Kami sebagai pengurus Yayasan Tarumanagara akan mencoba melakukan
                yang terbaik, go the extra miles dan memastikan hasil pekerjaan
                kami bukan hanya terkirim (sent), tapi harus bisa tersampaikan
                (delivered). Kami akan melakukan upaya sebaik-baiknya, dengan
                keberanian walaupun melakukan perubahan sampai dengan resiko
                terburuk.
              </p>
              <p>
                Kami akan melakukan hal-hal yang bersifat inovasi. Kami juga
                mengharapkan dukungan dari semua pihak, baik stakeholders,
                masyarakat pada umumnya, internal dan eksternal untuk terus
                mendukung eksistensi dari Yayasan Tarumanagara yang selalu berdiri
                tegak dan memiliki kontribusi yang signifikan bagi masyarakat.
                Terima kasih, salam sejahtera bagi kita semua.
              </p>
              <p className="font-bold">Prof. Dr. Ariawan Gunadi, S.H., M.H.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button hangs half-out of the card's bottom edge; toggles expand/collapse */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="glass-rim absolute bottom-0 left-8 inline-flex h-[46px] translate-y-1/2 cursor-pointer items-center gap-2 rounded-[97px] bg-[rgba(245,245,245,0.9)] px-6 text-body font-bold text-[#015ddb] shadow-[0px_4px_13.5px_rgba(0,0,0,0.09)] backdrop-blur-sm transition-transform hover:scale-[1.03] sm:left-[38px]"
      >
        {open ? "Tutup Selengkapnya" : "Lihat Selengkapnya"}
      </button>
    </div>
  );
}
