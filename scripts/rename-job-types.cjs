// One-off data migration: rename existing job `type` values to the new labels
//   "Fulltime" -> "Full-Time"
//   "Parttime" -> "Part-Time"
//
// Env is split per environment, so pick one explicitly:
//   node scripts/rename-job-types.cjs            # dev DB  (.env.development.local)
//   node scripts/rename-job-types.cjs --prod     # prod DB (.env.production.local)
//   ... add --dry-run to preview counts without writing.

const isProd = process.argv.includes("--prod");
const dryRun = process.argv.includes("--dry-run");
const envPath = isProd ? ".env.production.local" : ".env.development.local";

require("dotenv").config({ path: envPath });
const { createClient } = require("@libsql/client");

const RENAMES = [
  { from: "Fulltime", to: "Full-Time" },
  { from: "Parttime", to: "Part-Time" },
];

(async () => {
  if (!process.env.TURSO_DATABASE_URL) {
    console.error(`❌ TURSO_DATABASE_URL kosong. Cek file ${envPath}.`);
    process.exit(1);
  }

  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  console.log(
    `→ Target: ${isProd ? "PRODUCTION" : "development"} DB${dryRun ? " (dry-run)" : ""}\n`,
  );

  let total = 0;
  for (const { from, to } of RENAMES) {
    const { rows } = await client.execute({
      sql: "select count(*) as n from jobs where type = ?",
      args: [from],
    });
    const n = Number(rows[0].n);
    total += n;

    if (n === 0) {
      console.log(`•  "${from}": tidak ada baris untuk diubah.`);
      continue;
    }
    if (dryRun) {
      console.log(`•  "${from}" → "${to}": ${n} baris (akan diubah).`);
      continue;
    }
    await client.execute({
      sql: "update jobs set type = ? where type = ?",
      args: [to, from],
    });
    console.log(`✅ "${from}" → "${to}": ${n} baris diubah.`);
  }

  console.log(
    `\n${dryRun ? "Dry-run selesai." : "Selesai."} Total baris terpengaruh: ${total}.`,
  );
})().catch((e) => {
  console.error("❌ Gagal:", e.message);
  process.exit(1);
});
