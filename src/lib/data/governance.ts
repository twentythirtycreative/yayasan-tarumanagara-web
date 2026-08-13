import "server-only";
import { asc, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db, schema } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/cache";
import { GOVERNANCE_ROLES, type GovernanceRole } from "@/lib/governance-roles";

export type GovernancePerson = {
  id: string;
  name: string;
  /** Jabatan, the smaller line under the name on the card. */
  role: string;
  photo: string;
  /** CSS object-position for the portrait crop, e.g. "50% 14%". */
  pos: string;
};

/** Shown when a member has no photo yet, so the carousel never renders a gap. */
const FALLBACK_PHOTO = "/images/person-3.jpg";

/**
 * Every published member for Tata Kelola Organisasi, grouped by tab and already
 * in display order (left to right). Returns all three keys even when a tab is
 * empty, so the UI can render its tabs without null checks.
 *
 * Cached in the Data Cache (tag "governance"); invalidated when admin writes.
 */
/**
 * Flat, cached list of published members in display order.
 *
 * Returns an array, not a Record keyed by role, even though every caller wants
 * the grouped shape: an object of arrays does not survive `unstable_cache` here
 * — the wrapper hands back the right keys with empty arrays, so the page renders
 * "Belum ada data" while the query underneath is returning rows. Every other
 * cached reader in this codebase (news, jobs) returns an array too. Grouping
 * happens in `getGovernanceMembers` below, outside the cache boundary.
 */
const cachedMembers = unstable_cache(
  async (): Promise<(GovernancePerson & { tab: GovernanceRole })[]> => {
    const rows = await db
      .select()
      .from(schema.governanceMembers)
      .where(eq(schema.governanceMembers.published, true))
      // Name is the tie-breaker so equal sortOrder (the default 0 on a fresh
      // row) still produces a stable order instead of whatever SQLite returns.
      .orderBy(
        asc(schema.governanceMembers.sortOrder),
        asc(schema.governanceMembers.name),
      );
    return rows.map((r) => ({
      id: r.id,
      tab: r.role,
      name: r.name,
      role: r.position,
      photo: r.photoUrl || FALLBACK_PHOTO,
      pos: r.photoPosition,
    }));
  },
  ["governance-members"],
  { tags: [CACHE_TAGS.governance], revalidate: false },
);

export async function getGovernanceMembers(): Promise<
  Record<GovernanceRole, GovernancePerson[]>
> {
  const rows = await cachedMembers();
  const grouped = Object.fromEntries(
    GOVERNANCE_ROLES.map((r) => [r, [] as GovernancePerson[]]),
  ) as Record<GovernanceRole, GovernancePerson[]>;
  for (const { tab, ...person } of rows) grouped[tab].push(person);
  return grouped;
}

