import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getActiveAdmin } from "@/lib/auth/guard";
import PanelShell from "./panel-shell";

/**
 * Server shell for the admin panel: resolves the signed-in role once, up front,
 * so the sidebar renders only the sections that role owns instead of flashing
 * the full nav while the client store loads. A session that is no longer active
 * (password changed elsewhere) is sent to sign in again.
 */
export default async function PanelLayout({ children }: { children: ReactNode }) {
  const session = await getActiveAdmin();
  if (!session) redirect("/admin/sesi-berakhir");
  return <PanelShell role={session.role}>{children}</PanelShell>;
}
