"use server";

import { asc, desc, eq } from "drizzle-orm";
import { unstable_cache, updateTag } from "next/cache";
import { db, schema } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/cache";
import { formatDateId } from "@/lib/format-date";
import { requireAdmin } from "@/lib/auth/guard";
import { MAX_IMAGE_SIZE, dataUrlBytes } from "@/lib/validators/upload";
import type {
  AdminGovernanceMember,
  AdminJob,
  AdminNews,
  Application,
} from "./types";

// Invalidate the Data Cache + affected public routes after a write.
//
// One `updateTag` per domain is the whole job. Next stamps the tags collected
// during a render onto the route's prerender entry, so the "news" tag reaches
// the cached query *and* every page built from it — /, /berita, /berita/[slug],
// /sitemap.xml (see `x-next-cache-tags` in .next/server/app/*.meta). The
// `revalidatePath` calls that used to sit here named those same routes by hand:
// redundant, and one of them ("/berita/[slug]", "page") swept every article page
// on any single-article edit.
//
// updateTag (not revalidateTag) because these run inside Server Actions and the
// admin must see the change on the next request, not stale-while-revalidate.
function revalidateNews() {
  updateTag(CACHE_TAGS.news);
}
function revalidateJobs() {
  updateTag(CACHE_TAGS.jobs);
}
function revalidateGovernance() {
  updateTag(CACHE_TAGS.governance);
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
    const rows = await db
      .select()
      .from(schema.news)
      .orderBy(desc(schema.newsSortKey), desc(schema.news.createdAt));
    return rows.map(toAdminNews);
  },
  ["admin-news"],
  { tags: [CACHE_TAGS.news], revalidate: false },
);

export async function listNews(): Promise<AdminNews[]> {
  await requireAdmin();
  return cachedNews();
}

export async function saveNews(item: AdminNews): Promise<{ error?: string }> {
  await requireAdmin();
  // Enforce the cover-image size cap server-side (base64 data URLs).
  if (
    item.coverImageUrl.startsWith("data:") &&
    dataUrlBytes(item.coverImageUrl) > MAX_IMAGE_SIZE
  ) {
    return { error: "Ukuran gambar sampul melebihi batas." };
  }
  // Reject a slug already taken by a DIFFERENT article (unique constraint would
  // otherwise fail with an opaque error). Return the message so the client can
  // surface it — thrown errors get redacted in production.
  const [clash] = await db
    .select({ id: schema.news.id })
    .from(schema.news)
    .where(eq(schema.news.slug, item.slug));
  if (clash && clash.id !== item.id) {
    return { error: "Slug sudah dipakai artikel lain. Ubah judul atau slug." };
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
  return {};
}

export async function deleteNews(id: string): Promise<void> {
  await requireAdmin();
  await db.delete(schema.news).where(eq(schema.news.id, id));
  revalidateNews();
}

// Returns the new published state (authoritative), or null if the row is gone
// (e.g. deleted by another admin) so the client can reconcile.
export async function togglePublish(id: string): Promise<{ published: boolean } | null> {
  await requireAdmin();
  const [row] = await db
    .select({ published: schema.news.published })
    .from(schema.news)
    .where(eq(schema.news.id, id));
  if (!row) return null;
  const next = !row.published;
  await db
    .update(schema.news)
    .set({ published: next, updatedAt: new Date().toISOString() })
    .where(eq(schema.news.id, id));
  revalidateNews();
  return { published: next };
}

// ── Lowongan ──────────────────────────────────────────────────────────────
const cachedJobs = unstable_cache(
  async (): Promise<AdminJob[]> => {
    const rows = await db.select().from(schema.jobs).orderBy(desc(schema.jobs.createdAt));
    return rows.map(toAdminJob);
  },
  ["admin-jobs"],
  { tags: [CACHE_TAGS.jobs], revalidate: false },
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

export async function toggleJobOpen(id: string): Promise<{ isOpen: boolean } | null> {
  await requireAdmin();
  const [row] = await db
    .select({ isOpen: schema.jobs.isOpen })
    .from(schema.jobs)
    .where(eq(schema.jobs.id, id));
  if (!row) return null;
  const next = !row.isOpen;
  await db
    .update(schema.jobs)
    .set({ isOpen: next })
    .where(eq(schema.jobs.id, id));
  revalidateJobs();
  return { isOpen: next };
}

// ── Tata Kelola Organisasi ────────────────────────────────────────────────
type GovernanceRow = typeof schema.governanceMembers.$inferSelect;

const toAdminGovernance = (r: GovernanceRow): AdminGovernanceMember => ({
  id: r.id,
  role: r.role,
  name: r.name,
  position: r.position,
  photoUrl: r.photoUrl ?? "",
  photoPosition: r.photoPosition,
  sortOrder: r.sortOrder,
  published: r.published,
});

const cachedGovernance = unstable_cache(
  async (): Promise<AdminGovernanceMember[]> => {
    const rows = await db
      .select()
      .from(schema.governanceMembers)
      .orderBy(asc(schema.governanceMembers.sortOrder), asc(schema.governanceMembers.name));
    return rows.map(toAdminGovernance);
  },
  ["admin-governance"],
  { tags: [CACHE_TAGS.governance], revalidate: false },
);

export async function listGovernanceMembers(): Promise<AdminGovernanceMember[]> {
  await requireAdmin();
  return cachedGovernance();
}

export async function saveGovernanceMember(
  item: AdminGovernanceMember,
): Promise<{ error?: string }> {
  await requireAdmin();
  if (
    item.photoUrl.startsWith("data:") &&
    dataUrlBytes(item.photoUrl) > MAX_IMAGE_SIZE
  ) {
    return { error: "Ukuran foto melebihi batas." };
  }
  const values = {
    id: item.id,
    role: item.role,
    name: item.name,
    position: item.position,
    photoUrl: item.photoUrl || null,
    photoPosition: item.photoPosition || "50% 50%",
    sortOrder: item.sortOrder,
    published: item.published,
  };
  await db
    .insert(schema.governanceMembers)
    .values(values)
    .onConflictDoUpdate({
      target: schema.governanceMembers.id,
      set: {
        role: values.role,
        name: values.name,
        position: values.position,
        photoUrl: values.photoUrl,
        photoPosition: values.photoPosition,
        sortOrder: values.sortOrder,
        published: values.published,
        updatedAt: new Date().toISOString(),
      },
    });
  revalidateGovernance();
  return {};
}

export async function deleteGovernanceMember(id: string): Promise<void> {
  await requireAdmin();
  await db.delete(schema.governanceMembers).where(eq(schema.governanceMembers.id, id));
  revalidateGovernance();
}

export async function toggleGovernancePublished(
  id: string,
): Promise<{ published: boolean } | null> {
  await requireAdmin();
  const [row] = await db
    .select({ published: schema.governanceMembers.published })
    .from(schema.governanceMembers)
    .where(eq(schema.governanceMembers.id, id));
  if (!row) return null;
  const next = !row.published;
  await db
    .update(schema.governanceMembers)
    .set({ published: next, updatedAt: new Date().toISOString() })
    .where(eq(schema.governanceMembers.id, id));
  revalidateGovernance();
  return { published: next };
}

/**
 * Move a member one place left/right within its own role, and return that role's
 * ids in the new order so the client can reconcile.
 *
 * Rewrites every sortOrder in the role as a dense 0..n-1 sequence rather than
 * swapping two values: rows created before any ordering was set all share the
 * default 0, and swapping equal numbers moves nothing.
 */
export async function moveGovernanceMember(
  id: string,
  direction: -1 | 1,
): Promise<string[] | null> {
  await requireAdmin();
  const [target] = await db
    .select({ role: schema.governanceMembers.role })
    .from(schema.governanceMembers)
    .where(eq(schema.governanceMembers.id, id));
  if (!target) return null;

  const siblings = await db
    .select({ id: schema.governanceMembers.id })
    .from(schema.governanceMembers)
    .where(eq(schema.governanceMembers.role, target.role))
    .orderBy(asc(schema.governanceMembers.sortOrder), asc(schema.governanceMembers.name));

  const order = siblings.map((s) => s.id);
  const from = order.indexOf(id);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= order.length) return order; // already at the end
  [order[from], order[to]] = [order[to], order[from]];

  await Promise.all(
    order.map((memberId, i) =>
      db
        .update(schema.governanceMembers)
        .set({ sortOrder: i, updatedAt: new Date().toISOString() })
        .where(eq(schema.governanceMembers.id, memberId)),
    ),
  );
  revalidateGovernance();
  return order;
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

/** The signed-in admin's identity (for the panel avatar/header). */
export async function getCurrentAdmin(): Promise<{ email: string }> {
  const session = await requireAdmin();
  return { email: session.email };
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
