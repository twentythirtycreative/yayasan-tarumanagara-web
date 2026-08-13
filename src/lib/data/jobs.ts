import "server-only";
import { desc, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db, schema } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/cache";

export type JobListing = {
  id: string;
  title: string;
  desc: string;
  type: string;
  location: string;
};

/**
 * Open job listings for the public Karir page, newest first.
 * Cached in the Data Cache (tag "jobs"); invalidated when admin edits lowongan.
 */
export const getOpenJobs = unstable_cache(
  async (): Promise<JobListing[]> => {
    const rows = await db
      .select()
      .from(schema.jobs)
      .where(eq(schema.jobs.isOpen, true))
      .orderBy(desc(schema.jobs.createdAt));
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      desc: r.description,
      type: r.type,
      location: r.location ?? "",
    }));
  },
  ["open-jobs"],
  { tags: [CACHE_TAGS.jobs], revalidate: false },
);
