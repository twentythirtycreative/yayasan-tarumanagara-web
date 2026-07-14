export const siteConfig = {
  name: "Yayasan Tarumanagara",
  shortName: "Tarumanagara",
  tagline: "Membangun Nilai, Menginspirasi Masa Depan",
  /** Canonical site origin (no trailing slash). Set NEXT_PUBLIC_SITE_URL in prod. */
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.tarumanagara.org").replace(/\/$/, ""),
  description:
    "Yayasan Tarumanagara — Membangun Nilai, Menginspirasi Masa Depan. Informasi lembaga, unit usaha, berita, kegiatan, dan karir.",
  ogImage: "/images/og.jpg",
  foundationLabel: "Tarumanagara Foundation 2026©",
  address:
    "Jl. Letjen S. Parman No.1 3, RT.3/RW.8, Tomang, Kec. Grogol petamburan, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11440",
  email: "info@tarumanagara.org",
  social: {
    linkedin: "https://www.linkedin.com/",
    instagram: "https://www.instagram.com/",
    tiktok: "https://www.tiktok.com/",
    youtube: "https://www.youtube.com/",
  },
} as const;

export const navLinks = [
  { label: "Beranda", href: "/" },
  { label: "Tentang Kami", href: "/tentang-kami" },
  { label: "Karir", href: "/karir" },
  { label: "Berita & Kegiatan", href: "/berita" },
] as const;

/** Business units shown under "Lembaga & Unit Usaha" on the homepage.
 *  `cards` holds each unit's member institutions (max 3, from Figma). When a
 *  unit has a single card it is left-aligned, not pushed to the right. */
export const units = [
  {
    slug: "pendidikan",
    label: "Unit Pendidikan",
    cards: [
      { title: "Universitas Tarumanagara", image: "/images/units/untar.png" },
      { title: "Tarumanagara Xinya College", image: "/images/units/xinya.png" },
      { title: "Institut Tarumanagara", image: "/images/units/itaru.png" },
    ],
  },
  {
    slug: "kesehatan",
    label: "Unit Kesehatan",
    cards: [
      { title: "Rumah Sakit Royal Taruma", image: "/images/units/royal-taruma.png" },
      { title: "Taruma Bhakti Medika", image: "/images/units/bhakti-medika.png" },
    ],
  },
  {
    slug: "inovasi-pengembangan",
    label: "Unit Inovasi & Pengembangan",
    cards: [
      { title: "Tarumanagara Enterprise", image: "/images/units/enterprise.png" },
    ],
  },
  {
    slug: "properti-bangunan",
    label: "Unit Pengembangan Properti & Bangunan",
    cards: [
      { title: "Taruma Bhakti Usaha", image: "/images/units/bhakti-usaha.png" },
    ],
  },
  {
    slug: "fasilitas-hunian",
    label: "Unit Fasilitas Hunian",
    cards: [
      { title: "Untar Residence", image: "/images/units/untar-residence.png" },
    ],
  },
] as const;

export type Unit = (typeof units)[number];
export type UnitCard = Unit["cards"][number];

/** Tags available for news / activities. */
export const newsTags = ["Kemitraan Strategis", "Kegiatan", "Berita"] as const;
export type NewsTag = (typeof newsTags)[number];
