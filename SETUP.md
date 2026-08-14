# Yayasan Tarumanagara — Web Setup

Situs Next.js 16 + Tailwind v4 + shadcn/ui, dengan **Turso** (libSQL / SQLite)
via **Drizzle ORM** untuk fitur CRUD (Kirim CV & Berita/Kegiatan).
Deploy target: Vercel.

## 1. Jalankan secara lokal

```bash
npm install
cp .env.example .env.local   # lalu isi nilai dari Turso
npm run dev                  # http://localhost:3000
```

Tanpa `.env.local`, situs publik tetap tampil (Berita memakai data contoh);
fitur simpan/upload baru aktif setelah Turso dikonfigurasi.

## 2. Buat database Turso

Install CLI: https://docs.turso.tech/cli/installation, lalu:

```bash
turso auth login
turso db create yayasan-tarumanagara
turso db show yayasan-tarumanagara --url        # → TURSO_DATABASE_URL (libsql://…)
turso db tokens create yayasan-tarumanagara     # → TURSO_AUTH_TOKEN
```

Isi keduanya di `.env.local` (lihat `.env.example`).

## 3. Buat tabel (Drizzle)

Schema ada di `src/lib/db/schema.ts` (tabel `news`, `jobs`, `applications`).

```bash
npm run db:push        # terapkan schema langsung ke Turso
# atau berbasis migrasi:
npm run db:generate    # buat file SQL di ./drizzle
npm run db:migrate     # terapkan migrasi
npm run db:studio      # (opsional) buka Drizzle Studio
```

## 4. Penyimpanan file CV

Turso adalah database, **bukan object storage**. File CV disimpan sebagai
**BLOB** di kolom `cv_data` tabel `applications` (bersama `cv_name` & `cv_type`).
Batas ukuran 5 MB divalidasi di server action `Kirim CV`
(`src/app/(public)/karir/kirim-cv/actions.ts`). Cocok untuk volume situs ini;
bila nanti butuh storage terpisah (mis. S3/R2), cukup ubah action tersebut.

## 5. Autentikasi admin

Admin login (`/admin/login`) tervalidasi terhadap tabel `admin_users` di Turso
(password di-hash scrypt). Sesi disimpan sebagai cookie JWT bertanda-tangan
(`jose`), rute `/admin/*` dilindungi `src/middleware.ts`.

1. Set `AUTH_SECRET` di `.env.local` (rahasia acak — lihat `.env.example`).
2. Tambahkan kolom RBAC `role` pada database yang dibuat sebelum fitur ini
   (aman dijalankan berulang; akun lama otomatis jadi `master`):

```bash
npm run migrate:admin-role
```

3. Buat akun admin (bisa diulang untuk reset password / ganti role):

```bash
npm run create-admin -- "admin@domain.com" "kata-sandi-kuat" master
npm run create-admin -- "hr@domain.com"    "kata-sandi-kuat" hr
npm run create-admin -- "humas@domain.com" "kata-sandi-kuat" humas
```

4. Login di `/admin/login`. Tombol **Keluar** menghapus sesi.

### Hak akses (RBAC)

Definisi terpusat di `src/lib/auth/roles.ts`.

| Role | Label | Berita & Kegiatan | Tata Kelola | Lowongan Kerja | Lamaran (CV) |
| --- | --- | :-: | :-: | :-: | :-: |
| `master` | Admin Master | ✅ | ✅ | ✅ | ✅ |
| `hr` | HR | — | — | ✅ | ✅ |
| `humas` | Humas | ✅ | — | — | — |

Dashboard bisa diakses semua role, tapi kartu & ringkasannya ikut dibatasi.
Penegakan berlapis: `src/proxy.ts` menjaga navigasi halaman, `requireSection()`
di `src/lib/auth/guard.ts` menjaga setiap Server Action dan route CV, dan sidebar
hanya menampilkan menu yang boleh diakses.

## 6. Deploy ke Vercel

1. Push repo ke GitHub.
2. Import di Vercel, framework Next.js terdeteksi otomatis.
3. Tambahkan environment variables `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `AUTH_SECRET`.
4. Deploy.

---

## Status implementasi

**Selesai**
- Scaffold Next.js 16 + Tailwind v4 + shadcn/ui + Plus Jakarta Sans.
- Design system: token warna brand, utilitas glassmorphism (`.glass`, `.glass-dark`, `.glass-card`).
- Navbar (glass, transisi saat scroll) + Footer, responsif.
- Halaman publik: Beranda, Tentang Kami, Sambutan, Karir, Unit `[slug]`, Berita (list + detail).
- Form **Kirim CV** (validasi Zod + upload) — server action menyimpan ke Turso (Drizzle), CV sebagai BLOB.
- Infrastruktur DB: Drizzle + libSQL client (`src/lib/db/`), `drizzle.config.ts` dialect `turso`.
- Area admin `/admin` (frontend): login, dashboard, CRUD Berita, CRUD Lowongan, daftar Lamaran — masih data in-memory.

**Belum (milestone berikutnya — butuh Turso aktif)**
- Ganti data contoh Berita (`src/lib/data/news.ts`) & store admin (`src/app/admin/_store.tsx`) dengan query Drizzle/Turso.
- Autentikasi admin nyata + proteksi route `/admin`.
- Unduh CV dari BLOB di halaman Lamaran.
