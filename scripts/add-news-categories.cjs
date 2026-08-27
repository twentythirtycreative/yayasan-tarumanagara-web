// Add the `news_categories` table + `news.category_id` column (idempotent).
// Usage: npm run migrate:news-categories [-- --prod]
//
// Written by hand rather than left to `drizzle-kit push`: push created the
// table with an inline UNIQUE on `slug` (an sqlite autoindex) but without the
// named `news_categories_slug_unique` index it expects to find on the next run,
// so the run after that tried to DROP an index that never existed and failed.
// The three statements below produce exactly the shape the `news` table already
// has — inline UNIQUE plus the named index — which push then diffs cleanly.
const isProd = process.argv.includes("--prod");
require("dotenv").config({
  path: isProd ? ".env.production.local" : ".env.development.local",
});
const { createClient } = require("@libsql/client");

(async () => {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  console.log(isProd ? "🚀 Target: PRODUKSI" : "🧪 Target: development");

  await client.execute(`create table if not exists news_categories (
    id text primary key not null,
    name text not null,
    -- Uniqueness lives in the named index below, not an inline UNIQUE: an
    -- inline one adds a second, redundant sqlite autoindex on the same column
    -- and leaves the table a different shape from what drizzle-kit generates.
    slug text not null,
    sort_order integer default 0 not null,
    created_at text default CURRENT_TIMESTAMP not null,
    updated_at text default CURRENT_TIMESTAMP not null
  )`);
  console.log("✅ Tabel `news_categories` siap.");

  await client.execute(
    "create unique index if not exists `news_categories_slug_unique` on `news_categories` (`slug`)",
  );
  console.log("✅ Index `news_categories_slug_unique` siap.");

  // Nullable, no FK: see the note on `news.categoryId` in lib/db/schema.ts.
  const info = await client.execute("pragma table_info(news)");
  if (info.rows.some((r) => r.name === "category_id")) {
    console.log("ℹ️  Kolom `news.category_id` sudah ada.");
  } else {
    await client.execute("alter table news add column category_id text");
    console.log("✅ Kolom `news.category_id` ditambahkan.");
  }

  const news = await client.execute("select count(*) as c from news");
  const cats = await client.execute("select count(*) as c from news_categories");
  console.log(
    `📊 ${news.rows[0].c} berita, ${cats.rows[0].c} kategori — tidak ada data yang diubah.`,
  );
})().catch((e) => {
  console.error("❌ Gagal:", e.message);
  process.exit(1);
});
