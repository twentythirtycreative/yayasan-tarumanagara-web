import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession, type SessionPayload } from "./session";

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
