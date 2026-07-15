import Image from "next/image";
import type { Metadata } from "next";
import { SectionHero } from "@/components/sections/section-hero";
import { Reveal } from "@/components/motion/reveal";
import { GovernanceTabs } from "./governance-tabs";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description:
    "Sejarah, visi, misi, dan tata kelola Yayasan Tarumanagara sejak 1959.",
};

const heading = "text-header font-extrabold";

// Figma 376:989 (left) / 376:988 (middle, raised + shadow) / 376:987 (right)
const sejarahPhotos = [
  "/images/sejarah-1.jpg",
  "/images/sejarah-2.jpg",
  "/images/sejarah-3.jpg",
];

export default function TentangKamiPage() {
  return (
    <>
      <SectionHero
        image="/images/about-hero.jpg"
        line1="Dari Warisan Nilai"
        line2="Menciptakan Dampak"
        // Match the Figma crop + tone (node 364:4357): bottom-anchored, and a
        // darker, higher-contrast B&W than the bright source photo.
        imageClassName="object-cover object-[center_55%] grayscale brightness-[0.68] contrast-[1.3]"
      />

      {/* Kilas Sejarah */}
      <section className="bg-surface py-20 sm:py-28">
        <div className="site-container">
          <Reveal>
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-[40px]">
              <h2 className={`${heading} text-[#dadada] md:w-[470px] md:shrink-0`}>
                Kilas <span className="text-[#262626]">Sejarah</span> Tarumanagara
              </h2>
              <p className="pt-2 text-body font-medium text-[#262626] md:max-w-[560px]">
                Yayasan Tarumanagara didirikan pada 18 Juni 1959 dengan semangat
                memajukan pendidikan dan kesehatan di Indonesia. Terinspirasi dari
                kejayaan Kerajaan Tarumanagara, yayasan ini memulai perjalanannya
                melalui pendirian Universitas Tarumanagara dan terus berkembang
                menjadi ekosistem pendidikan, kesehatan, serta inovasi yang
                memberikan dampak positif bagi masyarakat luas.
              </p>
            </div>
          </Reveal>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:mt-[112px] sm:grid-cols-3">
            {sejarahPhotos.map((src, i) => (
              <Reveal key={src} delay={i * 0.1}>
                <div
                  className={`relative aspect-[379/396] w-full overflow-hidden rounded-[34px] ${
                    i === 1
                      ? "shadow-[46px_36px_59px_rgba(0,0,0,0.25)] sm:-translate-y-10"
                      : ""
                  }`}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="379px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Visi — dark band */}
      <section className="relative overflow-hidden py-24">
        <Image
          src="/images/visi-bg.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover grayscale"
        />
        <div className="absolute inset-0 bg-black/25" />
        {/* Content inset deeper than the global margin, matching the Misi row. */}
        <div className="relative z-10 site-container">
          <div className="mx-auto flex max-w-[900px] flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <h2 className={`${heading} text-[#f5f5f5] md:shrink-0 md:whitespace-nowrap`}>
            Visi
            <br />
            <span className="text-[#dadada]">Masa Depan</span>
          </h2>
          {/* Subtitle aligns with the 2nd heading line ("Masa Depan", Figma
              376:978 y=1776) — offset down by exactly one heading line-height.
              Width trimmed so the heading stays two lines in the inset column. */}
          <p className="max-w-[440px] text-body font-medium text-[#f5f5f5] md:mt-[clamp(2.5rem,6vw,80px)]">
            Menjadi lembaga yang berkontribusi signifikan bagi masyarakat melalui
            penyelenggaraan pendidikan dan kesehatan yang berkualitas, inklusif,
            dan berkelanjutan.
          </p>
          </div>
        </div>
      </section>

      {/* Misi */}
      <section className="bg-surface py-20 sm:py-28">
        {/* Figma 376:979 — inset deeper than the global margin (x=204 vs ~122):
            image (422) · 109px gap · text (501). The middle `fr` column is the
            gap, so image/gap/text keep their Figma proportions as they scale. */}
        <div className="site-container">
          <div className="mx-auto grid max-w-[900px] items-stretch gap-10 md:grid-cols-[422fr_109fr_501fr] md:gap-0">
            <Reveal className="h-full">
              {/* Stretches to the full height of the text column (Misi → end of
                  the list) on desktop; keeps its aspect ratio when stacked. */}
              <div className="relative aspect-[422/490] w-full overflow-hidden rounded-[20px] md:aspect-auto md:h-full">
                <Image
                  src="/images/misi.jpg"
                  alt=""
                  fill
                  sizes="422px"
                  className="object-cover"
                />
              </div>
            </Reveal>
            <Reveal delay={0.1} className="md:col-start-3">
            <div>
              <h2 className={`${heading} text-[#262626]`}>
                Misi
                <br />
                <span className="text-[#dadada]">Perubahan</span>
              </h2>
              <ol className="mt-8 list-decimal space-y-5 pl-6 text-body font-medium text-[#262626]">
                <li>
                  Menyelenggarakan pendidikan yang berkualitas &amp; terjangkau
                  bagi masyarakat luas.
                </li>
                <li>
                  Menyelenggarakan layanan kesehatan yang berkualitas &amp;
                  berorientasi pada kemaslahatan masyarakat.
                </li>
                <li>
                  Mengembangkan sumber daya manusia yang berintegritas,
                  profesional &amp; berjiwa entrepreneurship.
                </li>
                <li>
                  Memberikan kontribusi nyata bagi kesejahteraan masyarakat
                  melalui inovasi, kolaborasi &amp; pengembangan berkelanjutan.
                </li>
              </ol>
            </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Tata Kelola Organisasi — Figma 376:990 white panel + 376:992 carousel,
          styled like the homepage "Berita Terbaru" section. */}
      <section className="overflow-x-clip bg-surface pb-24">
        <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-[46px]">
          <div className="relative pb-10 pt-10 sm:pb-14 sm:pt-14">
            <div className="pointer-events-none absolute inset-0 rounded-[27px] bg-white shadow-[0px_4px_45px_rgba(0,0,0,0.06)]" />
            <GovernanceTabs />
          </div>
        </div>
      </section>
    </>
  );
}
