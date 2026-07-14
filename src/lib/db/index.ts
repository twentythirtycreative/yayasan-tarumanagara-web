import "server-only";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// Reuse a single libSQL client across hot reloads in dev.
const globalForDb = globalThis as unknown as {
  _turso?: ReturnType<typeof createClient>;
};

const client =
  globalForDb._turso ??
  createClient({
    url: process.env.TURSO_DATABASE_URL ?? "",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

if (process.env.NODE_ENV !== "production") globalForDb._turso = client;

export const db = drizzle(client, { schema });
export { schema };
