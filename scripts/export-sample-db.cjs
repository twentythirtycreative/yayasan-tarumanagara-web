// Export the site's public content into a local SQLite file, so a contributor
// can develop against realistic data (TURSO_DATABASE_URL=file:local.db) without
// any database credentials.
//
// The whole schema is recreated, but rows are copied only from an allow-list:
//   news_categories, jobs, news (published only), governance_members
//   (published only), and the images those news and member rows reference.
// Every other table is created empty. That includes admin_users (password
// hashes), applications (applicants' personal data and CVs) and
// login_attempts, as well as any table added later, until it is listed here.
//
// Usage:
//   npm run db:export-sample                     # .env.development.local → sample.db
//   npm run db:export-sample -- --prod           # read .env.production.local instead
//   npm run db:export-sample -- --out other.db   # write a different file
//   npm run db:export-sample -- --force          # overwrite an existing output file
//
// Reading is read-only; the source database is never modified.
const fs = require("fs");
const path = require("path");
const { config } = require("dotenv");
const { createClient } = require("@libsql/client");

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const has = (name) => args.includes(`--${name}`);

const ENV_FILE = has("prod") ? ".env.production.local" : ".env.development.local";
const OUT = path.resolve(flag("out", "sample.db"));
const FORCE = has("force");

/** Tables whose rows may leave the source database, and which rows. */
const COPY = {
  news_categories: "select * from news_categories",
  jobs: "select * from jobs",
  news: "select * from news where published = 1",
  governance_members: "select * from governance_members where published = 1",
};

/** Image ids referenced as "/api/images/<id>" by the copied rows. */
const IMAGE_COLUMNS = { news: "cover_image_url", governance_members: "photo_url" };
const IMAGE_REF = /^\/api\/images\/([^/?#]+)/;

/** libSQL returns BLOBs as ArrayBuffer; @libsql/client only binds Buffers. */
function toBindable(value) {
  if (value instanceof ArrayBuffer) return Buffer.from(value);
  if (ArrayBuffer.isView(value)) {
    return Buffer.from(value.buffer, value.byteOffset, value.byteLength);
  }
  return value;
}

function insertStatements(table, result) {
  const cols = result.columns;
  const sql = `insert into "${table}" (${cols.map((c) => `"${c}"`).join(", ")}) values (${cols
    .map(() => "?")
    .join(", ")})`;
  return result.rows.map((row) => ({ sql, args: cols.map((c) => toBindable(row[c])) }));
}

async function main() {
  const env = {};
  const { error } = config({ path: ENV_FILE, processEnv: env, quiet: true });
  if (error) throw new Error(`Tidak bisa membaca ${ENV_FILE}: ${error.message}`);
  if (!env.TURSO_DATABASE_URL) throw new Error(`TURSO_DATABASE_URL kosong di ${ENV_FILE}`);

  if (fs.existsSync(OUT)) {
    if (!FORCE) {
      throw new Error(`${OUT} sudah ada. Jalankan ulang dengan --force untuk menimpanya.`);
    }
    fs.rmSync(OUT);
  }

  const from = createClient({
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_AUTH_TOKEN || undefined,
  });
  const to = createClient({ url: `file:${OUT.replace(/\\/g, "/")}` });

  console.log(`Sumber : ${env.TURSO_DATABASE_URL}   (${ENV_FILE})`);
  console.log(`Tujuan : ${OUT}`);
  console.log("");

  // 1. Recreate the full schema, tables first, then indexes/triggers/views.
  const schema = await from.execute(
    `select type, name, sql from sqlite_master
     where sql is not null and name not like 'sqlite_%'
     order by case type when 'table' then 0 else 1 end, name`,
  );
  for (const row of schema.rows) await to.execute(row.sql);
  const tables = schema.rows.filter((r) => r.type === "table").map((r) => r.name);

  // 2. Copy the allow-listed rows and collect the images they reference.
  const imageIds = new Set();
  const counts = {};
  for (const [table, query] of Object.entries(COPY)) {
    if (!tables.includes(table)) continue;
    const result = await from.execute(query);
    if (result.rows.length > 0) await to.batch(insertStatements(table, result), "write");
    counts[table] = result.rows.length;

    const column = IMAGE_COLUMNS[table];
    if (column) {
      for (const row of result.rows) {
        const match = IMAGE_REF.exec(String(row[column] ?? ""));
        if (match) imageIds.add(match[1]);
      }
    }
  }

  // 3. Copy the referenced images one at a time; each can be a few megabytes.
  let images = 0;
  for (const id of imageIds) {
    const result = await from.execute({ sql: "select * from images where id = ?", args: [id] });
    if (result.rows.length === 0) continue;
    await to.batch(insertStatements("images", result), "write");
    images++;
  }
  counts.images = images;

  // 4. Report what the file contains, read back from the file itself.
  for (const table of tables) {
    const { rows } = await to.execute(`select count(*) as c from "${table}"`);
    const n = Number(rows[0].c);
    const note = table in counts ? "" : "  (tidak disalin)";
    console.log(`  ${table.padEnd(20)} ${String(n).padStart(4)}${note}`);
  }

  const size = (fs.statSync(OUT).size / 1024 / 1024).toFixed(1);
  console.log(`\n✅ Selesai: ${OUT} (${size} MB)`);
  console.log("   Kirim file ini ke kolaborator; dia menyimpannya sebagai local.db di root project.");
}

main().catch((e) => {
  console.error("❌ Gagal:", e.message);
  process.exit(1);
});
