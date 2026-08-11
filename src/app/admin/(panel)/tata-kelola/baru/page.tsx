"use client";

import { use } from "react";
import { TataKelolaForm } from "../tata-kelola-form";
import { GOVERNANCE_ROLES, type GovernanceRole } from "../../../_store";

export default function TataKelolaBaruPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  // The list links here with its active tab, so "Tambah Pengurus" from the
  // Pengawas tab opens the form already set to Pengawas. Anything unrecognised
  // falls back to the form's own default.
  const { kategori } = use(searchParams);
  const defaultRole = (GOVERNANCE_ROLES as readonly string[]).includes(
    kategori ?? "",
  )
    ? (kategori as GovernanceRole)
    : undefined;

  return <TataKelolaForm defaultRole={defaultRole} />;
}
