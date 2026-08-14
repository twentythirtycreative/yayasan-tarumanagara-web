import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth/guard";
import PanelShell from "./panel-shell";

/**
 * Server shell for the admin panel: resolves the signed-in role once, up front,
 * so the sidebar renders only the sections that role owns instead of flashing
 * the full nav while the client store loads.
 */
export default async function PanelLayout({ children }: { children: ReactNode }) {
  const { role } = await requireAdmin();
  return <PanelShell role={role}>{children}</PanelShell>;
}
