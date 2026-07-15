import Image from "next/image";
import Link from "next/link";
import { Hero } from "@/components/sections/hero";
import { Reveal } from "@/components/motion/reveal";
import { NewsCarousel } from "@/components/news-carousel";
import { UnitSelector } from "@/components/sections/unit-selector";
import { SambutanCard } from "@/components/sections/sambutan-card";
import { getPublishedNews } from "@/lib/data/news";
import { siteConfig } from "@/lib/site";

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  alternateName: siteConfig.shortName,
  url: siteConfig.url,
  logo: `${siteConfig.url}/images/logo-white-trim.png`,
  image: `${siteConfig.url}${siteConfig.ogImage}`,
  description: siteConfig.description,
  email: siteConfig.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: siteConfig.address,
    addressLocality: "Jakarta",
    addressCountry: "ID",
  },
  sameAs: [
    siteConfig.social.instagram,
    siteConfig.social.linkedin,
    siteConfig.social.youtube,
    siteConfig.social.tiktok,
  ],
};

// Section titles (Figma h1 — Plus Jakarta Sans ExtraBold 80px, tracking -2.4px)
const sectionTitle = "text-header font-extrabold text-[#262626]";

// Figma 332:929 — "Lihat Semua": h-46, rounded-31, pl-26/pr-27; text lead Bold.
const glassPill =
  "glass-rim inline-flex h-[46px] items-center justify-center rounded-[31px] bg-[rgba(250,250,250,0.16)] pl-[26px] pr-[27px] text-headline font-bold text-[#015ddb] shadow-[0px_4px_13.8px_rgba(0,0,0,0.07)] backdrop-blur-sm transition-transform hover:scale-[1.03]";

export default async function HomePage() {
  const news = await getPublishedNews(6);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
      />
      <Hero />

      {/* Sambutan / Welcome */}
      <section id="sambutan" className="relative overflow-x-clip bg-surface pt-28 pb-24 sm:pt-40 sm:pb-32 lg:pt-48 lg:pb-40">
        {/* Figma 347:828 — soft blue-grey glow band behind the welcome card */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[-80px] h-[510px] bg-gradient-to-b from-[rgba(193,198,214,0)] via-[#c1c6d6] via-[53.846%] to-[rgba(213,216,226,0)]"
        />
        <div className="site-container relative z-10">
          <Reveal>
            <div className="relative flex flex-col items-center gap-8 lg:block">
              {/* Chairman — large white circle, sits BEHIND the card (z-0) */}
              <div className="z-0 lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2">
                <div className="relative aspect-square w-[240px] overflow-hidden rounded-full bg-white sm:w-[320px] lg:w-[440px]">
                  <Image
                    src="/images/chairman.jpg"
                    alt="Ketua Yayasan Tarumanagara"
                    fill
                    sizes="440px"
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Card — Figma 347:835 (collapsed) / 263:1701 (expanded), on
                  TOP of the photo (z-10). Expands in place on click. */}
              <SambutanCard />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Lembaga & Unit Usaha */}
      <section className="bg-surface pt-8 pb-16 sm:pt-10 sm:pb-20">
        <div className="site-container">
          <div className="mb-14 h-px w-full bg-[#d9d9d9] sm:mb-20" />
          <Reveal>
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <h2 className={sectionTitle}>
                Lembaga <span className="text-[#e1e1e1]">&</span>
                <br />
                Unit Usaha
              </h2>
              <p className="max-w-[560px] text-body font-medium text-[#262626] md:pb-2">
                Membangun nilai, menciptakan peluang, dan menghadirkan manfaat
                melalui berbagai unit usaha yang bertumbuh bersama masyarakat.
              </p>
            </div>
          </Reveal>

          <UnitSelector />
        </div>
      </section>

      {/* Berita Terbaru — one big white panel holds the heading, the
          horizontally-scrollable cards, and the progress bar (Figma 342:1158). */}
      <section className="overflow-x-clip bg-surface pt-8 pb-16 sm:pt-10 sm:pb-24">
        <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-[46px]">
          {/* The white panel is only a BACKGROUND (Figma 342:1158). Cards float
              above it and are free to travel out past its edges. */}
          <div className="relative pb-10 pt-10 sm:pb-14 sm:pt-14">
            <div className="pointer-events-none absolute inset-0 rounded-[27px] bg-white shadow-[0px_4px_45px_rgba(0,0,0,0.06)]" />
            {/* Heading row — aligned to the global content margin (--content-max),
                same left edge as every other section (Figma: title at x≈122px). */}
            <Reveal className="site-container relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className={sectionTitle}>Berita Terbaru</h2>
                <p className="mt-5 max-w-[700px] text-body font-medium text-[#262626]">
                  Ikuti berbagai informasi terbaru, kegiatan, kolaborasi, dan
                  pencapaian Yayasan Tarumanagara dalam memberikan kontribusi
                  bagi pendidikan dan masyarakat.
                </p>
              </div>
              <Link href="/berita" className={`${glassPill} shrink-0`}>
                Lihat Semua
              </Link>
            </Reveal>

            {/* Featured-card carousel: bleeds past the panel, one card scaled
                up per scroll, glass info box (Figma 342:1167…). */}
            <NewsCarousel items={news} />
          </div>
        </div>
      </section>
    </>
  );
}
