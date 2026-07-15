import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";

/**
 * Admin-only CV download endpoint. The proxy already gates `/admin/:path*`, and
 * `requireAdmin()` re-checks the session as defense-in-depth. Exists mainly so
 * the exported Excel can carry a clickable "Unduh CV" link per applicant (an
 * xlsx can't embed the blob itself).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const [row] = await db
    .select({
      cvName: schema.applications.cvName,
      cvType: schema.applications.cvType,
      cvData: schema.applications.cvData,
    })
    .from(schema.applications)
    .where(eq(schema.applications.id, id));

  if (!row) return new Response("CV tidak ditemukan", { status: 404 });

  const bytes = new Uint8Array(row.cvData as Buffer);
  const asciiName = (row.cvName || "cv").replace(/[^\x20-\x7E]/g, "_");
  return new Response(bytes, {
    headers: {
      "Content-Type": row.cvType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(
        row.cvName || "cv",
      )}`,
      "Cache-Control": "no-store",
    },
  });
}
