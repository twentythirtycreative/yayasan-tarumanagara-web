import Image from "next/image";
import Link from "next/link";
import { Hero } from "@/components/sections/hero";
import { Reveal } from "@/components/motion/reveal";
import { NewsCarousel } from "@/components/news-carousel";
import { UnitSelector } from "@/components/sections/unit-selector";
import { SambutanCard } from "@/components/sections/sambutan-card";
import { getPublishedNews } from "@/lib/data/news";
import { siteConfig } from "@/lib/site";
import type { Metadata } from "next";

// The root layout already describes the homepage — its default title, the site
// description and the shared OG card are all written for this page. Only the
// canonical URL has to be declared here, now that it is no longer set globally.
export const metadata: Metadata = { alternates: { canonical: "/" } };

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
        {/* Soft blue-grey glow band behind the welcome card. top-[-80px] pulls it
            above this section, so it would otherwise wash the bottom of the hero
            photo — the Hero carries z-10 to paint over the overhang. */}
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
                  {/* Figma 1:944 places this 788x1028 portrait at exactly
                      103.74% x 135.33% of the circle, offset -4.36% / -1.23% —
                      i.e. a hair wider than cover and pulled up so the crop sits
                      near the top of the frame. Those four numbers are copied
                      straight from Figma rather than approximated with
                      object-position, so the framing is 1:1 at every breakpoint
                      (they're percentages of the circle, which is 240/320/440).
                      No `fill` here: fill sets width/height inline and would
                      fight these classes.
                      Figma's own width (103.74%) minus that -4.36% offset only
                      reaches 99.38%, leaving a ~3px white sliver at the circle's
                      right edge, so the box is scaled up to 105% — enough to
                      clear 100% after the offset. Height tracks it at the photo's
                      own 788/1028 ratio (105 x 1028/788 = 136.97%) so object-cover
                      has nothing to crop and nothing is squashed. */}
                  <Image
                    src="/images/chairman-ariawan.jpg"
                    alt="Prof. Dr. Ariawan Gunadi, S.H., M.H. — Ketua Yayasan Tarumanagara"
                    width={788}
                    height={1028}
                    sizes="(min-width: 1024px) 457px, (min-width: 640px) 332px, 249px"
                    className="absolute left-[-4.36%] top-[-1.23%] h-[136.97%] w-[105%] max-w-none object-cover"
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

      {/* Unit di Dalam Ekosistem Kami */}
      <section className="bg-surface pt-8 pb-16 sm:pt-10 sm:pb-20">
        <div className="site-container">
          <div className="mb-14 h-px w-full bg-[#d9d9d9] sm:mb-20" />
          <Reveal>
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <h2 className={sectionTitle}>
                Unit di Dalam
                <br />
                Ekosistem Kami
              </h2>
              <p className="max-w-[560px] text-body font-medium text-[#262626]">
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
