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
