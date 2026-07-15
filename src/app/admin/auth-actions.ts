"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession } from "@/lib/auth/session";

export type LoginState = { error?: string };

// Brute-force throttle: max failed attempts per email within a rolling window.
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// The throttle is best-effort: every DB call is wrapped so a missing/unavailable
// `login_attempts` table degrades to "no throttling" instead of breaking login.
async function getAttempt(email: string) {
  try {
    const [row] = await db
      .select()
      .from(schema.loginAttempts)
      .where(eq(schema.loginAttempts.email, email));
    return row ?? null;
  } catch {
    return null;
  }
}

/** Record a failed attempt (resets the counter once the window has elapsed). */
async function recordFailure(email: string, now: number): Promise<void> {
  try {
    const row = await getAttempt(email);
    const iso = new Date(now).toISOString();
    const withinWindow = row && now - Date.parse(row.windowStart) < WINDOW_MS;
    const count = withinWindow ? row.count + 1 : 1;
    const windowStart = withinWindow ? row.windowStart : iso;
    await db
      .insert(schema.loginAttempts)
      .values({ email, count, windowStart, updatedAt: iso })
      .onConflictDoUpdate({
        target: schema.loginAttempts.email,
        set: { count, windowStart, updatedAt: iso },
      });
  } catch {
    // best-effort — never block login on the throttle store
  }
}

async function clearAttempts(email: string): Promise<void> {
  try {
    await db.delete(schema.loginAttempts).where(eq(schema.loginAttempts.email, email));
  } catch {
    // best-effort
  }
}

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email dan kata sandi wajib diisi." };
  }

  // Throttle: block once too many recent failures pile up for this email.
  const now = Date.now();
  const attempt = await getAttempt(email);
  if (attempt && attempt.count >= MAX_ATTEMPTS) {
    const elapsed = now - Date.parse(attempt.windowStart);
    if (elapsed < WINDOW_MS) {
      const mins = Math.ceil((WINDOW_MS - elapsed) / 60000);
      return {
        error: `Terlalu banyak percobaan gagal. Coba lagi dalam ${mins} menit.`,
      };
    }
  }

  const [user] = await db
    .select()
    .from(schema.adminUsers)
    .where(eq(schema.adminUsers.email, email))
    .limit(1);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    await recordFailure(email, now);
    return { error: "Email atau kata sandi salah." };
  }

  // Success → clear the failure counter for this email.
  await clearAttempts(email);

  const token = await signSession({ sub: user.id, email: user.email });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  redirect("/admin");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/admin/login");
}
