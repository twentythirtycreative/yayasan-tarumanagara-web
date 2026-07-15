import { config } from "dotenv";
import type { Config } from "drizzle-kit";

// Which env file drizzle-kit reads. Defaults to the DEV database.
// Target another DB (e.g. prod) via:
//   Windows PS:  $env:DOTENV_FILE=".env.production.local"; npm run db:push
//   bash:        DOTENV_FILE=.env.production.local npm run db:push
// dotenv keeps the first-set value, so the earliest existing file wins.
for (const path of [
  process.env.DOTENV_FILE,
  ".env.development.local",
  ".env.local",
  ".env",
].filter(Boolean) as string[]) {
  config({ path });
}

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
} satisfies Config;
