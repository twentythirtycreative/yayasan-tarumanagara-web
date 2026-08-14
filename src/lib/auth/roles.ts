/**
 * Admin RBAC — three account types, four guarded sections.
 *
 * Lives on its own (no server imports) because every layer needs it: the edge
 * proxy, the server actions' guard, the DB schema's enum, and the client panel
 * that hides what the signed-in role can't reach.
 */

export const ADMIN_ROLES = ["master", "hr", "humas"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

/** The guarded areas of the panel. The dashboard is open to every role, but it
 *  only renders the cards belonging to the sections that role can see. */
export const ADMIN_SECTIONS = ["berita", "tata-kelola", "lowongan", "lamaran"] as const;
export type AdminSection = (typeof ADMIN_SECTIONS)[number];

const ACCESS: Record<AdminRole, readonly AdminSection[]> = {
  master: ADMIN_SECTIONS,
  hr: ["lowongan", "lamaran"],
  humas: ["berita"],
};

export const ROLE_LABELS: Record<AdminRole, string> = {
  master: "Admin Master",
  hr: "HR",
  humas: "Humas",
};

export function isAdminRole(value: unknown): value is AdminRole {
  return typeof value === "string" && (ADMIN_ROLES as readonly string[]).includes(value);
}

export function can(role: AdminRole, section: AdminSection): boolean {
  return ACCESS[role].includes(section);
}

export function sectionsFor(role: AdminRole): readonly AdminSection[] {
  return ACCESS[role];
}

/**
 * Which section a `/admin/...` path belongs to. Returns null for paths open to
 * every signed-in admin (the dashboard, the login page).
 */
export function sectionForPath(pathname: string): AdminSection | null {
  const rest = pathname.replace(/^\/admin\/?/, "").split("/")[0];
  return (ADMIN_SECTIONS as readonly string[]).includes(rest)
    ? (rest as AdminSection)
    : null;
}
