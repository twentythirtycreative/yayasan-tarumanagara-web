"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { login, type LoginState } from "../auth-actions";
import { FieldError } from "@/components/form-error";

type LoginErrors = { email?: string; password?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateLogin(email: string, password: string): LoginErrors {
  const errors: LoginErrors = {};
  const em = email.trim();
  if (!em) errors.email = "Email wajib diisi.";
  else if (!EMAIL_RE.test(em)) errors.email = "Format email tidak valid.";
  if (!password) errors.password = "Kata sandi wajib diisi.";
  return errors;
}

// Match the established form style (Figma / cv-form): dark labels + underline
// fields on a light glass panel.
const labelCls = "text-[14px] font-medium text-[#262626]";
const inputCls =
  "w-full border-0 border-b-[1.5px] border-[#d9d9d9] bg-transparent pb-1.5 text-[16px] font-medium text-[#262626] caret-[#015ddb] outline-none transition-colors placeholder:text-[#9f9f9f] focus:border-[#015ddb]";
const inputWithError = (error?: string) =>
  error
    ? "w-full border-0 border-b-[1.5px] border-[#dc2626] bg-transparent pb-1.5 text-[16px] font-medium text-[#262626] caret-[#dc2626] outline-none transition-colors placeholder:text-[#9f9f9f]"
    : inputCls;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-1 inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-[66px] bg-gradient-to-r from-[#00357d] to-[#0060e3] text-[16px] font-semibold text-[#f5f5f5] shadow-[0px_4px_13.8px_rgba(0,0,0,0.12)] transition-transform duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
    >
      {pending ? (
        <span
          aria-label="Memproses"
          className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white"
        />
      ) : (
        "Masuk"
      )}
    </button>
  );
}

export default function AdminLoginPage() {
  const [state, action] = useActionState<LoginState, FormData>(login, {});
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [attempted, setAttempted] = useState(false);

  // Client-side guard: block the server action when the form is invalid, and
  // (once the user has tried to submit) keep errors in sync as they fix fields.
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setAttempted(true);
    const next = validateLogin(email, password);
    setErrors(next);
    if (Object.keys(next).length > 0) e.preventDefault();
  };
  const onEmailChange = (v: string) => {
    setEmail(v);
    if (attempted) setErrors(validateLogin(v, password));
  };
  const onPasswordChange = (v: string) => {
    setPassword(v);
    if (attempted) setErrors(validateLogin(email, v));
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Full-bleed grayscale brand image (same treatment as the "Tentang Kami"
          hero) — covers the whole screen; the card floats on top of it. */}
      <Image
        src="/images/about-hero.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_55%] grayscale brightness-[0.68] contrast-[1.3]"
      />
      <div className="absolute inset-0 bg-black/35" />

      {/* Content grid on top of the image: welcome copy (60) · card (40). */}
      <div className="relative z-10 grid min-h-screen lg:grid-cols-[minmax(0,700px)_auto] lg:justify-center lg:gap-x-6">
        {/* Left — welcome copy. Bottom-anchored on normal desktops (so it lines
            up with the card); centered on very large / zoomed-out screens where a
            bottom-pinned block would leave too much empty space up top. The logo
            is absolutely pinned to the top so it stays put in both modes. */}
        <div className="relative hidden flex-col justify-end py-12 pl-16 pr-0 lg:flex xl:py-16 xl:pl-24 xl:pr-2 2xl:justify-center">
          <Link
            href="/"
            className="absolute left-16 top-12 block aspect-[1834/383] w-[172px] xl:left-24 xl:top-16"
          >
            <Image
              src="/images/logo-white-trim.png"
              alt="Yayasan Tarumanagara"
              fill
              sizes="172px"
              className="object-contain object-left"
            />
          </Link>

          <div className="max-w-[600px]">
            <p className="text-caption font-semibold uppercase tracking-[0.18em] text-white/70">
              Panel Admin
            </p>
            <h2 className="mt-5 whitespace-nowrap bg-gradient-to-r from-[#fafafa] from-[35%] to-[#9fb6d8] bg-clip-text text-[clamp(3rem,5vw,4rem)] font-extrabold leading-[1.1] text-transparent">
              Selamat datang
              <br />
              kembali
            </h2>
            <p className="mt-4 text-body font-medium text-white/75">
              Kelola berita, lowongan, dan lamaran
              <br />
              Yayasan Tarumanagara dalam satu tempat.
            </p>
          </div>
        </div>

        {/* Right — login card floating over the image */}
        <div className="flex items-center justify-center px-6 py-12 lg:items-end lg:justify-start lg:pl-0 lg:pr-16 xl:py-16 xl:pl-2 xl:pr-24 2xl:items-center">
          <div className="flex w-full max-w-[420px] flex-col items-center">
          {/* Mobile-only logo above the card (on desktop it lives in the left panel) */}
          <Link href="/" className="relative mb-11 block aspect-[1834/383] w-[190px] lg:hidden">
            <Image
              src="/images/logo-white-trim.png"
              alt="Yayasan Tarumanagara"
              fill
              priority
              sizes="190px"
              className="object-contain"
            />
          </Link>
          <div className="glass-rim glass-card w-full rounded-[22px] bg-white/85 p-8 sm:p-10">
            <h1 className="text-title-1 font-extrabold text-[#262626]">
              Masuk
            </h1>
            <p className="mt-1.5 text-body font-medium text-[#262626]">
              Silakan masuk untuk melanjutkan ke panel admin.
            </p>

            <form
              action={action}
              onSubmit={handleSubmit}
              noValidate
              className="mt-9 flex flex-col gap-7"
            >
              <div className="flex flex-col gap-3">
                <label htmlFor="email" className={labelCls}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  autoComplete="email"
                  placeholder="Masukkan email"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={inputWithError(errors.email)}
                />
                <FieldError id="email-error" message={errors.email} />
              </div>

              <div className="flex flex-col gap-3">
                <label htmlFor="password" className={labelCls}>
                  Kata Sandi
                </label>
                <div
                  className={`flex items-center gap-2 border-b-[1.5px] transition-colors ${
                    errors.password
                      ? "border-[#dc2626]"
                      : "border-[#d9d9d9] focus-within:border-[#015ddb]"
                  }`}
                >
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={(e) => onPasswordChange(e.target.value)}
                    autoComplete="current-password"
                    placeholder="Masukkan kata sandi"
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    className="w-full border-0 bg-transparent pb-1.5 text-[16px] font-medium text-[#262626] caret-[#015ddb] outline-none placeholder:text-[#9f9f9f]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                    aria-pressed={showPassword}
                    className="mb-1.5 shrink-0 text-[#9f9f9f] transition-colors hover:text-[#015ddb]"
                  >
                    {showPassword ? (
                      <EyeOff className="h-[18px] w-[18px]" />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" />
                    )}
                  </button>
                </div>
                <FieldError id="password-error" message={errors.password} />
              </div>

              {state.error && (
                <p className="flex items-center gap-1.5 text-[14px] font-medium text-[#dc2626]">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {state.error}
                </p>
              )}

              <div className="pt-1">
                <SubmitButton />
              </div>
            </form>
          </div>
          <p className="mt-6 text-center text-xs font-medium text-white/60">
            Tarumanagara Foundation 2026©
          </p>
          </div>
        </div>
      </div>
    </main>
  );
}
