import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

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
