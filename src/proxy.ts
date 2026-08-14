import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/session";
import { can, sectionForPath } from "@/lib/auth/roles";

// Next 16: the `middleware` convention is renamed to `proxy`.
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLogin = pathname === "/admin/login";
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);

  // Not authenticated → force to login (except the login page itself).
  if (!session && !isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // Already authenticated → skip the login page.
  if (session && isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  // RBAC: a section this role doesn't own bounces back to the dashboard, which
  // every role may see (scoped to its own sections).
  if (session) {
    const section = sectionForPath(pathname);
    if (section && !can(session.role, section)) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
