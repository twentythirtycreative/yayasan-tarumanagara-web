import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession, type SessionPayload } from "./session";
import { can, type AdminSection } from "./roles";

/**
 * Verify an admin session inside Server Actions / server code. This is
 * defense-in-depth: the proxy guards page navigation, but Server Actions are
 * POST endpoints that must authorize themselves too. Throws if not signed in.
 */
export async function requireAdmin(): Promise<SessionPayload> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);
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
