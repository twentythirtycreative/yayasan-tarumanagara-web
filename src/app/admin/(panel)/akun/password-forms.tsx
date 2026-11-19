"use client";

import { useActionState, useState, useTransition } from "react";
import { toast } from "sonner";
import { AlertCircle, KeyRound, RotateCcw } from "lucide-react";
import { ROLE_LABELS, type AdminRole } from "@/lib/auth/roles";
import {
  changeOwnPassword,
  resetAdminPassword,
  type PasswordFormState,
} from "../../account-actions";
import { useConfirm } from "../confirm";

const field =
  "w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-[#014aaf] focus:ring-2 focus:ring-[#014aaf]/20";
const labelCls = "text-sm font-medium text-ink/80";
const primaryBtn =
  "glass-rim inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00357d] to-[#0060e3] px-5 text-sm font-semibold text-[#f5f5f5] shadow-[0px_4px_13.8px_rgba(0,0,0,0.12)] transition-transform hover:scale-[1.03] disabled:opacity-70 disabled:hover:scale-100";

function PasswordField({
  id,
  name,
  label,
  value,
  onChange,
  visible,
  autoComplete,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  visible: boolean;
  autoComplete: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className={field}
      />
    </div>
  );
}

function ShowToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-ink/70">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[#014aaf]"
      />
      Tampilkan kata sandi
    </label>
  );
}

function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="flex items-center gap-1.5 text-sm font-medium text-[#dc2626]">
      <AlertCircle className="h-4 w-4 shrink-0" /> {message}
    </p>
  );
}

export function ChangePasswordForm({ email, role }: { email: string; role: AdminRole }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [visible, setVisible] = useState(false);

  const [state, formAction, pending] = useActionState(
    async (prev: PasswordFormState, formData: FormData) => {
      const result = await changeOwnPassword(prev, formData);
      if (result.success) {
        setCurrent("");
        setNext("");
        setConfirmation("");
        toast.success(result.success);
      }
      return result;
    },
    {},
  );

  return (
    <form action={formAction} className="glass-rim glass-card flex flex-col gap-4 rounded-[18px] p-5 sm:p-6">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold text-[#00224f]">
          <KeyRound className="h-5 w-5" /> Ganti Kata Sandi
        </h2>
        <p className="mt-1 text-sm text-ink/60">
          Akun: <span className="font-semibold text-ink/80">{email}</span> ({ROLE_LABELS[role]})
        </p>
      </div>

      <PasswordField
        id="currentPassword"
        name="currentPassword"
        label="Kata Sandi Saat Ini"
        value={current}
        onChange={setCurrent}
        visible={visible}
        autoComplete="current-password"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <PasswordField
          id="newPassword"
          name="newPassword"
          label="Kata Sandi Baru"
          value={next}
          onChange={setNext}
          visible={visible}
          autoComplete="new-password"
        />
        <PasswordField
          id="confirmPassword"
          name="confirmPassword"
          label="Ulangi Kata Sandi Baru"
          value={confirmation}
          onChange={setConfirmation}
          visible={visible}
          autoComplete="new-password"
        />
      </div>
      <p className="text-xs text-ink/50">
        Minimal 8 karakter. Setelah diganti, sesi akun ini di perangkat lain otomatis keluar.
      </p>
      <ShowToggle checked={visible} onChange={setVisible} />
      <FormError message={state.error} />
      <div>
        <button type="submit" disabled={pending} className={primaryBtn}>
          {pending ? "Menyimpan…" : "Simpan Kata Sandi"}
        </button>
      </div>
    </form>
  );
}

export type AccountOption = { id: string; email: string; role: AdminRole };

export function ResetPasswordForm({ accounts }: { accounts: AccountOption[] }) {
  const confirm = useConfirm();
  const [accountId, setAccountId] = useState("");
  const [next, setNext] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [visible, setVisible] = useState(false);
  const [, startTransition] = useTransition();

  const [state, formAction, pending] = useActionState(
    async (prev: PasswordFormState, formData: FormData) => {
      const result = await resetAdminPassword(prev, formData);
      if (result.success) {
        setAccountId("");
        setNext("");
        setConfirmation("");
        toast.success(result.success);
      }
      return result;
    },
    {},
  );

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const target = accounts.find((a) => a.id === accountId);
    if (target) {
      const ok = await confirm({
        title: "Atur ulang kata sandi?",
        description: `Kata sandi ${target.email} akan diganti dan semua sesinya otomatis keluar.`,
        confirmText: "Atur Ulang",
        variant: "danger",
      });
      if (!ok) return;
    }
    startTransition(() => formAction(formData));
  };

  return (
    <form onSubmit={onSubmit} className="glass-rim glass-card flex flex-col gap-4 rounded-[18px] p-5 sm:p-6">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold text-[#00224f]">
          <RotateCcw className="h-5 w-5" /> Atur Ulang Kata Sandi Akun Lain
        </h2>
        <p className="mt-1 text-sm text-ink/60">
          Khusus Admin Master, untuk akun yang lupa kata sandi atau yang pemiliknya sudah tidak
          bertugas.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="accountId" className={labelCls}>
          Akun
        </label>
        <select
          id="accountId"
          name="accountId"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          className={field}
        >
          <option value="">Pilih akun</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.email} ({ROLE_LABELS[a.role]})
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <PasswordField
          id="resetNewPassword"
          name="newPassword"
          label="Kata Sandi Baru"
          value={next}
          onChange={setNext}
          visible={visible}
          autoComplete="new-password"
        />
        <PasswordField
          id="resetConfirmPassword"
          name="confirmPassword"
          label="Ulangi Kata Sandi Baru"
          value={confirmation}
          onChange={setConfirmation}
          visible={visible}
          autoComplete="new-password"
        />
      </div>
      <ShowToggle checked={visible} onChange={setVisible} />
      <FormError message={state.error} />
      <div>
        <button type="submit" disabled={pending} className={primaryBtn}>
          {pending ? "Menyimpan…" : "Atur Ulang Kata Sandi"}
        </button>
      </div>
    </form>
  );
}
