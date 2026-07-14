// Create (or reset the password of) an admin user in Turso.
// Usage: npm run create-admin -- <email> <password>
require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@libsql/client");
const { randomBytes, scryptSync, randomUUID } = require("crypto");

const [, , emailArg, passwordArg] = process.argv;
if (!emailArg || !passwordArg) {
  console.error('Usage: npm run create-admin -- "<email>" "<password>"');
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
  // Upsert by email (delete any existing, then insert) so re-running resets pw.
  await client.batch([
    { sql: "delete from admin_users where email = ?", args: [email] },
    {
      sql: "insert into admin_users (id, email, password_hash) values (?, ?, ?)",
      args: [randomUUID(), email, passwordHash],
    },
  ]);
  console.log(`✅ Admin siap: ${email}`);
})().catch((e) => {
  console.error("❌ Gagal:", e.message);
  process.exit(1);
});
