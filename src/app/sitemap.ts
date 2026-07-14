import type { MetadataRoute } from "next";
import { siteConfig, units } from "@/lib/site";
import { getPublishedNews } from "@/lib/data/news";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/tentang-kami`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/karir`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/karir/kirim-cv`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/berita`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
  ];

  const unitRoutes: MetadataRoute.Sitemap = units.map((u) => ({
    url: `${base}/unit/${u.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  let newsRoutes: MetadataRoute.Sitemap = [];
  try {
    const news = await getPublishedNews();
    newsRoutes = news.map((n) => ({
      url: `${base}/berita/${n.slug}`,
      lastModified: n.publishedAt ? new Date(n.publishedAt) : now,
      changeFrequency: "monthly",
      priority: 0.7,
    }));
  } catch {
    // DB unavailable at build — ship the static + unit routes.
  }

  return [...staticRoutes, ...unitRoutes, ...newsRoutes];
}
