// Create (or reset the password / role of) an admin user in Turso.
// Usage: npm run create-admin -- <email> <password> [role] [--prod]
//   role: master (default, all access) | hr (lowongan + lamaran) | humas (berita)
//   --prod: target the prod DB (.env.production.local) instead of dev
const isProd = process.argv.includes("--prod");
require("dotenv").config({
  path: isProd ? ".env.production.local" : ".env.development.local",
});
const { createClient } = require("@libsql/client");
const { randomBytes, scryptSync, randomUUID } = require("crypto");

const ROLES = ["master", "hr", "humas"];

const [emailArg, passwordArg, roleArg = "master"] = process.argv
  .slice(2)
  .filter((a) => !a.startsWith("--"));
if (!emailArg || !passwordArg) {
  console.error(
    'Usage: npm run create-admin -- "<email>" "<password>" [master|hr|humas]',
  );
  process.exit(1);
}

const role = roleArg.trim().toLowerCase();
if (!ROLES.includes(role)) {
  console.error(`❌ Role tidak dikenal: "${roleArg}". Pilih: ${ROLES.join(", ")}`);
  process.exit(1);
}

const email = emailArg.trim().toLowerCase();
const salt = randomBytes(16);
const hash = scryptSync(passwordArg, salt, 64);
const passwordHash = `${salt.toString("hex")}:${hash.toString("hex")}`;

(async () => {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  // Self-healing: create the RBAC column on a database that predates it, so this
  // script works whether or not `migrate:admin-role` has been run.
  const info = await client.execute("pragma table_info(admin_users)");
  if (!info.rows.some((r) => r.name === "role")) {
    await client.execute(
      "alter table admin_users add column role text not null default 'master'",
    );
  }

  // Upsert by email (delete any existing, then insert) so re-running resets pw.
  await client.batch([
    { sql: "delete from admin_users where email = ?", args: [email] },
    {
      sql: "insert into admin_users (id, email, password_hash, role) values (?, ?, ?, ?)",
      args: [randomUUID(), email, passwordHash, role],
    },
  ]);
  console.log(
    `✅ Admin siap: ${email} (role: ${role}) di DB ${isProd ? "PROD" : "dev"}`,
  );
})().catch((e) => {
  console.error("❌ Gagal:", e.message);
  process.exit(1);
});
