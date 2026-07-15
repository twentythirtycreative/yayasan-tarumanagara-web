const idDate = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** Format an ISO date ("YYYY-MM-DD") as Indonesian "13 Agustus 2025". */
export function formatDateId(iso: string | null | undefined, fallback = ""): string {
  if (!iso) return fallback;
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? fallback : idDate.format(d);
}

/**
 * Parse a DB timestamp into a Date. Rows created via SQLite's CURRENT_TIMESTAMP
 * store UTC as a naive "YYYY-MM-DD HH:MM:SS" string (no timezone marker). JS
 * `new Date()` would misread that as *local* time, shifting the instant — so we
 * normalise the naive form to an explicit UTC instant. Values that already carry
 * timezone info (ISO-8601 with `T` and/or `Z`) are parsed as-is.
 */
export function parseDbTimestamp(value: string): Date {
  const s = value.trim();
  if (s.includes("T") || s.endsWith("Z")) return new Date(s);
  return new Date(`${s.replace(" ", "T")}Z`);
}
