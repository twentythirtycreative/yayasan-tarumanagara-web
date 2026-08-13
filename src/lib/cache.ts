/**
 * Data Cache tags. Reads are wrapped in `unstable_cache` tagged with these,
 * and write actions call `updateTag(...)` so the DB is only hit on a cold
 * cache or after an actual change — not on every request/mount.
 *
 * These tags do double duty. Next records the tags collected during a render
 * onto the route's prerender entry too (`x-next-cache-tags` in
 * `.next/server/app/*.meta`), so `updateTag("news")` drops the cached *pages*
 * that read news as well as the cached query — no `revalidatePath` needed.
 *
 * That is why nothing here carries a `revalidate` duration. Every cache is held
 * until a write invalidates it. Time-based revalidation would only re-render
 * byte-identical pages on a timer, and each of those regenerations is a billed
 * ISR write on Vercel (~8 per route, one per prefetch segment).
 */
export const CACHE_TAGS = {
  news: "news",
  jobs: "jobs",
  applications: "applications",
  governance: "governance",
} as const;
