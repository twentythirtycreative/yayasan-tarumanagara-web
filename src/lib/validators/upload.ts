/**
 * Central upload limits. Turso stores CVs (BLOB) and cover images (base64 in a
 * TEXT column), so caps are deliberately modest but practical:
 *   - CV: 5 MB    — comfortably fits a PDF/Word resume.
 *   - Image: 5 MB — cover photo cap.
 * base64 inflates size ~33%, which is accounted for on the server.
 */
export const MB = 1024 * 1024;

export const MAX_CV_SIZE = 5 * MB;
export const ACCEPTED_CV_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const MAX_IMAGE_SIZE = 5 * MB;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function formatMB(bytes: number): string {
  const mb = bytes / MB;
  return `${Number.isInteger(mb) ? mb : mb.toFixed(1)} MB`;
}

/** Approximate decoded byte size of a base64 data URL payload. */
export function dataUrlBytes(dataUrl: string): number {
  const comma = dataUrl.indexOf(",");
  const b64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  const padding = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((b64.length * 3) / 4) - padding);
}
