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
  /** Footer blurb (Figma 332:951) — replaces the address block in the footer. */
  footerAbout:
    "Yayasan Tarumanagara adalah lembaga nirlaba yang didirikan pada 18 Juni 1959. Yayasan ini berfokus pada pelayanan masyarakat di bidang pendidikan, kesehatan, dan pengabdian",
  email: "info@tarumanagara.org",
  /** Navbar CTA target — Untar admission site (Figma 342:1764 "Daftar Untar"). */
  daftarUntarUrl: "https://go.untar.ac.id/",
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

/** Business units shown under "Unit di Dalam Ekosistem Kami" on the homepage.
 *  `cards` holds each unit's member institutions (max 3, from Figma). When a
 *  unit has a single card it is left-aligned, not pushed to the right.
 *  `locations` (Figma 542:1075 et al) renders one pin + site line per entry
 *  under the card title — Universitas Tarumanagara is the only card with two. */
export const units = [
  {
    slug: "pendidikan",
    label: "Unit Pendidikan",
    cards: [
      {
        title: "Universitas Tarumanagara",
        image: "/images/units/untar.png",
        locations: ["Kampus 1: Letjen S Parman", "Kampus 2: Tj Duren"],
      },
      {
        title: "Tarumanagara Xinya College",
        image: "/images/units/xinya.png",
        locations: ["Kampus 2: Tj Duren"],
      },
      {
        title: "Institut Tarumanagara",
        image: "/images/units/itaru.png",
        locations: ["Kampus 3: Cilandak"],
      },
    ],
  },
  {
    slug: "kesehatan",
    label: "Unit Kesehatan",
    cards: [
      {
        title: "Rumah Sakit Royal Taruma",
        image: "/images/units/royal-taruma.png",
        locations: ["RS Royal Taruma"],
      },
      {
        title: "PT Taruma Bhakti Medika",
        image: "/images/units/bhakti-medika.png",
        locations: ["RS Royal Taruma"],
      },
    ],
  },
  {
    slug: "inovasi-pengembangan",
    label: "Unit Inovasi & Pengembangan",
    cards: [
      {
        title: "Tarumanagara Enterprise",
        image: "/images/units/enterprise.png",
        locations: ["Kampus 1: Letjen S Parman"],
      },
    ],
  },
  {
    slug: "properti-bangunan",
    label: "Unit Pengembangan Properti & Bangunan",
    cards: [
      {
        title: "PT Taruma Bhakti Usaha",
        image: "/images/units/bhakti-usaha.png",
        locations: ["Kampus 2: Tj Duren"],
      },
    ],
  },
  {
    slug: "fasilitas-hunian",
    label: "Unit Fasilitas Hunian",
    cards: [
      {
        title: "Untar Residence",
        image: "/images/units/untar-residence.png",
        locations: ["Kampus 2: Tj Duren"],
      },
    ],
  },
] as const;

export type Unit = (typeof units)[number];
export type UnitCard = Unit["cards"][number];

/** Tags available for news / activities. */
export const newsTags = ["Kemitraan Strategis", "Kegiatan", "Berita"] as const;
export type NewsTag = (typeof newsTags)[number];
