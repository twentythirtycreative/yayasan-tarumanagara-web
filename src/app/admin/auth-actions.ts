"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession } from "@/lib/auth/session";

export type LoginState = { error?: string };

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email dan kata sandi wajib diisi." };
  }

  const [user] = await db
    .select()
    .from(schema.adminUsers)
    .where(eq(schema.adminUsers.email, email))
    .limit(1);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "Email atau kata sandi salah." };
  }

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
