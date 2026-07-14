import { sql } from "drizzle-orm";
import { blob, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const uuid = () => crypto.randomUUID();

/** Berita & Kegiatan (news / activities). */
export const news = sqliteTable("news", {
  id: text("id").primaryKey().$defaultFn(uuid),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull().default(""),
  content: text("content").notNull().default(""),
  /** Byline shown on the article. */
  author: text("author").notNull().default("Redaksi"),
  /** Italic photo caption shown under the article cover image. */
  caption: text("caption"),
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

/** Lowongan pekerjaan (Karir page listings). */
export const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey().$defaultFn(uuid),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  type: text("type").notNull().default("Fulltime"),
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

/** Admin users (Turso-backed auth). Password stored as scrypt "salt:hash". */
export const adminUsers = sqliteTable("admin_users", {
  id: text("id").primaryKey().$defaultFn(uuid),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type News = typeof news.$inferSelect;
export type NewNews = typeof news.$inferInsert;
export type Job = typeof jobs.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
