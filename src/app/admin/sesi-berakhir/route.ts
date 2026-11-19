import { NextResponse, type NextRequest } from "next/server";
import { getActiveAdmin } from "@/lib/auth/guard";
import { SESSION_COOKIE } from "@/lib/auth/session";

/**
 * Where the panel sends a browser whose session cookie is still validly signed
 * but no longer active (its password was changed, or the account removed).
 * The proxy only reads the cookie, so it would keep bouncing such a browser
 * from the login page back to /admin; clearing the cookie here breaks that
 * loop. A session that is still active is sent back to the panel untouched, so
 * this URL cannot be used to sign anyone out.
 */
export async function GET(req: NextRequest) {
  if (await getActiveAdmin()) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }
  const res = NextResponse.redirect(new URL("/admin/login", req.url));
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
