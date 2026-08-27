"use server";

import { asc, desc, eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { db, schema } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/cache";
import { formatDateId } from "@/lib/format-date";
import { requireAdmin, requireSection } from "@/lib/auth/guard";
import type { AdminRole } from "@/lib/auth/roles";
import { deleteStoredImage, persistImageField } from "@/lib/images";
import { MAX_IMAGE_SIZE, dataUrlBytes } from "@/lib/validators/upload";
import type {
  AdminGovernanceMember,
  AdminJob,
  AdminNews,
  AdminNewsCategory,
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
  categoryId: r.categoryId ?? "",
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
// The admin lists below are deliberately uncached. The panel is a handful of
// signed-in users, it must show what was just written, and `_store.tsx` already
// updates optimistically — so a Data Cache entry bought nothing while adding a
// failure mode: an oversized payload makes `unstable_cache` throw on write, and
// one rejected list empties the whole panel. Public reads stay cached in
// `src/lib/data/*` (tags below still invalidate them).
export async function listNews(): Promise<AdminNews[]> {
  await requireSection("berita");
  const rows = await db
    .select()
    .from(schema.news)
    .orderBy(desc(schema.newsSortKey), desc(schema.news.createdAt));
  return rows.map(toAdminNews);
}

export async function saveNews(item: AdminNews): Promise<{ error?: string }> {
  await requireSection("berita");
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
  // Move the upload into the `images` table (and drop the cover it replaces)
  // only after the checks above, so a rejected save leaves no orphan blob.
  const [existing] = await db
    .select({ coverImageUrl: schema.news.coverImageUrl })
    .from(schema.news)
    .where(eq(schema.news.id, item.id));
  const coverImageUrl = await persistImageField(
    item.coverImageUrl,
    existing?.coverImageUrl ?? null,
  );

  const values = {
    id: item.id,
    title: item.title,
    slug: item.slug,
    content: item.content,
    author: item.author || "Redaksi",
    caption: item.caption || null,
    tags: item.tags,
    // "" is the "Tanpa Kategori" choice in the form; store it as NULL so the
    // public read's LEFT JOIN sees no category rather than an empty-string id.
    categoryId: item.categoryId || null,
    coverImageUrl,
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
        categoryId: values.categoryId,
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
  await requireSection("berita");
  // Read the cover first — once the row is gone its blob is unreachable.
  const [row] = await db
    .select({ coverImageUrl: schema.news.coverImageUrl })
    .from(schema.news)
    .where(eq(schema.news.id, id));
  await db.delete(schema.news).where(eq(schema.news.id, id));
  await deleteStoredImage(row?.coverImageUrl);
  revalidateNews();
}

// Returns the new published state (authoritative), or null if the row is gone
// (e.g. deleted by another admin) so the client can reconcile.
export async function togglePublish(id: string): Promise<{ published: boolean } | null> {
  await requireSection("berita");
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

// ── Kategori Berita ───────────────────────────────────────────────────────
// Part of the Berita section, not a section of its own: the categories only
// exist to file articles under, so whoever may edit articles (master, humas)
// may edit the tabs they go in.
type NewsCategoryRow = typeof schema.newsCategories.$inferSelect;

const toAdminNewsCategory = (r: NewsCategoryRow): AdminNewsCategory => ({
  id: r.id,
  name: r.name,
  slug: r.slug,
  sortOrder: r.sortOrder,
});

export async function listNewsCategories(): Promise<AdminNewsCategory[]> {
  await requireSection("berita");
  const rows = await db
    .select()
    .from(schema.newsCategories)
    .orderBy(asc(schema.newsCategories.sortOrder), asc(schema.newsCategories.name));
  return rows.map(toAdminNewsCategory);
}

export async function saveNewsCategory(
  item: AdminNewsCategory,
): Promise<{ error?: string }> {
  await requireSection("berita");
  const name = item.name.trim();
  const slug = item.slug.trim();
  if (!name) return { error: "Nama kategori wajib diisi." };
  if (!slug) return { error: "Slug kategori wajib diisi." };
  // The slug is the key the public tab filters on, so a duplicate would make
  // two tabs show the same articles. Checked here because the unique index
  // would otherwise surface as an opaque, redacted production error.
  const [clash] = await db
    .select({ id: schema.newsCategories.id })
    .from(schema.newsCategories)
    .where(eq(schema.newsCategories.slug, slug));
  if (clash && clash.id !== item.id) {
    return { error: "Slug kategori sudah dipakai. Ubah nama atau slug." };
  }

  // New rows land at the end of the tab bar. `count`, not max+1: the move
  // action renumbers densely, so the row count IS the next free position.
  const existing = await db
    .select({ id: schema.newsCategories.id })
    .from(schema.newsCategories);
  const isNew = !existing.some((c) => c.id === item.id);

  const values = {
    id: item.id,
    name,
    slug,
    sortOrder: isNew ? existing.length : item.sortOrder,
  };
  await db
    .insert(schema.newsCategories)
    .values(values)
    .onConflictDoUpdate({
      target: schema.newsCategories.id,
      set: {
        name: values.name,
        slug: values.slug,
        sortOrder: values.sortOrder,
        updatedAt: new Date().toISOString(),
      },
    });
  revalidateNews();
  return {};
}

/**
 * Delete a category and un-file everything in it. The articles stay published;
 * they just fall back to appearing under "Semua Berita" only.
 *
 * This is the FK's ON DELETE SET NULL, written by hand — see the note on
 * `news.categoryId` in the schema for why the column carries no constraint.
 */
export async function deleteNewsCategory(id: string): Promise<void> {
  await requireSection("berita");
  await db
    .update(schema.news)
    .set({ categoryId: null, updatedAt: new Date().toISOString() })
    .where(eq(schema.news.categoryId, id));
  await db.delete(schema.newsCategories).where(eq(schema.newsCategories.id, id));
  revalidateNews();
}

/**
 * Move a category one place left/right in the tab bar, returning the new id
 * order so the client can reconcile.
 *
 * Renumbers the whole list densely rather than swapping two values: rows that
 * predate any ordering all share the default 0, and swapping equal numbers
 * moves nothing.
 */
export async function moveNewsCategory(
  id: string,
  direction: -1 | 1,
): Promise<string[] | null> {
  await requireSection("berita");
  const rows = await db
    .select({ id: schema.newsCategories.id })
    .from(schema.newsCategories)
    .orderBy(asc(schema.newsCategories.sortOrder), asc(schema.newsCategories.name));

  const order = rows.map((r) => r.id);
  const from = order.indexOf(id);
  if (from < 0) return null; // deleted by another admin
  const to = from + direction;
  if (to < 0 || to >= order.length) return order; // already at the end
  [order[from], order[to]] = [order[to], order[from]];

  await Promise.all(
    order.map((categoryId, i) =>
      db
        .update(schema.newsCategories)
        .set({ sortOrder: i, updatedAt: new Date().toISOString() })
        .where(eq(schema.newsCategories.id, categoryId)),
    ),
  );
  revalidateNews();
  return order;
}

// ── Lowongan ──────────────────────────────────────────────────────────────
export async function listJobs(): Promise<AdminJob[]> {
  await requireSection("lowongan");
  const rows = await db.select().from(schema.jobs).orderBy(desc(schema.jobs.createdAt));
  return rows.map(toAdminJob);
}

export async function saveJob(item: AdminJob): Promise<void> {
  await requireSection("lowongan");
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
  await requireSection("lowongan");
  await db.delete(schema.jobs).where(eq(schema.jobs.id, id));
  revalidateJobs();
}

export async function toggleJobOpen(id: string): Promise<{ isOpen: boolean } | null> {
  await requireSection("lowongan");
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

export async function listGovernanceMembers(): Promise<AdminGovernanceMember[]> {
  await requireSection("tata-kelola");
  const rows = await db
    .select()
    .from(schema.governanceMembers)
    .orderBy(asc(schema.governanceMembers.sortOrder), asc(schema.governanceMembers.name));
  return rows.map(toAdminGovernance);
}

export async function saveGovernanceMember(
  item: AdminGovernanceMember,
): Promise<{ error?: string }> {
  await requireSection("tata-kelola");
  if (
    item.photoUrl.startsWith("data:") &&
    dataUrlBytes(item.photoUrl) > MAX_IMAGE_SIZE
  ) {
    return { error: "Ukuran foto melebihi batas." };
  }
  const [existing] = await db
    .select({ photoUrl: schema.governanceMembers.photoUrl })
    .from(schema.governanceMembers)
    .where(eq(schema.governanceMembers.id, item.id));
  const photoUrl = await persistImageField(item.photoUrl, existing?.photoUrl ?? null);

  const values = {
    id: item.id,
    role: item.role,
    name: item.name,
    position: item.position,
    photoUrl,
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
  await requireSection("tata-kelola");
  const [row] = await db
    .select({ photoUrl: schema.governanceMembers.photoUrl })
    .from(schema.governanceMembers)
    .where(eq(schema.governanceMembers.id, id));
  await db.delete(schema.governanceMembers).where(eq(schema.governanceMembers.id, id));
  await deleteStoredImage(row?.photoUrl);
  revalidateGovernance();
}

export async function toggleGovernancePublished(
  id: string,
): Promise<{ published: boolean } | null> {
  await requireSection("tata-kelola");
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
  await requireSection("tata-kelola");
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
  await requireSection("lamaran");
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
  await requireSection("lamaran");
  await db.delete(schema.applications).where(eq(schema.applications.id, id));
}

/** The signed-in admin's identity + role (for the panel avatar/header). */
export async function getCurrentAdmin(): Promise<{ email: string; role: AdminRole }> {
  const session = await requireAdmin();
  return { email: session.email, role: session.role };
}

/** Fetch a single CV file (base64) for download. */
export async function getApplicationCv(
  id: string,
): Promise<{ name: string; type: string; base64: string } | null> {
  await requireSection("lamaran");
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
