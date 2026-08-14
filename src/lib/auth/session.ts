import { SignJWT, jwtVerify } from "jose";
import { isAdminRole, type AdminRole } from "./roles";

// Edge-safe (used by middleware + server actions). No next/headers here.
export const SESSION_COOKIE = "admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type SessionPayload = { sub: string; email: string; role: AdminRole };

const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET ?? "");

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email, role: payload.role })
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
    return {
      sub: String(payload.sub),
      email: String(payload.email),
      // Tokens issued before RBAC carry no role. The only account that existed
      // then is the all-access one, so treat a missing claim as "master".
      role: isAdminRole(payload.role) ? payload.role : "master",
    };
  } catch {
    return null;
  }
}
