"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { positions } from "@/lib/validators/application";
import {
  ACCEPTED_CV_TYPES,
  MAX_CV_SIZE,
  formatMB,
} from "@/lib/validators/upload";
import { countryCodes } from "@/lib/data/country-codes";
import { GlassSelect, type SelectOption } from "./glass-select";
import { submitApplication, type ActionState } from "./actions";

const initialState: ActionState = { ok: false, message: "" };

// Figma 222:824 — underline fields, dark labels on the light glass panel.
const labelCls = "text-[14px] font-medium text-[#262626]";
const inputCls =
  "w-full border-0 border-b-[1.5px] border-[#d9d9d9] bg-transparent pb-1.5 text-[16px] font-medium text-[#262626] caret-[#015ddb] outline-none transition-colors placeholder:text-[#9f9f9f] focus:border-[#015ddb]";

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

export function CvForm() {
  const [state, formAction] = useActionState(submitApplication, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [fileName, setFileName] = useState("");
  const [countryIso, setCountryIso] = useState("ID");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [position, setPosition] = useState("");
  const [sent, setSent] = useState(false);

  const dial = countryCodes.find((c) => c.iso === countryIso)?.dial ?? "+62";

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
    () => positions.map((p) => ({ value: p, label: p })),
    [],
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
      onSubmit={(e) => {
        // The dropdown + file are custom/hidden, so guard them here; the native
        // text inputs use `required` and are blocked by the browser first.
        if (!phoneNumber.trim()) {
          e.preventDefault();
          toast.error("Nomor telepon wajib diisi");
        } else if (!position) {
          e.preventDefault();
          toast.error("Posisi yang dilamar wajib dipilih");
        } else if (!fileName) {
          e.preventDefault();
          toast.error("CV wajib diunggah");
        }
      }}
      className="flex flex-col gap-7"
    >
      {/* Row 1 — Nama Lengkap + Alamat Email */}
      <div className="grid gap-x-[68px] gap-y-7 sm:grid-cols-2">
        <Field label="Nama Lengkap" name="fullName" placeholder="Andie" />
        <Field label="Alamat Email" name="email" type="email" />
      </div>

      {/* Nomor Telepon — glass country-code dropdown + number */}
      <div className="flex flex-col gap-3">
        <label className={labelCls}>Nomor Telepon</label>
        <div className="flex items-center gap-3 border-b-[1.5px] border-[#d9d9d9] focus-within:border-[#015ddb]">
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
            required
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full border-0 bg-transparent pb-1.5 text-[16px] font-medium text-[#262626] caret-[#015ddb] outline-none"
          />
        </div>
        <input type="hidden" name="phone" value={`${dial} ${phoneNumber}`.trim()} />
      </div>

      <Field label="Asal Universitas" name="university" />
      <Field label="Jurusan" name="major" />

      {/* Posisi yang Dilamar — glass dropdown */}
      <div className="flex flex-col gap-3">
        <label className={labelCls}>Posisi yang Dilamar</label>
        <GlassSelect
          options={positionOptions}
          value={position}
          onChange={setPosition}
          placeholder=""
          triggerClassName="min-h-[27px] border-b-[1.5px] border-[#d9d9d9] pb-1.5 text-[16px] font-medium text-[#262626]"
        />
        <input type="hidden" name="position" value={position} />
      </div>

      {/* Unggah CV Anda — glass Choose File button */}
      <div className="flex flex-col gap-3">
        <label className={labelCls}>Unggah CV Anda</label>
        <div className="flex items-center gap-3">
          <label className="glass-rim inline-flex h-[38px] cursor-pointer items-center rounded-[31px] border border-[#ebebeb] bg-[rgba(250,250,250,0.35)] px-5 text-[14px] font-medium text-[#262626] shadow-[0px_4px_13.8px_rgba(0,0,0,0.06)] backdrop-blur-md transition-colors hover:bg-white/60">
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
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <label htmlFor={name} className={labelCls}>
        {label}
      </label>
      <input id={name} name={name} type={type} placeholder={placeholder} required className={inputCls} />
    </div>
  );
}
