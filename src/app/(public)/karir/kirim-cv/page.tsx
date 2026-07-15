import type { Metadata } from "next";
import Image from "next/image";
import { SectionHero } from "@/components/sections/section-hero";
import { Reveal } from "@/components/motion/reveal";
import { CvForm } from "./cv-form";

export const metadata: Metadata = { title: "Kirim CV" };

export default function KirimCvPage() {
  return (
    <>
      {/* Hero — Figma 222:792 (job-interview photo, B&W) / 222:919 title */}
      <SectionHero
        image="/images/cv-hero.jpg"
        line1="Tunjukan Potensi Anda"
        line2="Raih Peluang Baru"
        line2Indent="3.33em"
      />

      {/* Apply form — Figma 222:975: tall image (left) + glass form panel that
          overlaps its right edge, with the heading above (222:974). */}
      <section className="bg-surface py-16 sm:py-24">
        <div className="site-container">
          <div className="lg:grid lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)] lg:items-start lg:gap-14">
            {/* Left: tall teamwork photo (Figma 222:970) */}
            <Reveal>
              <div className="relative aspect-[601/724] w-full overflow-hidden rounded-[34px] shadow-[0px_4px_45px_rgba(0,0,0,0.08)]">
                <Image
                  src="/images/cv-team.jpg"
                  alt="Tim Yayasan Tarumanagara berkolaborasi"
                  fill
                  sizes="(min-width:1024px) 460px, 100vw"
                  className="object-cover"
                />
              </div>
            </Reveal>

            {/* Right column shifts left so the form panel overlaps the image's
                lower-right corner, while the heading is padded back to keep its
                gap and sit a touch lower than the image (Figma). */}
            <Reveal delay={0.1} className="relative z-10 mt-10 lg:-ml-44 lg:mt-8">
              <div className="lg:pl-44">
                <h2 className="text-header font-extrabold text-[#262626]">
                  Apply
                  <br />
                  <span className="text-[#dadada]">Sekarang</span>
                </h2>
                <p className="mt-5 max-w-[517px] text-body font-medium text-[#262626]">
                  Kami selalu terbuka untuk talenta terbaik yang ingin bertumbuh
                  dan memberikan dampak bersama kami. Kirimkan CV Anda dan mari
                  membangun masa depan yang lebih baik bersama.
                </p>
              </div>

              <div
                className="glass-rim mt-8 rounded-[34px] p-7 shadow-[0px_4px_4.1px_rgba(0,0,0,0.07)] backdrop-blur-md sm:p-11"
                style={{
                  backgroundImage:
                    "linear-gradient(134.84deg, rgba(237,245,255,0.46) 58.52%, rgba(255,255,255,0) 99.23%)",
                }}
              >
                <CvForm />
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
