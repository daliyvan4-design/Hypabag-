import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifyToken } from "@/lib/admin-auth";

/**
 * First gate on the backoffice: an unauthenticated request to any /admin page
 * (other than the login screen) is bounced to /admin/login. The API routes and
 * server layout re-check independently — this is the friendly redirect, not the
 * security boundary on its own.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const ok = await verifyToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (ok) return NextResponse.next();

  const loginUrl = new URL("/admin/login", request.url);
  if (pathname !== "/admin") loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
