import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHero } from "@/components/sections/section-hero";
import { Reveal } from "@/components/motion/reveal";
import { getOpenJobs, type JobListing } from "@/lib/data/jobs";

export const metadata: Metadata = {
  title: "Karir",
  description:
    "Bangun karier bersama Yayasan Tarumanagara. Temukan peluang di lingkungan yang menjunjung integritas, kolaborasi, dan inovasi.",
};

// Cached long; admin writes invalidate this route instantly (revalidatePath).
export const revalidate = 3600;

function JobCard({ job }: { job: JobListing }) {
  return (
    <article
      className="group glass-rim relative transform-gpu rounded-[29px] px-[31px] py-[25px] shadow-[0px_4px_4.1px_rgba(0,0,0,0.07)] backdrop-blur-sm transition-transform duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform hover:-translate-y-2"
      style={{
        backgroundImage:
          "linear-gradient(157.31deg, rgba(237,245,255,0.46) 11.19%, rgba(255,255,255,0) 99.23%)",
      }}
    >
      {/* Elevated shadow as its own OPACITY layer — box-shadow can't be GPU
          animated, so fading a static-shadow layer keeps the lift smooth. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[29px] opacity-0 shadow-[0px_18px_40px_rgba(0,0,0,0.28)] transition-opacity duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100"
      />
      {/* Hover sheen — brightens the glass slightly on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[29px] opacity-0 transition-opacity duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100"
        style={{
          backgroundImage:
            "linear-gradient(157.31deg, rgba(237,245,255,0.28) 11.19%, rgba(255,255,255,0) 99.23%)",
        }}
      />
      <Link
        href="/karir/kirim-cv"
        aria-label={`Lamar ${job.title}`}
        className="glass-rim absolute right-[31px] top-[31px] z-10 grid h-9 w-9 place-items-center rounded-[78px] bg-gradient-to-r from-[rgba(0,53,125,0.61)] to-[rgba(0,96,227,0.61)] shadow-[0px_4px_4.1px_rgba(0,0,0,0.07)] backdrop-blur-sm transition-transform duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105 group-hover:scale-110"
      >
        <ArrowUpRight className="h-5 w-5 text-[#f5f5f5]" />
      </Link>
      <div className="relative z-[1] pr-12">
        <h3 className="text-title-1 font-extrabold text-[#f5f5f5]">
          {job.title}
        </h3>
        <p className="mt-3 text-body font-semibold text-[#f5f5f5]">
          {job.type}
          {job.location ? (
            <>&nbsp;&nbsp;|&nbsp;&nbsp;{job.location}</>
          ) : null}
        </p>
        <hr className="my-4 border-white/20" />
        <p className="text-body font-medium text-[#f5f5f5]">
          {job.desc}
        </p>
      </div>
    </article>
  );
}

export default async function KarirPage() {
  const jobs = await getOpenJobs();
  // Two staggered columns (Figma 222:580) — split by even/odd index so the
  // layout stays balanced for any number of listings.
  const leftJobs = jobs.filter((_, i) => i % 2 === 0);
  const rightJobs = jobs.filter((_, i) => i % 2 === 1);

  return (
    <div className="bg-[#000c1d]">
      {/* Hero band — Figma 222:166 / 222:290 (same staggered title as Tentang Kami) */}
      <SectionHero
        image="/images/karir-hero.jpg"
        line1="Berkembang Bersama,"
        line2="Berdampak Lebih Luas"
        imageClassName="object-cover object-bottom grayscale scale-[1.25] -translate-x-[6%]"
        overlayClassName="bg-black/45"
      />

      {/* Jobs */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        {/* Decorative radial glows (Figma 222:755 / 255:11 top-right, 222:757
            left-centre) — #14478C fading to transparent at the circle edge. */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-[50%] -top-[520px] h-[1126px] w-[1126px] rounded-full"
          style={{ background: "radial-gradient(circle closest-side, #14478C, rgba(20,71,140,0))" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-[55%] -top-[323px] h-[1133px] w-[1133px] rounded-full"
          style={{ background: "radial-gradient(circle closest-side, #14478C, rgba(20,71,140,0))" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-[440px] top-[520px] h-[1133px] w-[1133px] rounded-full"
          style={{ background: "radial-gradient(circle closest-side, #14478C, rgba(20,71,140,0))" }}
        />

        <div className="relative site-container">
          {/* pb here rather than bumping the mt-14 on each of the three listing
              variants below; padding doesn't collapse, so it just adds to it. */}
          <Reveal className="pb-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <h2 className="text-header font-extrabold text-[#dadada] md:shrink-0 md:whitespace-nowrap">
                Bangun <span className="text-[#f5f5f5]">Karier</span>
                <br />
                Bersama Tarumanagara
              </h2>
              <p className="pt-2 text-body font-medium text-[#f5f5f5] md:max-w-[280px]">
                Temukan peluang untuk bertumbuh secara profesional dalam
                lingkungan yang menjunjung integritas, kolaborasi, dan inovasi.
              </p>
            </div>
          </Reveal>

          {jobs.length === 0 ? (
            <Reveal>
              <p className="mt-14 text-body font-medium text-[#f5f5f5]/70">
                Belum ada lowongan yang dibuka saat ini. Silakan cek kembali
                nanti.
              </p>
            </Reveal>
          ) : (
            <>
              {/* Mobile: a single column that keeps the listing's original order
                  (the even/odd split below would scramble the sequence here). */}
              <div className="mt-14 flex flex-col gap-10 md:hidden">
                {jobs.map((job, i) => (
                  <Reveal key={job.id} delay={i * 0.05}>
                    <JobCard job={job} />
                  </Reveal>
                ))}
              </div>
              {/* Desktop: two staggered columns (Figma 222:580) */}
              <div className="mt-14 hidden gap-16 md:flex md:items-start">
                <div className="flex flex-1 flex-col gap-10">
                  {leftJobs.map((job, i) => (
                    <Reveal key={job.id} delay={i * 0.05}>
                      <JobCard job={job} />
                    </Reveal>
                  ))}
                </div>
                {/* Right column offset down so its cards sit between the left ones */}
                <div className="flex flex-1 flex-col gap-10 md:mt-[88px]">
                  {rightJobs.map((job, i) => (
                    <Reveal key={job.id} delay={i * 0.05}>
                      <JobCard job={job} />
                    </Reveal>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
