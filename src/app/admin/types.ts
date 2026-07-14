// Shared admin DTO types + helpers (no "use client" so server actions can
// import them too).

export type AdminNews = {
  id: string;
  title: string;
  slug: string;
  content: string;
  author: string;
  caption: string;
  tags: string[];
  coverImageUrl: string;
  dateLabel: string;
  publishedAt: string; // ISO "YYYY-MM-DD"
  published: boolean;
};

export type AdminJob = {
  id: string;
  title: string;
  desc: string;
  type: string; // e.g. "Fulltime"
  location: string; // e.g. "Work From Office"
  isOpen: boolean;
};

export type Application = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  university: string;
  major: string;
  position: string;
  cvName: string;
  createdAt: string;
};

export const NEWS_TAGS = ["Kemitraan Strategis", "Kegiatan", "Berita"] as const;

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
