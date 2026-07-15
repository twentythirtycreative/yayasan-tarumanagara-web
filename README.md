# Website Yayasan Tarumanagara

Situs resmi **Yayasan Tarumanagara** — situs publik bergaya glassmorphism dengan
CMS admin untuk mengelola Berita & Kegiatan, Lowongan Kerja, dan Lamaran (Kirim CV).

## Teknologi

| Area | Pilihan |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions) + React 19 |
| Bahasa | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | **Turso** (libSQL / SQLite) via **Drizzle ORM** |
| Auth admin | Session JWT bertanda tangan (`jose`) + password scrypt |
| Form & validasi | React Hook Form pattern + Zod |
| Animasi | Motion (Framer Motion) + Lenis smooth scroll |
| Deploy | Vercel |

## Fitur

**Situs publik** (data dari Turso, di-cache + ISR)
- Beranda: hero, sambutan, Lembaga & Unit Usaha, carousel Berita Terbaru
- Tentang Kami, Karir (lowongan dari DB), Kirim CV (upload CV → Turso)
- Berita & Kegiatan (list + load-more) dan halaman detail artikel

**Admin** (`/admin`, terproteksi)
- Login (Turso `admin_users`), dashboard ringkasan
- CRUD Berita (judul, penulis, tanggal, tags, gambar sampul, konten)
- CRUD Lowongan Kerja, daftar & unduh Lamaran (CV)

## Menjalankan secara lokal

```bash
npm install
cp .env.example .env.development.local   # isi nilai dari Turso (DB dev)
npm run db:push                          # buat tabel di Turso dari schema Drizzle
npm run create-admin -- "admin@domain.com" "kata-sandi-kuat"
npm run dev                              # http://localhost:3000
```

Tanpa file env, situs publik tetap tampil (data contoh); fitur simpan/upload
dan admin aktif setelah Turso dikonfigurasi.

## Environment variables

Pisahkan DB per environment (semua di-`.gitignore`):

- **`.env.development.local`** → DB **dev** (dipakai `next dev` & `db:push` default)
- **`.env.production.local`** → DB **prod** (lokal), atau set langsung di **Vercel**

```
# Turso (libSQL) — turso db show <name> --url  /  turso db tokens create <name>
TURSO_DATABASE_URL=libsql://your-db-your-org.turso.io
TURSO_AUTH_TOKEN=your-auth-token

# Admin auth (rahasia acak):
# node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
AUTH_SECRET=your-random-32-byte-base64-secret
```

Menjalankan perintah DB terhadap **prod** (mis. `db:push`):

```bash
# Windows PowerShell
$env:DOTENV_FILE=".env.production.local"; npm run db:push
# bash
DOTENV_FILE=.env.production.local npm run db:push
```

## Perintah npm

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Jalankan dev server |
| `npm run build` / `npm start` | Build & jalankan produksi |
| `npm run lint` | ESLint |
| `npm run db:push` | Terapkan schema Drizzle ke Turso |
| `npm run db:generate` / `db:migrate` | Migrasi berbasis file (opsional) |
| `npm run db:studio` | Drizzle Studio |
| `npm run create-admin -- "<email>" "<password>"` | Buat / reset akun admin |

## Struktur singkat

```
src/
├─ app/
│  ├─ (public)/            # situs publik (Beranda, Berita, Karir, dll)
│  ├─ admin/               # CMS admin (login + panel terproteksi)
│  ├─ layout.tsx           # root layout
│  └─ globals.css          # token Tailwind v4 + utilitas glass
├─ components/             # Navbar, Footer, kartu, section, ui/ (shadcn)
├─ lib/
│  ├─ db/                  # Drizzle client + schema (Turso)
│  ├─ data/                # query publik (news, jobs) — cached
│  ├─ auth/                # password (scrypt), session (jose), guard
│  └─ validators/          # Zod + batas upload
└─ proxy.ts                # proteksi rute /admin (Next 16 "proxy")
```

## Catatan

- **Upload**: CV & gambar sampul dibatasi **5 MB**. Karena Turso tidak punya object
  storage, CV disimpan sebagai BLOB dan gambar sampul sebagai data URL.
- **Keamanan**: rahasia hanya di server (`server-only`), sesi cookie httpOnly,
  server action admin memverifikasi sesi (`requireAdmin`).
- Panduan setup lengkap (Turso, rules, deploy) ada di **[SETUP.md](./SETUP.md)**.