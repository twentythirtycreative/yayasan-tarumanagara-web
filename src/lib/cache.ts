/**
 * Data Cache tags. Reads are wrapped in `unstable_cache` tagged with these,
 * and write actions call `revalidateTag(...)` so the DB is only hit on a cold
 * cache or after an actual change — not on every request/mount.
 */
export const CACHE_TAGS = {
  news: "news",
  jobs: "jobs",
  applications: "applications",
} as const;
