"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { applicationSchema } from "@/lib/validators/application";
import {
  ACCEPTED_CV_TYPES,
  MAX_CV_SIZE,
  formatMB,
} from "@/lib/validators/upload";
import { countryCodes } from "@/lib/data/country-codes";
import { FieldError } from "@/components/form-error";
import { GlassSelect, type SelectOption } from "@/components/glass-select";
import { submitApplication, type ActionState } from "./actions";

const initialState: ActionState = { ok: false, message: "" };

// Figma 222:824 — underline fields, dark labels on the light glass panel.
const labelCls = "text-[14px] font-medium text-[#262626]";
const inputCls =
  "w-full border-0 border-b-[1.5px] border-[#d9d9d9] bg-transparent pb-1.5 text-[16px] font-medium text-[#262626] caret-[#015ddb] outline-none transition-colors placeholder:text-[#9f9f9f] focus:border-[#015ddb]";
const inputErrCls =
  "w-full border-0 border-b-[1.5px] border-[#dc2626] bg-transparent pb-1.5 text-[16px] font-medium text-[#262626] caret-[#dc2626] outline-none transition-colors placeholder:text-[#9f9f9f]";

type CvErrors = Partial<
  Record<
    "fullName" | "email" | "phone" | "university" | "major" | "position" | "cv",
    string
  >
>;

function SubmitButton({ sent }: { sent: boolean }) {
  const { pending } = useFormStatus();
  const showSent = sent && !pending;
  return (
    <button
      type="submit"
      disabled={pending || showSent}
      style={
        showSent
          ? {
              backgroundImage:
                "linear-gradient(267.62deg, #58D170 0.83%, #369249 99.21%)",
            }
          : undefined
      }
      className={cn(
        "inline-flex h-[46px] min-w-[110px] items-center justify-center gap-2 rounded-[66px] px-8 text-[18px] font-semibold text-[#f5f5f5] shadow-[0px_4px_13.8px_rgba(0,0,0,0.12)] transition-[transform,background] duration-300",
        showSent
          ? "cursor-default"
          : "cursor-pointer bg-gradient-to-r from-[#00357d] to-[#0060e3] hover:scale-[1.03] disabled:cursor-default disabled:hover:scale-100",
      )}
    >
      {pending ? (
        <span
          aria-label="Mengirim"
          className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white"
        />
      ) : showSent ? (
        "Terkirim"
      ) : (
        "Kirim"
      )}
    </button>
  );
}

export function CvForm({
  positions,
}: {
  positions: Array<{ id: string; title: string }>;
}) {
  const [state, formAction] = useActionState(submitApplication, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [fileName, setFileName] = useState("");
  const [countryIso, setCountryIso] = useState("ID");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [position, setPosition] = useState("");
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<CvErrors>({});
  const [attempted, setAttempted] = useState(false);

  const dial = countryCodes.find((c) => c.iso === countryIso)?.dial ?? "+62";

  // Validate against the shared zod schema (same rules the server enforces),
  // reading the uncontrolled text inputs from the DOM. `overrides` lets a change
  // handler pass the value it just set, since that state update isn't visible yet
  // within the same tick.
  const computeErrors = (overrides?: {
    phoneNumber?: string;
    position?: string;
    fileName?: string;
  }): CvErrors => {
    const pn = overrides?.phoneNumber ?? phoneNumber;
    const pos = overrides?.position ?? position;
    const fn = overrides?.fileName ?? fileName;

    const form = formRef.current;
    const fd = form ? new FormData(form) : null;
    const get = (k: string) => String(fd?.get(k) ?? "").trim();

    const errs: CvErrors = {};
    const parsed = applicationSchema.safeParse({
      fullName: get("fullName"),
      email: get("email"),
      phone: pn.trim() ? `${dial} ${pn}`.trim() : "",
      university: get("university"),
      major: get("major"),
      position: pos,
    });
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof CvErrors;
        if (key && !errs[key]) errs[key] = issue.message;
      }
    }
    // Friendlier message for a completely empty phone number.
    if (!pn.trim()) errs.phone = "Nomor telepon wajib diisi";
    if (!fn) errs.cv = "CV wajib diunggah";
    return errs;
  };

  // Once submit has been attempted, keep errors live as fields are corrected.
  const revalidate = (overrides?: {
    phoneNumber?: string;
    position?: string;
    fileName?: string;
  }) => {
    if (attempted) setErrors(computeErrors(overrides));
  };

  const countryOptions = useMemo<SelectOption[]>(
    () =>
      countryCodes.map((c) => ({
        value: c.iso,
        label: `${c.flag}  ${c.name}  (${c.dial})`,
        keywords: `${c.name} ${c.dial} ${c.iso}`,
        trigger: (
          <span className="flex items-center gap-1.5">
            <span>{c.flag}</span>
            <span>{c.dial}</span>
          </span>
        ),
      })),
    [],
  );

  const positionOptions = useMemo<SelectOption[]>(
    () => positions.map((job) => ({ value: job.id, label: job.title })),
    [positions],
  );

  useEffect(() => {
    if (!state.message) return;
    if (state.ok) {
      toast.success(state.message);
      // Reset the filled form and flash the green "Terkirim" state.
      formRef.current?.reset();
      setFileName("");
      setPhoneNumber("");
      setPosition("");
      setCountryIso("ID");
      setSent(true);
      const t = setTimeout(() => setSent(false), 2600);
      return () => clearTimeout(t);
    }
    toast.error(state.message);
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      noValidate
      onSubmit={(e) => {
        setAttempted(true);
        const next = computeErrors();
        setErrors(next);
        if (Object.keys(next).length > 0) {
          e.preventDefault();
          toast.error("Lengkapi dulu bagian yang wajib diisi.");
        }
      }}
      className="flex flex-col gap-7"
    >
      {/* Row 1 — Nama Lengkap + Alamat Email */}
      <div className="grid gap-x-[68px] gap-y-7 sm:grid-cols-2">
        <Field
          label="Nama Lengkap"
          name="fullName"
          placeholder="Andie"
          error={errors.fullName}
          onValueChange={revalidate}
        />
        <Field
          label="Alamat Email"
          name="email"
          type="email"
          error={errors.email}
          onValueChange={revalidate}
        />
      </div>

      {/* Nomor Telepon — glass country-code dropdown + number */}
      <div className="flex flex-col gap-3">
        <label className={labelCls}>Nomor Telepon</label>
        <div
          className={cn(
            "flex items-center gap-3 border-b-[1.5px]",
            errors.phone ? "border-[#dc2626]" : "border-[#d9d9d9] focus-within:border-[#015ddb]",
          )}
        >
          <GlassSelect
            options={countryOptions}
            value={countryIso}
            onChange={setCountryIso}
            searchable
            triggerClassName="w-auto shrink-0 pb-1.5 text-[16px] font-medium text-[#262626]"
            panelClassName="min-w-[280px]"
          />
          <input
            inputMode="tel"
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
              revalidate({ phoneNumber: e.target.value });
            }}
            aria-invalid={Boolean(errors.phone)}
            className="w-full border-0 bg-transparent pb-1.5 text-[16px] font-medium text-[#262626] caret-[#015ddb] outline-none"
          />
        </div>
        <input type="hidden" name="phone" value={`${dial} ${phoneNumber}`.trim()} />
        <FieldError message={errors.phone} />
      </div>

      <Field
        label="Asal Universitas"
        name="university"
        error={errors.university}
        onValueChange={revalidate}
      />
      <Field
        label="Jurusan"
        name="major"
        error={errors.major}
        onValueChange={revalidate}
      />

      {/* Posisi yang Dilamar — glass dropdown */}
      <div className="flex flex-col gap-3">
        <label className={labelCls}>Posisi yang Dilamar</label>
        <GlassSelect
          options={positionOptions}
          value={position}
          onChange={(v) => {
            setPosition(v);
            revalidate({ position: v });
          }}
          placeholder={
            positions.length > 0 ? "Pilih posisi" : "Belum ada lowongan dibuka"
          }
          triggerClassName={cn(
            "min-h-[27px] border-b-[1.5px] pb-1.5 text-[16px] font-medium text-[#262626]",
            errors.position ? "border-[#dc2626]" : "border-[#d9d9d9]",
          )}
        />
        <input type="hidden" name="position" value={position} />
        <FieldError message={errors.position} />
      </div>

      {/* Unggah CV Anda — glass Choose File button */}
      <div className="flex flex-col gap-3">
        <label className={labelCls}>Unggah CV Anda</label>
        <div className="flex items-center gap-3">
          <label
            className={cn(
              "glass-rim inline-flex h-[38px] cursor-pointer items-center rounded-[31px] border bg-[rgba(250,250,250,0.35)] px-5 text-[14px] font-medium text-[#262626] shadow-[0px_4px_13.8px_rgba(0,0,0,0.06)] backdrop-blur-md transition-colors hover:bg-white/60",
              errors.cv ? "border-[#dc2626]" : "border-[#ebebeb]",
            )}
          >
            Choose File
            <input
              type="file"
              name="cv"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) {
                  setFileName("");
                  return;
                }
                if (file.type && !ACCEPTED_CV_TYPES.includes(file.type)) {
                  toast.error("Format CV harus PDF atau Word.");
                  e.target.value = "";
                  setFileName("");
                  return;
                }
                if (file.size > MAX_CV_SIZE) {
                  toast.error(`Ukuran CV maksimal ${formatMB(MAX_CV_SIZE)}.`);
                  e.target.value = "";
                  setFileName("");
                  return;
                }
                setFileName(file.name);
                revalidate({ fileName: file.name });
              }}
            />
          </label>
          {fileName && (
            <span className="truncate text-[14px] text-[#262626]">{fileName}</span>
          )}
        </div>
        <p className="text-[13px] text-[#9f9f9f]">
          Format PDF atau Word, maksimal {formatMB(MAX_CV_SIZE)}.
        </p>
        <FieldError message={errors.cv} />
      </div>

      <div className="pt-1">
        <SubmitButton sent={sent} />
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  error,
  onValueChange,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  error?: string;
  onValueChange?: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <label htmlFor={name} className={labelCls}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        onChange={onValueChange}
        aria-invalid={Boolean(error)}
        className={error ? inputErrCls : inputCls}
      />
      <FieldError message={error} />
    </div>
  );
}
