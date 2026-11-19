import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { SESSION_COOKIE, verifySession, type SessionPayload } from "./session";
import { passwordFingerprint } from "./password";
import { can, isAdminRole, type AdminSection } from "./roles";

/**
 * The signed-in admin, or null. Beyond verifying the token, this checks the
 * account against the database: the account must still exist and its password
 * must be the one the session was issued for. Changing a password, or
 * re-creating the account with `npm run create-admin`, therefore ends every
 * older session. The role is taken from the database, not the token.
 *
 * Cached per request, so a render that checks more than once queries once.
 */
export const getActiveAdmin = cache(async (): Promise<SessionPayload | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);
  if (!session) return null;

  const [account] = await db
    .select({
      email: schema.adminUsers.email,
      role: schema.adminUsers.role,
      passwordHash: schema.adminUsers.passwordHash,
    })
    .from(schema.adminUsers)
    .where(eq(schema.adminUsers.id, session.sub))
    .limit(1);

  if (!account || !isAdminRole(account.role)) return null;
  if (passwordFingerprint(account.passwordHash) !== session.pv) return null;
  return { ...session, email: account.email, role: account.role };
});

/**
 * Verify an admin session inside Server Actions / server code. This is
 * defense-in-depth: the proxy guards page navigation, but Server Actions are
 * POST endpoints that must authorize themselves too. Throws if not signed in.
 */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getActiveAdmin();
  if (!session) throw new Error("Unauthorized");
  return session;
}

/**
 * Same, plus RBAC: the signed-in role must own `section`. Every write action
 * goes through this — hiding a nav item only hides the link, the Server Action
 * behind it stays callable by anyone with a session.
 */
export async function requireSection(section: AdminSection): Promise<SessionPayload> {
  const session = await requireAdmin();
  if (!can(session.role, section)) throw new Error("Forbidden");
  return session;
}
