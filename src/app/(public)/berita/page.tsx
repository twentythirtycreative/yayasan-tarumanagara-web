import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CoverImage } from "@/components/cover-image";
import { snippet } from "@/components/news-card";
import { NewsTabs } from "./news-tabs";
import { NewsGrid } from "./news-grid";
import { getPublishedNews } from "@/lib/data/news";

export const metadata: Metadata = {
  title: "Berita & Kegiatan",
  description:
    "Ikuti berbagai informasi terbaru, kegiatan, kolaborasi, dan pencapaian Yayasan Tarumanagara.",
};

// Held until an admin write invalidates the "news" tag — see lib/cache.ts.
export const revalidate = false;

export default async function BeritaPage() {
  const news = await getPublishedNews();
  const featured = news[0];

  return (
    <>
      {/* Hero with featured article inside a rounded dark panel */}
      <section className="relative overflow-hidden bg-surface">
        {/* Figma 298:1125 — Tarumanagara building photo + 35% dark overlay */}
        <Image
          src="/images/berita-hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-bottom grayscale"
        />
        <div className="absolute inset-0 bg-black/35" />

        <div className="relative z-10 site-container-wide pt-[130px]">
          <div className="glass-rim rounded-t-[40px] bg-[rgba(46,46,46,0.55)] px-6 pt-12 pb-20 shadow-[0px_4px_45px_rgba(0,0,0,0.4)] backdrop-blur-[7px] sm:rounded-t-[77px] sm:px-14 sm:pb-36">
            <h1 className="text-header font-extrabold text-[#f5f5f5]">
              Berita Terbaru
            </h1>
            <p className="mt-5 max-w-[720px] text-body font-medium text-[#f5f5f5]">
              Ikuti berbagai informasi terbaru, kegiatan, kolaborasi, dan
              pencapaian Yayasan Tarumanagara dalam memberikan kontribusi bagi
              pendidikan dan masyarakat.
            </p>

            {featured && (
              <div className="mt-10 grid overflow-hidden rounded-[22px] md:grid-cols-[minmax(0,432px)_1fr] md:rounded-[36px]">
                <div className="relative aspect-[432/351] w-full md:aspect-auto">
                  <CoverImage
                    src={featured.coverImageUrl ?? "/images/news-mou.jpg"}
                    alt={featured.title}
                    sizes="432px"
                    preload
                  />
                </div>
                <div
                  // The rim (`glass-rim::before`) inherits this element's radius,
                  // so the outer corners must be repeated here — otherwise the
                  // wrapper's overflow-hidden clips a square rim into the arc and
                  // the white edge vanishes at those corners. Stacked on mobile
                  // (bottom two corners), side-by-side from md (right two).
                  className="glass-rim flex flex-col justify-center gap-6 rounded-bl-[22px] rounded-br-[22px] px-8 py-6 backdrop-blur-md sm:px-12 sm:py-9 md:rounded-bl-none md:rounded-tr-[36px] md:rounded-br-[36px]"
                  style={{
                    backgroundImage:
                      "linear-gradient(110.83deg, rgba(39,79,133,0.6) 9.25%, rgba(9,18,31,0.6) 52.8%)",
                  }}
                >
                  <h2 className="text-title-1 font-extrabold text-[#f5f5f5]">
                    <Link href={`/berita/${featured.slug}`} className="hover:underline">
                      {featured.title}
                    </Link>
                  </h2>
                  <p className="line-clamp-3 max-w-[589px] text-caption font-medium text-[#f5f5f5]">
                    <span className="font-bold">{featured.dateLabel} </span>
                    – {snippet(featured.content, 240)}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-meta font-bold text-[#f5f5f5]">
                      {featured.tags.join("   |   ")}
                    </p>
                    <Link
                      href={`/berita/${featured.slug}`}
                      className="glass-rim inline-flex h-[42px] w-[190px] shrink-0 items-center justify-center rounded-[31px] bg-[rgba(250,250,250,0.16)] text-caption font-medium text-[#f5f5f5] shadow-[0px_4px_13.8px_rgba(0,0,0,0.07)] backdrop-blur-sm transition-colors hover:bg-white/25"
                    >
                      Baca Selengkapnya
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tab bar (Figma 298:1190) — clickable tabs. Pulled up so the glass box
          above tucks slightly UNDER the blue bar. */}
      <div className="relative z-20 -mt-6">
        <NewsTabs />
      </div>

      {/* News grid */}
      <section className="bg-surface py-16 sm:py-20">
        <div className="site-container">
          {news.length === 0 ? (
            <p className="py-10 text-center text-body font-medium text-ink/50">
              Belum ada berita yang dipublikasikan. Silakan cek kembali nanti.
            </p>
          ) : (
            <NewsGrid items={news} />
          )}
        </div>
      </section>
    </>
  );
}
