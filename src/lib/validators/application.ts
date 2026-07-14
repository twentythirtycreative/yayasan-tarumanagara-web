import { z } from "zod";

export const positions = [
  "Staff Pendidikan",
  "Staff Kesehatan",
  "Staff Inovasi & Pengembangan",
  "Staff Properti & Bangunan",
  "Staff Fasilitas Harian",
  "Lainnya",
] as const;

/** Shared shape for the "Kirim CV" job application form (client + server). */
export const applicationSchema = z.object({
  fullName: z.string().min(2, "Nama lengkap wajib diisi"),
  email: z.string().email("Alamat email tidak valid"),
  phone: z
    .string()
    .min(8, "Nomor telepon tidak valid")
    .regex(/^[0-9+\-\s]+$/, "Nomor telepon tidak valid"),
  university: z.string().min(2, "Asal universitas wajib diisi"),
  major: z.string().min(2, "Jurusan wajib diisi"),
  position: z.string().min(2, "Posisi yang dilamar wajib diisi"),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

export { MAX_CV_SIZE, ACCEPTED_CV_TYPES } from "./upload";
