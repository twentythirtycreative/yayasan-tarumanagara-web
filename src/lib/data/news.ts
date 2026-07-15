import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db, schema } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/cache";
import { formatDateId } from "@/lib/format-date";
import type { NewsCardData } from "@/components/news-card";

export type NewsItem = NewsCardData & {
  dateLabel: string;
  content: string;
  author: string;
  publishedAt: string;
  /** Photo caption shown under the article cover image. */
  caption?: string;
};

type Row = typeof schema.news.$inferSelect;

const toNewsItem = (r: Row): NewsItem => {
  // Jakarta dateline, press-release style: "Jakarta, 13 Agustus 2025". The
  // detail page keeps the full string for the article lead and strips the
  // "Jakarta, " prefix for the plain meta date (see berita/[slug]/page.tsx).
  const date = formatDateId(r.publishedAt, r.dateLabel);
  return {
    slug: r.slug,
    title: r.title,
    coverImageUrl: r.coverImageUrl,
    tags: r.tags ?? [],
    dateLabel: date ? `Jakarta, ${date}` : date,
    content: r.content,
    author: r.author,
    publishedAt: r.publishedAt ?? "",
    caption: r.caption ?? undefined,
  };
};

/**
 * Published news, newest first (same ordering as the admin list).
 * Cached in the Data Cache (tag "news"); invalidated when admin writes berita.
 */
export const getPublishedNews = unstable_cache(
  async (limit?: number): Promise<NewsItem[]> => {
    const base = db
      .select()
      .from(schema.news)
      .where(eq(schema.news.published, true))
      .orderBy(desc(schema.news.createdAt));
    const rows = typeof limit === "number" ? await base.limit(limit) : await base;
    return rows.map(toNewsItem);
  },
  ["published-news"],
  { tags: [CACHE_TAGS.news], revalidate: 3600 },
);

/** A single published article by slug (drafts return null for the public). */
export const getNewsBySlug = unstable_cache(
  async (slug: string): Promise<NewsItem | null> => {
    const [row] = await db
      .select()
      .from(schema.news)
      .where(and(eq(schema.news.slug, slug), eq(schema.news.published, true)))
      .limit(1);
    return row ? toNewsItem(row) : null;
  },
  ["news-by-slug"],
  { tags: [CACHE_TAGS.news], revalidate: 3600 },
);
