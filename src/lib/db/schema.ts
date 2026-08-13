import { sql } from "drizzle-orm";
import { blob, index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { GOVERNANCE_ROLES } from "@/lib/governance-roles";

const uuid = () => crypto.randomUUID();

/**
 * Uploaded image bytes (news covers, Tata Kelola portraits).
 *
 * Turso has no object storage, so the bytes live here as a BLOB and the owning
 * row keeps only a short reference — "/api/images/<id>", served by
 * `app/api/images/[id]/route.ts`.
 *
 * They used to sit inline in the owning row as a base64 `data:` URL, which put
 * ~3.5 MB of image into every cached list payload: past the Data Cache's 2 MB
 * per-item ceiling, so `unstable_cache` threw on write and the admin panel came
 * up empty. Keeping the bytes out of the row keeps those payloads in kilobytes.
 *
 * Rows are immutable: replacing a photo inserts a new id and deletes the old
 * row, which is what lets the route serve them with a long immutable max-age.
 */
export const images = sqliteTable("images", {
  id: text("id").primaryKey().$defaultFn(uuid),
  /** e.g. "image/webp" — echoed back as the response Content-Type. */
  mimeType: text("mime_type").notNull(),
  data: blob("data", { mode: "buffer" }).notNull(),
  /** Decoded size, so admin tooling can report usage without reading the blob. */
  byteSize: integer("byte_size").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

/** Berita & Kegiatan (news / activities). */
export const news = sqliteTable("news", {
  id: text("id").primaryKey().$defaultFn(uuid),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  /** Byline shown on the article. */
  author: text("author").notNull().default("Redaksi"),
  /** Italic photo caption shown under the article cover image. */
  caption: text("caption"),
  /** "/api/images/<id>" (see `images`), or a /public path. Never inline base64. */
  coverImageUrl: text("cover_image_url"),
  tags: text("tags", { mode: "json" }).$type<string[]>().notNull().default([]),
  /** Human display date, e.g. "13 August 2025". */
  dateLabel: text("date_label").notNull().default(""),
  /** Machine date (ISO "YYYY-MM-DD") — for sorting / SEO <time>. */
  publishedAt: text("published_at"),
  published: integer("published", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

/**
 * Sort key for "berita terbaru": the editor-set publication date, falling back
 * to the row's creation timestamp when `published_at` was left empty. Both are
 * ISO-prefixed text, so plain string ordering is chronological.
 */
export const newsSortKey = sql`coalesce(${news.publishedAt}, ${news.createdAt})`;

/** Lowongan pekerjaan (Karir page listings). */
export const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey().$defaultFn(uuid),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  type: text("type").notNull().default("Full-Time"),
  location: text("location"),
  isOpen: integer("is_open", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

/**
 * Lamaran / Kirim CV (job applications).
 * Turso has no object storage, so the CV file is stored as a BLOB alongside its
 * name and MIME type (fine for this site's low volume; 5 MB cap enforced in the
 * server action).
 */
export const applications = sqliteTable("applications", {
  id: text("id").primaryKey().$defaultFn(uuid),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  university: text("university").notNull(),
  major: text("major").notNull(),
  position: text("position").notNull(),
  cvName: text("cv_name").notNull(),
  cvType: text("cv_type").notNull(),
  cvData: blob("cv_data", { mode: "buffer" }).notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

/**
 * Tata Kelola Organisasi — the people carousel on Tentang Kami. One row per
 * person; `role` picks the tab they appear under and `sortOrder` their place in
 * that tab's row, left to right. Admin CRUD writes here.
 */
export const governanceMembers = sqliteTable(
  "governance_members",
  {
    id: text("id").primaryKey().$defaultFn(uuid),
    role: text("role", { enum: GOVERNANCE_ROLES }).notNull(),
    name: text("name").notNull(),
    /** Jabatan, shown in smaller type under the name on the card. */
    position: text("position").notNull().default(""),
    /** "/api/images/<id>" (see `images`), or a /public path. Never inline base64. */
    photoUrl: text("photo_url"),
    /**
     * CSS object-position for the portrait, e.g. "50% 14%". Every headshot is
     * framed differently, and the card crops hard, so the crop has to travel
     * with the photo rather than be one constant in the component.
     */
    photoPosition: text("photo_position").notNull().default("50% 50%"),
    /** Ascending, left to right within the role. Ties fall back to name. */
    sortOrder: integer("sort_order").notNull().default(0),
    /** Lets admin stage someone without showing them on the public page. */
    published: integer("published", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  // Array, not an object: drizzle-orm 0.45 ignores the legacy object form here
  // without warning, and the index silently never reaches the database.
  (t) => [
    /** The public page always reads one whole tab in display order. */
    index("governance_members_role_order_idx").on(t.role, t.sortOrder),
  ],
);

/** Admin users (Turso-backed auth). Password stored as scrypt "salt:hash". */
export const adminUsers = sqliteTable("admin_users", {
  id: text("id").primaryKey().$defaultFn(uuid),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

/**
 * Login throttling (brute-force protection). One row per email; `count` failed
 * attempts since `windowStart`. Cleared on a successful login. Persistent (vs
 * in-memory) so it holds across Vercel's serverless instances.
 */
export const loginAttempts = sqliteTable("login_attempts", {
  email: text("email").primaryKey(),
  count: integer("count").notNull().default(0),
  windowStart: text("window_start").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export type Image = typeof images.$inferSelect;
export type NewImage = typeof images.$inferInsert;
export type News = typeof news.$inferSelect;
export type NewNews = typeof news.$inferInsert;
export type Job = typeof jobs.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
export type GovernanceMember = typeof governanceMembers.$inferSelect;
export type NewGovernanceMember = typeof governanceMembers.$inferInsert;
