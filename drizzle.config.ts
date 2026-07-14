import { config } from "dotenv";
import type { Config } from "drizzle-kit";

// Load .env.local (Next.js convention) with .env as fallback.
config({ path: ".env.local" });
config();

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
} satisfies Config;
