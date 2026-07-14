"use server";

import { db, schema } from "@/lib/db";
import {
  applicationSchema,
  ACCEPTED_CV_TYPES,
  MAX_CV_SIZE,
} from "@/lib/validators/application";

export type ActionState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
};

export async function submitApplication(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = applicationSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    university: formData.get("university"),
    major: formData.get("major"),
    position: formData.get("position"),
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[issue.path[0] as string] = issue.message;
    }
    return { ok: false, message: "Periksa kembali isian formulir.", errors };
  }

  const cv = formData.get("cv");
  if (!(cv instanceof File) || cv.size === 0) {
    return { ok: false, message: "Silakan unggah file CV Anda." };
  }
  if (cv.size > MAX_CV_SIZE) {
    return { ok: false, message: "Ukuran CV maksimal 5 MB." };
  }
  if (!ACCEPTED_CV_TYPES.includes(cv.type)) {
    return { ok: false, message: "Format CV harus PDF atau Word." };
  }

  try {
    // Turso has no object storage — store the CV file bytes as a BLOB.
    const buffer = Buffer.from(await cv.arrayBuffer());
    await db.insert(schema.applications).values({
      ...parsed.data,
      cvName: cv.name,
      cvType: cv.type,
      cvData: buffer,
    });

    return {
      ok: true,
      message: "Terima kasih! Lamaran Anda telah kami terima.",
    };
  } catch (err) {
    console.error("submitApplication failed:", err);
    return {
      ok: false,
      message:
        "Terjadi kesalahan saat mengirim lamaran. Coba lagi nanti atau hubungi kami.",
    };
  }
}
