/**
 * The three tabs on Tata Kelola Organisasi.
 *
 * Lives on its own rather than in `db/schema.ts` because both the schema (server)
 * and the admin UI (client) need it — importing it from the schema would drag
 * drizzle's table definitions into the client bundle.
 */
export const GOVERNANCE_ROLES = ["Pembina", "Pengurus", "Pengawas"] as const;

export type GovernanceRole = (typeof GOVERNANCE_ROLES)[number];
