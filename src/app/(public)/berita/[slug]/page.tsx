import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, ChevronLeft, User } from "lucide-react";
import { NewsTabs } from "../news-tabs";
import { ShareButton } from "./share-button";
import { snippet } from "@/components/news-card";
import { getNewsBySlug, getPublishedNews } from "@/lib/data/news";
import { siteConfig } from "@/lib/site";

export const revalidate = 3600;

export async function generateStaticParams() {
  const news = await getPublishedNews();
  return news.map((n) => ({ slug: n.slug }));
}

// Cover images stored as data URLs can't be crawled → fall back to the site OG.
const ogFor = (cover: string | null) =>
  cover && cover.startsWith("/") ? cover : siteConfig.ogImage;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  if (!item) return { title: "Berita" };

  const description = snippet(item.content, 160);
  const url = `${siteConfig.url}/berita/${item.slug}`;
  const image = ogFor(item.coverImageUrl);

  return {
    title: item.title,
    description,
    alternates: { canonical: `/berita/${item.slug}` },
    openGraph: {
      type: "article",
      url,
      title: item.title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: item.title }],
      publishedTime: item.publishedAt || undefined,
      authors: [item.author],
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description,
      images: [image],
    },
  };
}

export default async function BeritaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  if (!item) notFound();

  // Same date the news card shows (dateLabel), without the "Jakarta, " prefix.
  const dateLabel = item.dateLabel.split(/,\s*/).pop() ?? item.dateLabel;

  // The dateline is prepended automatically (bold) from dateLabel — the stored
  // content no longer includes "Jakarta, … –" (Figma 298:1300).
  const leadDate = item.dateLabel ? `${item.dateLabel} – ` : "";
  const bodyRest = item.content;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: item.title,
    description: snippet(item.content, 160),
    image: [`${siteConfig.url}${ogFor(item.coverImageUrl)}`],
    datePublished: item.publishedAt || undefined,
    dateModified: item.publishedAt || undefined,
    author: { "@type": "Organization", name: item.author },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: { "@type": "ImageObject", url: `${siteConfig.url}/images/logo-white-trim.png` },
    },
    mainEntityOfPage: `${siteConfig.url}/berita/${item.slug}`,
    articleSection: item.tags,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      {/* Hero band — same image as the Berita & Kegiatan page + tab bar */}
      <section className="relative overflow-hidden bg-surface">
        <div className="relative h-[170px] w-full sm:h-[210px]">
          <Image
            src="/images/berita-hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-top grayscale"
          />
          <div className="absolute inset-0 bg-black/45" />
        </div>
        <NewsTabs />
      </section>

      {/* Article content — sits directly on the background (no card) */}
      <section className="bg-surface pt-10 pb-24 sm:pt-14">
        <div className="site-container">
          <div className="mx-auto max-w-[840px]">
            <Link
              href="/berita"
              className="inline-flex h-[46px] items-center gap-1 rounded-[86px] pr-6 pl-2 text-[18px] font-semibold text-[#0060e3] shadow-[0px_4px_13.8px_rgba(0,0,0,0.07)] transition-transform hover:scale-[1.03]"
            >
              <ChevronLeft className="h-6 w-6" strokeWidth={2.25} />
              Kembali
            </Link>

            <h1 className="mt-8 text-center text-[clamp(1.9rem,4.4vw,49px)] font-extrabold leading-[1.1] text-[#262626]">
              {item.title}
            </h1>

            {item.coverImageUrl && (
              <div className="relative mt-10 aspect-[863/447] w-full overflow-hidden">
                <Image
                  src={item.coverImageUrl}
                  alt={item.title}
                  fill
                  sizes="840px"
                  className="object-cover"
                />
              </div>
            )}

            {/* Below-image content is inset deeper than the image (Figma: body
                x=397 vs image x=288). */}
            <div className="mx-auto max-w-[660px]">
              {/* Caption (Figma 298:1302) — italic 15px */}
              {item.caption && (
                <p className="mt-6 text-[15px] italic leading-[1.5] text-black/70">
                  {item.caption}
                </p>
              )}

              <hr className="my-8 border-[#e5e5e5]" />

            {/* Body (Figma 298:1300) — leading date is bold */}
            <div className="whitespace-pre-line text-body leading-[1.8] text-[#262626]">
              {leadDate && <span className="font-bold">{leadDate}</span>}
              {bodyRest}
            </div>

            {/* Meta (Figma 298:1307) + Bagikan (298:1471) — spaced like a paragraph */}
            <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-[17px] font-extrabold text-black">
                <span className="inline-flex items-center gap-2">
                  <User className="h-[18px] w-[18px] text-[#262626]" strokeWidth={2.2} />
                  {item.author}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-[18px] w-[18px] text-[#262626]" strokeWidth={2.2} />
                  {dateLabel}
                </span>
              </div>
              <ShareButton title={item.title} />
            </div>

            <hr className="mt-16 mb-8 border-[#e5e5e5]" />

            {/* Tentang Tarumanagara (Figma 298:1406 / 298:1301) */}
            <h2 className="text-headline font-extrabold text-[#262626]">
              Tentang Tarumanagara
            </h2>
            <p className="mt-4 text-[16px] font-medium leading-[23px] text-[rgba(38,38,38,0.5)]">
              Yayasan Tarumanagara didirikan pada 18 Juni 1959 dengan semangat
              memajukan pendidikan dan kesehatan di Indonesia. Terinspirasi dari
              kejayaan Kerajaan Tarumanagara, yayasan ini memulai perjalanannya
              melalui pendirian Universitas Tarumanagara dan terus berkembang
              menjadi ekosistem pendidikan, kesehatan, serta inovasi yang
              memberikan dampak positif bagi masyarakat luas.
            </p>

            {/* Kontak (Figma 298:1312) */}
            <div className="mt-10 rounded-[10px] border border-[#ececec] bg-white px-[38px] pt-6 pb-8">
              <p className="text-[17px] font-extrabold text-black">
                Hubungi Tarumanagara
              </p>
              <p className="mt-4 text-[17px] font-medium text-black">Media</p>
              <a
                href="mailto:media@tarumanagarafoundation.org"
                className="mt-1 block w-fit text-[17px] font-medium text-[#194b90] underline"
              >
                media@tarumanagarafoundation.org
              </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
