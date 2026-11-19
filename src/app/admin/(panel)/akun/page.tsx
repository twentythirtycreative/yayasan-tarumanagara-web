import { asc, ne } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { isAdminRole } from "@/lib/auth/roles";
import { ChangePasswordForm, ResetPasswordForm, type AccountOption } from "./password-forms";

/** Akun: every admin changes their own password; Admin Master can also reset others. */
export default async function AdminAkunPage() {
  const session = await requireAdmin();

  let others: AccountOption[] = [];
  if (session.role === "master") {
    const rows = await db
      .select({
        id: schema.adminUsers.id,
        email: schema.adminUsers.email,
        role: schema.adminUsers.role,
      })
      .from(schema.adminUsers)
      .where(ne(schema.adminUsers.id, session.sub))
      .orderBy(asc(schema.adminUsers.email));
    others = rows.flatMap((r) => (isAdminRole(r.role) ? [{ ...r, role: r.role }] : []));
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-[clamp(2rem,3.2vw,2.75rem)] font-extrabold leading-[1.1] text-[#00224f]">
        Akun
      </h1>
      <p className="mt-1 text-sm text-ink/60">Kelola kata sandi akun panel admin.</p>

      <div className="mt-6 flex flex-col gap-6">
        <ChangePasswordForm email={session.email} role={session.role} />
        {session.role === "master" && others.length > 0 && <ResetPasswordForm accounts={others} />}
      </div>
    </div>
  );
}
