import type { Application } from "../../types";
import { parseDbTimestamp } from "@/lib/format-date";

const dateTimeFmt = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
});
const formatWhen = (iso: string) => {
  const d = parseDbTimestamp(iso);
  return Number.isNaN(d.getTime()) ? iso : `${dateTimeFmt.format(d)} WIB`;
};

const BRAND = "FF00357D"; // header fill
const STRIPE = "FFEEF4FF"; // zebra fill (matches the on-screen position badge)
const BORDER = "FFDCE3EC";

/**
 * Build and download a tidy .xlsx of the given applications. `exceljs` is
 * imported lazily so it never lands in the initial admin bundle.
 */
export async function exportApplicationsExcel(
  rows: Application[],
  fileName = "lamaran-yayasan-tarumanagara.xlsx",
) {
  const ExcelJS = (await import("exceljs")).default;
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";

  const wb = new ExcelJS.Workbook();
  wb.creator = "Yayasan Tarumanagara";
  wb.created = new Date();

  const ws = wb.addWorksheet("Lamaran", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  ws.columns = [
    { header: "No", key: "no", width: 5 },
    { header: "Nama Lengkap", key: "fullName", width: 26 },
    { header: "Email", key: "email", width: 30 },
    { header: "Nomor Telepon", key: "phone", width: 18 },
    { header: "Universitas", key: "university", width: 28 },
    { header: "Jurusan", key: "major", width: 24 },
    { header: "Posisi yang Dilamar", key: "position", width: 28 },
    { header: "Tanggal Masuk", key: "createdAt", width: 26 },
    { header: "Unduh CV", key: "cv", width: 45.5 },
  ];

  const thin = {
    top: { style: "thin" as const, color: { argb: BORDER } },
    left: { style: "thin" as const, color: { argb: BORDER } },
    bottom: { style: "thin" as const, color: { argb: BORDER } },
    right: { style: "thin" as const, color: { argb: BORDER } },
  };

  // Header row — brand fill, white bold text.
  const header = ws.getRow(1);
  header.height = 40;
  header.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND } };
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
    cell.border = thin;
  });

  // "Unduh CV" header carries a small caption explaining the access control:
  // the link only works for a signed-in admin. This is a security safeguard —
  // CVs contain applicants' personal data, so they are never publicly reachable
  // even if this spreadsheet is forwarded to someone else.
  const cvHeader = header.getCell("cv");
  cvHeader.value = {
    richText: [
      {
        text: "Unduh CV",
        font: { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } },
      },
      {
        text: "\nWajib login sebagai admin untuk mengunduh — pengaman agar CV (data pribadi pelamar) tidak bisa diakses publik meski file ini tersebar.",
        font: { name: "Calibri", size: 8, italic: true, color: { argb: "FFCBDBF2" } },
      },
    ],
  };
  cvHeader.alignment = { vertical: "middle", horizontal: "left", indent: 1, wrapText: true };

  rows.forEach((a, i) => {
    const row = ws.addRow({
      no: i + 1,
      fullName: a.fullName,
      email: a.email,
      phone: a.phone,
      university: a.university,
      major: a.major,
      position: a.position,
      createdAt: formatWhen(a.createdAt),
    });
    row.height = 20;
    row.eachCell((cell) => {
      cell.font = { name: "Calibri", size: 10.5, color: { argb: "FF1F2937" } };
      cell.alignment = { vertical: "middle", horizontal: "left", indent: 1, wrapText: true };
      cell.border = thin;
      if (i % 2 === 1) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: STRIPE } };
      }
    });
    row.getCell("no").alignment = { vertical: "middle", horizontal: "center" };

    // Clickable "Unduh CV" link → the admin-only CV download route.
    const cvCell = row.getCell("cv");
    cvCell.value = {
      text: "Unduh CV",
      hyperlink: `${origin}/admin/lamaran/cv/${a.id}`,
      tooltip: `Unduh CV ${a.fullName}`,
    };
    cvCell.font = {
      name: "Calibri",
      size: 10.5,
      color: { argb: "FF014AAF" },
      underline: true,
    };
    cvCell.alignment = { vertical: "middle", horizontal: "center" };
  });

  // Filter dropdowns on the header, so the sheet is usable as-is.
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 9 } };

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
