// Clone one Turso database into another, exactly: schema (verbatim DDL from the
// source's sqlite_master, drift and all) plus every row of every table —
// admin_users with their password hashes included.
//
// Usage:
//   npm run db:clone                       # .env.development.local → .env.production.local
//   npm run db:clone -- --from a --to b    # any pair of env files
//   npm run db:clone -- --force            # drop what the target already has first
//   npm run db:clone -- --dry-run          # only report what would be copied
//
// The target database must already exist (create it in the Turso dashboard or
// with `turso db create <name>`); this script never creates one.
const { config } = require("dotenv");
const { createClient } = require("@libsql/client");

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const has = (name) => args.includes(`--${name}`);

const FROM = flag("from", ".env.development.local");
const TO = flag("to", ".env.production.local");
const FORCE = has("force");
const DRY_RUN = has("dry-run");

/** Read an env file into its own object — dotenv keeps the first-set value, so
 *  loading two files into process.env would silently give both the same URL. */
function readEnv(path) {
  const env = {};
  const { error } = config({ path, processEnv: env, quiet: true });
  if (error) throw new Error(`Tidak bisa membaca ${path}: ${error.message}`);
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN"]) {
    if (!env[key]) throw new Error(`${key} kosong di ${path}`);
  }
  return env;
}

/** libSQL returns BLOBs as ArrayBuffer; @libsql/client only binds Buffers. */
function toBindable(value) {
  if (value instanceof ArrayBuffer) return Buffer.from(value);
  if (ArrayBuffer.isView(value)) {
    return Buffer.from(value.buffer, value.byteOffset, value.byteLength);
  }
  return value;
}

const sizeOf = (v) =>
  Buffer.isBuffer(v) ? v.byteLength : typeof v === "string" ? v.length : 8;

/** Batches stay well under libSQL's per-request ceiling; a single fat row
 *  (a 300 KB cover image) goes out on its own. */
const MAX_BATCH_BYTES = 400_000;
const MAX_BATCH_ROWS = 200;
const PAGE_ROWS = 100;

async function main() {
  const src = readEnv(FROM);
  const dst = readEnv(TO);

  if (src.TURSO_DATABASE_URL === dst.TURSO_DATABASE_URL) {
    throw new Error(
      `Sumber dan tujuan menunjuk database yang sama (${src.TURSO_DATABASE_URL}). Isi dulu ${TO} dengan kredensial DB baru.`,
    );
  }

  const from = createClient({
    url: src.TURSO_DATABASE_URL,
    authToken: src.TURSO_AUTH_TOKEN,
  });
  const to = createClient({
    url: dst.TURSO_DATABASE_URL,
    authToken: dst.TURSO_AUTH_TOKEN,
  });

  console.log(`Sumber : ${src.TURSO_DATABASE_URL}   (${FROM})`);
  console.log(`Tujuan : ${dst.TURSO_DATABASE_URL}   (${TO})`);
  console.log("");

  // 1. Read the source schema verbatim — tables first, then indexes/triggers/views.
  const schema = await from.execute(
    `select type, name, sql from sqlite_master
     where sql is not null and name not like 'sqlite_%'
     order by case type when 'table' then 0 else 1 end, name`,
  );
  const tables = schema.rows.filter((r) => r.type === "table").map((r) => r.name);

  // 2. Refuse to write over an existing database unless told to.
  const existing = await to.execute(
    `select name from sqlite_master where type = 'table' and name not like 'sqlite_%'`,
  );
  if (existing.rows.length > 0) {
    if (!FORCE) {
      throw new Error(
        `Database tujuan sudah berisi ${existing.rows.length} tabel (${existing.rows
          .map((r) => r.name)
          .join(", ")}). Jalankan ulang dengan --force untuk menghapusnya dulu.`,
      );
    }
    console.log(`--force: menghapus ${existing.rows.length} tabel di tujuan…`);
    if (!DRY_RUN) {
      for (const row of existing.rows) {
        await to.execute(`drop table if exists "${row.name}"`);
      }
    }
  }

  // 3. Recreate the schema.
  console.log(`Membuat ${schema.rows.length} objek schema…`);
  if (!DRY_RUN) {
    for (const row of schema.rows) await to.execute(row.sql);
  }

  // 4. Copy every row of every table.
  const summary = [];
  for (const table of tables) {
    const { rows: countRows } = await from.execute(
      `select count(*) as c from "${table}"`,
    );
    const total = Number(countRows[0].c);
    let copied = 0;

    for (let offset = 0; offset < total; offset += PAGE_ROWS) {
      const page = await from.execute({
        sql: `select * from "${table}" limit ? offset ?`,
        args: [PAGE_ROWS, offset],
      });
      if (page.rows.length === 0) break;

      const cols = page.columns;
      const columnList = cols.map((c) => `"${c}"`).join(", ");
      const placeholders = cols.map(() => "?").join(", ");
      const sql = `insert into "${table}" (${columnList}) values (${placeholders})`;

      let batch = [];
      let batchBytes = 0;
      const flush = async () => {
        if (batch.length === 0) return;
        if (!DRY_RUN) await to.batch(batch, "write");
        copied += batch.length;
        batch = [];
        batchBytes = 0;
      };

      for (const row of page.rows) {
        const values = cols.map((c) => toBindable(row[c]));
        const bytes = values.reduce((sum, v) => sum + sizeOf(v), 0);
        if (batch.length > 0 && (batchBytes + bytes > MAX_BATCH_BYTES ||
            batch.length >= MAX_BATCH_ROWS)) {
          await flush();
        }
        batch.push({ sql, args: values });
        batchBytes += bytes;
      }
      await flush();
    }

    summary.push({ table, source: total, copied });
    console.log(`  ${table.padEnd(20)} ${copied}/${total}`);
  }

  // 5. Verify by counting on the target itself.
  console.log("");
  let mismatch = false;
  for (const row of summary) {
    const check = DRY_RUN
      ? row.source
      : Number((await to.execute(`select count(*) as c from "${row.table}"`)).rows[0].c);
    const ok = check === row.source;
    if (!ok) mismatch = true;
    console.log(
      `${ok ? "✅" : "❌"} ${row.table.padEnd(20)} sumber ${row.source} → tujuan ${check}`,
    );
  }

  if (DRY_RUN) console.log("\n(dry-run: tidak ada yang ditulis)");
  else if (mismatch) throw new Error("Jumlah baris tidak cocok — periksa lagi.");
  else console.log("\n✅ Clone selesai, semua tabel cocok.");
}

main().catch((e) => {
  console.error("❌ Gagal:", e.message);
  process.exit(1);
});
