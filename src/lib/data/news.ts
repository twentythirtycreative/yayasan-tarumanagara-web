import "server-only";
import { and, asc, desc, eq, getTableColumns } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db, schema } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/cache";
import { formatDateId } from "@/lib/format-date";
import type { NewsCardData } from "@/components/news-card";

/** One tab on /berita, as the public page needs it. */
export type NewsCategoryOption = { slug: string; name: string };

export type NewsItem = NewsCardData & {
  dateLabel: string;
  content: string;
  author: string;
  publishedAt: string;
  /** Photo caption shown under the article cover image. */
  caption?: string;
  /** Which tab it belongs to; null = only "Semua Berita". */
  category: NewsCategoryOption | null;
};

// Every article read carries its category name/slug, so the grid can filter
// without a second round trip. A LEFT join, so an article with no category —
// or one still pointing at a deleted row — comes back with nulls rather than
// disappearing from the list.
const withCategory = {
  ...getTableColumns(schema.news),
  categoryName: schema.newsCategories.name,
  categorySlug: schema.newsCategories.slug,
};

type Row = typeof schema.news.$inferSelect & {
  categoryName: string | null;
  categorySlug: string | null;
};

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
    category:
      r.categorySlug && r.categoryName
        ? { slug: r.categorySlug, name: r.categoryName }
        : null,
  };
};

/**
 * The tab bar on /berita, in admin's order. "Semua Berita" is not in here — the
 * page prepends it, so the bar still works when no category exists yet.
 *
 * Shares the "news" tag rather than owning one: categories only ever render
 * alongside articles, so the pages that read them are exactly the pages an
 * article write already invalidates.
 */
export const getNewsCategories = unstable_cache(
  async (): Promise<NewsCategoryOption[]> => {
    const rows = await db
      .select({
        slug: schema.newsCategories.slug,
        name: schema.newsCategories.name,
      })
      .from(schema.newsCategories)
      .orderBy(asc(schema.newsCategories.sortOrder), asc(schema.newsCategories.name));
    return rows;
  },
  ["news-categories"],
  { tags: [CACHE_TAGS.news], revalidate: false },
);

/**
 * Published news, newest first by publication date (same ordering as the admin
 * list); createdAt breaks ties between articles sharing a date.
 * Cached in the Data Cache (tag "news"); invalidated when admin writes berita.
 */
export const getPublishedNews = unstable_cache(
  async (limit?: number): Promise<NewsItem[]> => {
    const base = db
      .select(withCategory)
      .from(schema.news)
      .leftJoin(
        schema.newsCategories,
        eq(schema.news.categoryId, schema.newsCategories.id),
      )
      .where(eq(schema.news.published, true))
      .orderBy(desc(schema.newsSortKey), desc(schema.news.createdAt));
    const rows = typeof limit === "number" ? await base.limit(limit) : await base;
    return rows.map(toNewsItem);
  },
  ["published-news"],
  { tags: [CACHE_TAGS.news], revalidate: false },
);

/** A single published article by slug (drafts return null for the public). */
export const getNewsBySlug = unstable_cache(
  async (slug: string): Promise<NewsItem | null> => {
    const [row] = await db
      .select(withCategory)
      .from(schema.news)
      .leftJoin(
        schema.newsCategories,
        eq(schema.news.categoryId, schema.newsCategories.id),
      )
      .where(and(eq(schema.news.slug, slug), eq(schema.news.published, true)))
      .limit(1);
    return row ? toNewsItem(row) : null;
  },
  ["news-by-slug"],
  { tags: [CACHE_TAGS.news], revalidate: false },
);
