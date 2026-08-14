import Image from "next/image";
import type { Metadata } from "next";
import { SectionHero } from "@/components/sections/section-hero";
import { Reveal } from "@/components/motion/reveal";
import { GovernanceTabs } from "./governance-tabs";
import { getGovernanceMembers } from "@/lib/data/governance";
import { SejarahBand } from "./sejarah-band";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description:
    "Sejarah, visi, misi, dan tata kelola Yayasan Tarumanagara sejak 1959.",
};

const heading = "text-header font-extrabold";

export default async function TentangKamiPage() {
  const governance = await getGovernanceMembers();

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

      {/* Sejarah — photo band with the two expandable story cards */}
      <SejarahBand />

      {/* Visi — dark band. Figma 376:975 has it at 1440x359; trimmed a little
          under that by preference. Height is pinned rather than left to grow out
          of the padding, with the content centred inside; py stays as a floor in
          case the copy wraps to more lines. */}
      <section className="relative flex items-center overflow-hidden py-16 md:min-h-[320px] md:py-10">
        {/* Figma 40:3565 swapped the stock office block for the Untar tower —
            the same source we already ship as hero-untar.jpg — and pushed it
            much darker. Registering the export (1440x359) against the treated
            photo puts the crop at scale 1.40625 with a 400px top offset, i.e.
            object-position 400/596 = 67%, not flush bottom. Figma exports the
            photo already treated, then lays a flat 25% black over it. Fitting
            that asset against our source (least squares, CSS luma weights)
            gives out = 0.290*g + 8.15, i.e. brightness(0.31) then
            contrast(0.94); the simulated mean lands at 38.9 against the
            export's 38.8. */}
        <Image
          src="/images/hero-untar.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[center_67%] grayscale brightness-[0.31] contrast-[0.94]"
        />
        <div className="absolute inset-0 bg-black/25" />
        {/* Content inset deeper than the global margin, matching the Misi row. */}
        <div className="relative z-10 w-full site-container">
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
            {/* Figma 1:1949 */}
            Menjadi Yayasan terkemuka dalam peran serta mencerdaskan dan
            menyejahterakan bangsa berlandaskan budi luhur; mandiri; ilmu dan
            keahlian; serta etika profesi.
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
                {/* Figma 1:1954 — three points, replacing the previous four.
                    Figma spells the last value "Enterpreunership"; corrected to
                    Entrepreneurship, which is how it reads on the beranda hero
                    and in the Sejarah Tarumanagara card. */}
                <li>
                  Memfasilitasi aspirasi masyarakat dari semua lapisan dalam
                  bidang pendidikan dan kesehatan yang berkualitas, berbiaya
                  terjangkau, dan inovatif.
                </li>
                <li>
                  Membangun &ldquo;Kebangsaan dan Keunggulan&rdquo; bersama
                  pemangku kepentingan yang bersinergi, dengan nilai-nilai
                  Integritas; Profesional; dan Entrepreneurship.
                </li>
                <li>
                  Memberdayakan sumber daya internal secara berkesinambungan
                  dalam mencerdaskan dan menyejahterakan bangsa.
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
            <GovernanceTabs people={governance} />
          </div>
        </div>
      </section>
    </>
  );
}
