"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Lock, Mail, LogIn, AlertCircle } from "lucide-react";
import { login, type LoginState } from "../auth-actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 inline-flex h-11 items-center justify-center gap-2 glass-rim glass-btn-primary rounded-xl text-sm font-semibold transition-transform hover:scale-[1.02] disabled:opacity-70"
    >
      {pending ? (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      ) : (
        <>
          <LogIn className="h-4 w-4" /> Masuk
        </>
      )}
    </button>
  );
}

export default function AdminLoginPage() {
  const [state, action] = useActionState<LoginState, FormData>(login, {});

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-[#00224f] via-[#00357d] to-[#013275] px-6">
      <div className="w-full max-w-[420px] rounded-[28px] border border-white/15 bg-white/95 p-8 shadow-[0px_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#00357d] to-[#004db6] text-white shadow-lg">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-title-1 font-extrabold text-[#00224f]">
            Admin Tarumanagara
          </h1>
          <p className="mt-1 text-caption text-ink/60">
            Masuk untuk mengelola berita &amp; lamaran
          </p>
        </div>

        <form action={action} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-caption font-medium text-ink/80">Email</span>
            <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 focus-within:border-[#014aaf] focus-within:ring-2 focus-within:ring-[#014aaf]/20">
              <Mail className="h-4 w-4 text-ink/40" />
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="admin@tarumanagara.org"
                className="h-11 w-full bg-transparent text-sm outline-none"
              />
            </div>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-caption font-medium text-ink/80">Kata Sandi</span>
            <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 focus-within:border-[#014aaf] focus-within:ring-2 focus-within:ring-[#014aaf]/20">
              <Lock className="h-4 w-4 text-ink/40" />
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-11 w-full bg-transparent text-sm outline-none"
              />
            </div>
          </label>

          {state.error && (
            <p className="flex items-center gap-1.5 text-caption font-medium text-[#dc2626]">
              <AlertCircle className="h-4 w-4" /> {state.error}
            </p>
          )}

          <SubmitButton />
        </form>

        <p className="mt-6 text-center text-xs text-ink/40">
          Autentikasi Yayasan Tarumanagara
        </p>
      </div>
    </main>
  );
}
