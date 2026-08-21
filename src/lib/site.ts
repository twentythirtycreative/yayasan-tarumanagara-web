export const siteConfig = {
  name: "Yayasan Tarumanagara",
  shortName: "Tarumanagara",
  tagline: "Membangun Nilai, Menginspirasi Masa Depan",
  /** Canonical site origin (no trailing slash). Set NEXT_PUBLIC_SITE_URL in prod. */
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.tarumanagara.org").replace(/\/$/, ""),
  description:
    "Yayasan Tarumanagara: Lembaga nirlaba sejak 1959 yang berdedikasi melayani masyarakat di bidang pendidikan, kesehatan, dan pengabdian.",
  /**
   * Share-card image (1200x630). The filename carries a version because Meta
   * caches a preview image by its URL: republishing different bytes at the same
   * path leaves WhatsApp showing the copy it already has, no matter how many
   * times the page URL is busted with a query string.
   */
  ogImage: "/images/og-hero.jpg",
  foundationLabel: "Tarumanagara Foundation 2026©",
  /** Street address, one line (used for schema.org markup). */
  address:
    "Jl. Letjen S. Parman No.1, RT.6/RW.16, Tomang, Kec. Grogol petamburan, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11470",
  /** Same address broken the way the client wants it stacked in the footer. */
  addressLines: [
    "Jl. Letjen S. Parman No.1, RT.6/RW.16",
    "Tomang, Kec. Grogol petamburan, Kota Jakarta Barat",
    "Daerah Khusus Ibukota Jakarta 11470",
  ],
  /** Where the foundation itself sits on that address. */
  office: "Kampus I Universitas Tarumanagara Gedung Utama Lantai 2",
  /** Footer "Jam Operasional" column. */
  hours: { days: "Senin – Jumat", time: "(08.00-16.45)" },
  phone: "(021) 5695-8728",
  /** Footer blurb (Figma 332:951) — replaces the address block in the footer. */
  footerAbout:
    "Yayasan Tarumanagara adalah lembaga nirlaba yang didirikan pada 18 Juni 1959. Yayasan ini berfokus pada pelayanan masyarakat di bidang pendidikan, kesehatan, dan pengabdian",
  email: "info@tarumanagara.org",
  /** Navbar CTA target — Untar admission site (Figma 342:1764 "Daftar Untar"). */
  daftarUntarUrl: "https://go.untar.ac.id/",
  social: {
    linkedin:
      "https://www.linkedin.com/company/tarumanagara-foundation/?originalSubdomain=id",
    instagram: "https://www.instagram.com/tarumanagarafoundation/",
    tiktok: "https://www.tiktok.com/@proudtarumanagara",
    youtube: "https://www.youtube.com/@tarumanagarafoundation",
  },
} as const;

/** Google Maps links for the campuses / sites the units sit on. Several units
 *  share an address, so the URLs are named once here and referenced below. */
export const mapLinks = {
  kampus1: "https://maps.app.goo.gl/ZJV71Bpnz5eCwe1F6",
  kampus2: "https://maps.app.goo.gl/VFnLZEYbXy48jn5f6",
  kampus3: "https://maps.app.goo.gl/pq8oL9tUMeKkecfN8",
  royalTaruma: "https://maps.app.goo.gl/z8boLpdi8qWT9xoY9",
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
 *  under the card title — Universitas Tarumanagara is the only card with two.
 *  Each location carries the Google Maps link for that site; the card's
 *  "Pelajari lebih lanjut" button opens the first one. */
export const units = [
  {
    slug: "pendidikan",
    label: "Unit Pendidikan",
    cards: [
      {
        title: "Universitas Tarumanagara",
        image: "/images/units/untar.png",
        locations: [
          { label: "Kampus 1: Letjen S Parman", map: mapLinks.kampus1 },
          { label: "Kampus 2: Tj Duren", map: mapLinks.kampus2 },
        ],
      },
      {
        title: "Tarumanagara Xinya College",
        image: "/images/units/xinya.png",
        locations: [{ label: "Kampus 2: Tj Duren", map: mapLinks.kampus2 }],
      },
      {
        title: "Institut Tarumanagara",
        image: "/images/units/itaru.png",
        locations: [{ label: "Kampus 3: Cilandak", map: mapLinks.kampus3 }],
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
        locations: [{ label: "RS Royal Taruma", map: mapLinks.royalTaruma }],
      },
      {
        title: "PT Taruma Bhakti Medika",
        image: "/images/units/bhakti-medika.png",
        locations: [{ label: "RS Royal Taruma", map: mapLinks.royalTaruma }],
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
        locations: [{ label: "Kampus 1: Letjen S Parman", map: mapLinks.kampus1 }],
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
        locations: [{ label: "Kampus 2: Tj Duren", map: mapLinks.kampus2 }],
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
        locations: [{ label: "Kampus 2: Tj Duren", map: mapLinks.kampus2 }],
      },
    ],
  },
] as const;

export type Unit = (typeof units)[number];
export type UnitCard = Unit["cards"][number];

/** Tags available for news / activities. */
export const newsTags = ["Kemitraan Strategis", "Kegiatan", "Berita"] as const;
export type NewsTag = (typeof newsTags)[number];
