"use server";

import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  hashPassword,
  passwordFingerprint,
  verifyPassword,
} from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session-cookie";

export type PasswordFormState = { error?: string; success?: string };

function checkNewPassword(password: string, confirmation: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Kata sandi baru minimal ${MIN_PASSWORD_LENGTH} karakter.`;
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return `Kata sandi baru maksimal ${MAX_PASSWORD_LENGTH} karakter.`;
  }
  if (password !== confirmation) return "Konfirmasi kata sandi tidak sama.";
  return null;
}

/** Any signed-in admin changes their own password. */
export async function changeOwnPassword(
  _prev: PasswordFormState,
  formData: FormData,
): Promise<PasswordFormState> {
  const session = await requireAdmin();
  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirmation = String(formData.get("confirmPassword") ?? "");

  if (!current) return { error: "Kata sandi saat ini wajib diisi." };
  const invalid = checkNewPassword(next, confirmation);
  if (invalid) return { error: invalid };
  if (next === current) {
    return { error: "Kata sandi baru harus berbeda dari kata sandi saat ini." };
  }

  const [account] = await db
    .select({ passwordHash: schema.adminUsers.passwordHash })
    .from(schema.adminUsers)
    .where(eq(schema.adminUsers.id, session.sub))
    .limit(1);
  if (!account || !verifyPassword(current, account.passwordHash)) {
    return { error: "Kata sandi saat ini salah." };
  }

  const passwordHash = hashPassword(next);
  await db
    .update(schema.adminUsers)
    .set({ passwordHash })
    .where(eq(schema.adminUsers.id, session.sub));

  // The new hash ends every existing session for this account, including this
  // one, so re-issue this browser's session to keep the user signed in here.
  await setSessionCookie({ ...session, pv: passwordFingerprint(passwordHash) });

  return {
    success:
      "Kata sandi berhasil diganti. Sesi di perangkat lain otomatis keluar.",
  };
}

/**
 * Admin Master sets a new password for another account, e.g. when its owner
 * has forgotten it or has left. Also lifts any sign-in lockout on that account.
 */
export async function resetAdminPassword(
  _prev: PasswordFormState,
  formData: FormData,
): Promise<PasswordFormState> {
  const session = await requireAdmin();
  if (session.role !== "master") {
    return { error: "Hanya Admin Master yang dapat mengatur ulang kata sandi akun lain." };
  }

  const targetId = String(formData.get("accountId") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirmation = String(formData.get("confirmPassword") ?? "");

  if (!targetId) return { error: "Pilih akun terlebih dahulu." };
  if (targetId === session.sub) {
    return { error: "Untuk akun Anda sendiri, gunakan formulir Ganti Kata Sandi." };
  }
  const invalid = checkNewPassword(next, confirmation);
  if (invalid) return { error: invalid };

  const [target] = await db
    .select({ email: schema.adminUsers.email })
    .from(schema.adminUsers)
    .where(eq(schema.adminUsers.id, targetId))
    .limit(1);
  if (!target) return { error: "Akun tidak ditemukan." };

  await db
    .update(schema.adminUsers)
    .set({ passwordHash: hashPassword(next) })
    .where(eq(schema.adminUsers.id, targetId));
  await db.delete(schema.loginAttempts).where(eq(schema.loginAttempts.email, target.email));

  return {
    success: `Kata sandi ${target.email} berhasil diatur ulang. Semua sesi akun itu otomatis keluar. Sampaikan kata sandi barunya langsung kepada pemilik akun.`,
  };
}
