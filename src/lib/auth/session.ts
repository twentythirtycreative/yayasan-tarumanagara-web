import { SignJWT, jwtVerify } from "jose";
import { isAdminRole, type AdminRole } from "./roles";

// Shared by the proxy (src/proxy.ts) and server code, so callers pass the token
// in. No next/headers here.
export const SESSION_COOKIE = "admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * `pv` is the password fingerprint at sign-in (see `passwordFingerprint`).
 * The proxy cannot check it without a database query, so it is compared
 * against the stored hash by `requireAdmin`.
 */
export type SessionPayload = { sub: string; email: string; role: AdminRole; pv: string };

const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET ?? "");

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email, role: payload.role, pv: payload.pv })
    .setSubject(payload.sub)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret());
}

export async function verifySession(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token || !process.env.AUTH_SECRET) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    // Fail closed: a token without a recognised role or a password fingerprint
    // grants no access. The holder simply has to sign in again.
    const role = payload.role;
    if (!isAdminRole(role) || typeof payload.pv !== "string") return null;
    return { sub: String(payload.sub), email: String(payload.email), role, pv: payload.pv };
  } catch {
    return null;
  }
}
