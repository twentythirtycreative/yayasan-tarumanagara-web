import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/session";

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

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
