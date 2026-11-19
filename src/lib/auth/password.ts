import "server-only";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";

/** Minimum length for a new password. */
export const MIN_PASSWORD_LENGTH = 8;
/** Upper bound, so a huge input can't make scrypt do pointless work. */
export const MAX_PASSWORD_LENGTH = 128;

/** Hash a password as scrypt "saltHex:hashHex" (Node crypto, no deps). */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

/** Constant-time verify against a stored "saltHex:hashHex". */
export function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const hash = Buffer.from(hashHex, "hex");
  const test = scryptSync(password, Buffer.from(saltHex, "hex"), hash.length);
  return hash.length === test.length && timingSafeEqual(hash, test);
}

/**
 * Short fingerprint of a stored password hash, carried in the session token.
 * Changing the password changes the hash (new salt), so every session issued
 * before the change stops matching and is rejected by `requireAdmin`. The
 * input includes the random salt, so the fingerprint reveals nothing usable
 * about the password itself.
 */
export function passwordFingerprint(storedHash: string): string {
  return createHash("sha256").update(storedHash).digest("hex").slice(0, 16);
}
