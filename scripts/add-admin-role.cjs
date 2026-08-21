// Add the RBAC `role` column to admin_users (idempotent).
// Usage: npm run migrate:admin-role [-- --prod]
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

  const info = await client.execute("pragma table_info(admin_users)");
  if (info.rows.some((r) => r.name === "role")) {
    console.log("ℹ️  Kolom `role` sudah ada — tidak ada perubahan.");
    return;
  }

  // Existing rows default to "master": before RBAC every account was all-access.
  await client.execute(
    "alter table admin_users add column role text not null default 'master'",
  );
  console.log("✅ Kolom `role` ditambahkan (semua akun lama → master).");
})().catch((e) => {
  console.error("❌ Gagal:", e.message);
  process.exit(1);
});
