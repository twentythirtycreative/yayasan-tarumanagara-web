"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { db, schema } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/cache";
import { formatDateId } from "@/lib/format-date";
import { requireAdmin } from "@/lib/auth/guard";
import { MAX_IMAGE_SIZE, dataUrlBytes } from "@/lib/validators/upload";
import type { AdminJob, AdminNews, Application } from "./types";

// Invalidate the Data Cache + affected public routes after a write.
// `"max"` = stale-while-revalidate (Next 16 signature).
function revalidateNews() {
  revalidateTag(CACHE_TAGS.news, "max");
  revalidatePath("/");
  revalidatePath("/berita");
  revalidatePath("/berita/[slug]", "page");
}
function revalidateJobs() {
  revalidateTag(CACHE_TAGS.jobs, "max");
  revalidatePath("/karir");
}

// ── Mappers ───────────────────────────────────────────────────────────────
type NewsRow = typeof schema.news.$inferSelect;
type JobRow = typeof schema.jobs.$inferSelect;

const toAdminNews = (r: NewsRow): AdminNews => ({
  id: r.id,
  title: r.title,
  slug: r.slug,
  content: r.content,
  author: r.author,
  caption: r.caption ?? "",
  tags: r.tags ?? [],
  coverImageUrl: r.coverImageUrl ?? "",
  dateLabel: formatDateId(r.publishedAt, r.dateLabel),
  publishedAt: r.publishedAt ?? "",
  published: r.published,
});

const toAdminJob = (r: JobRow): AdminJob => ({
  id: r.id,
  title: r.title,
  desc: r.description,
  type: r.type,
  location: r.location ?? "",
  isOpen: r.isOpen,
});

// ── Berita ────────────────────────────────────────────────────────────────
const cachedNews = unstable_cache(
  async (): Promise<AdminNews[]> => {
    const rows = await db.select().from(schema.news).orderBy(desc(schema.news.createdAt));
    return rows.map(toAdminNews);
  },
  ["admin-news"],
  { tags: [CACHE_TAGS.news], revalidate: 3600 },
);

export async function listNews(): Promise<AdminNews[]> {
  await requireAdmin();
  return cachedNews();
}

export async function saveNews(item: AdminNews): Promise<void> {
  await requireAdmin();
  // Enforce the cover-image size cap server-side (base64 data URLs).
  if (
    item.coverImageUrl.startsWith("data:") &&
    dataUrlBytes(item.coverImageUrl) > MAX_IMAGE_SIZE
  ) {
    throw new Error("Ukuran gambar sampul melebihi batas.");
  }
  const values = {
    id: item.id,
    title: item.title,
    slug: item.slug,
    content: item.content,
    author: item.author || "Redaksi",
    caption: item.caption || null,
    tags: item.tags,
    coverImageUrl: item.coverImageUrl || null,
    dateLabel: item.dateLabel,
    publishedAt: item.publishedAt || null,
    published: item.published,
  };
  await db
    .insert(schema.news)
    .values(values)
    .onConflictDoUpdate({
      target: schema.news.id,
      set: {
        title: values.title,
        slug: values.slug,
        content: values.content,
        author: values.author,
        caption: values.caption,
        tags: values.tags,
        coverImageUrl: values.coverImageUrl,
        dateLabel: values.dateLabel,
        publishedAt: values.publishedAt,
        published: values.published,
        updatedAt: new Date().toISOString(),
      },
    });
  revalidateNews();
}

export async function deleteNews(id: string): Promise<void> {
  await requireAdmin();
  await db.delete(schema.news).where(eq(schema.news.id, id));
  revalidateNews();
}

export async function togglePublish(id: string): Promise<void> {
  await requireAdmin();
  const [row] = await db
    .select({ published: schema.news.published })
    .from(schema.news)
    .where(eq(schema.news.id, id));
  if (!row) return;
  await db
    .update(schema.news)
    .set({ published: !row.published, updatedAt: new Date().toISOString() })
    .where(eq(schema.news.id, id));
  revalidateNews();
}

// ── Lowongan ──────────────────────────────────────────────────────────────
const cachedJobs = unstable_cache(
  async (): Promise<AdminJob[]> => {
    const rows = await db.select().from(schema.jobs).orderBy(desc(schema.jobs.createdAt));
    return rows.map(toAdminJob);
  },
  ["admin-jobs"],
  { tags: [CACHE_TAGS.jobs], revalidate: 3600 },
);

export async function listJobs(): Promise<AdminJob[]> {
  await requireAdmin();
  return cachedJobs();
}

export async function saveJob(item: AdminJob): Promise<void> {
  await requireAdmin();
  const values = {
    id: item.id,
    title: item.title,
    description: item.desc,
    type: item.type,
    location: item.location || null,
    isOpen: item.isOpen,
  };
  await db
    .insert(schema.jobs)
    .values(values)
    .onConflictDoUpdate({
      target: schema.jobs.id,
      set: {
        title: values.title,
        description: values.description,
        type: values.type,
        location: values.location,
        isOpen: values.isOpen,
      },
    });
  revalidateJobs();
}

export async function deleteJob(id: string): Promise<void> {
  await requireAdmin();
  await db.delete(schema.jobs).where(eq(schema.jobs.id, id));
  revalidateJobs();
}

export async function toggleJobOpen(id: string): Promise<void> {
  await requireAdmin();
  const [row] = await db
    .select({ isOpen: schema.jobs.isOpen })
    .from(schema.jobs)
    .where(eq(schema.jobs.id, id));
  if (!row) return;
  await db
    .update(schema.jobs)
    .set({ isOpen: !row.isOpen })
    .where(eq(schema.jobs.id, id));
  revalidateJobs();
}

// ── Lamaran ───────────────────────────────────────────────────────────────
// Not cached: admin-only, low traffic, and freshness matters (new CV submits
// must appear immediately).
export async function listApplications(): Promise<Application[]> {
  await requireAdmin();
  // Intentionally omit the CV blob from the list query.
  const rows = await db
    .select({
      id: schema.applications.id,
      fullName: schema.applications.fullName,
      email: schema.applications.email,
      phone: schema.applications.phone,
      university: schema.applications.university,
      major: schema.applications.major,
      position: schema.applications.position,
      cvName: schema.applications.cvName,
      createdAt: schema.applications.createdAt,
    })
    .from(schema.applications)
    .orderBy(desc(schema.applications.createdAt));
  return rows;
}

export async function deleteApplication(id: string): Promise<void> {
  await requireAdmin();
  await db.delete(schema.applications).where(eq(schema.applications.id, id));
}

/** Fetch a single CV file (base64) for download. */
export async function getApplicationCv(
  id: string,
): Promise<{ name: string; type: string; base64: string } | null> {
  await requireAdmin();
  const [row] = await db
    .select({
      cvName: schema.applications.cvName,
      cvType: schema.applications.cvType,
      cvData: schema.applications.cvData,
    })
    .from(schema.applications)
    .where(eq(schema.applications.id, id));
  if (!row) return null;
  const buf = row.cvData as Buffer;
  return {
    name: row.cvName,
    type: row.cvType,
    base64: Buffer.from(buf).toString("base64"),
  };
}
