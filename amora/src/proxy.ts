import { NextResponse, type NextRequest } from "next/server";

// Fast, optimistic redirect for signed-out visitors. Pages and API routes still
// verify the session themselves.
const SESSION_COOKIE = "amora_session";
const PROTECTED = ["/discover", "/matches", "/profile", "/companions", "/chat", "/admin"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);
  if (!hasSession && PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/discover/:path*", "/matches/:path*", "/profile/:path*", "/companions/:path*", "/chat/:path*", "/admin/:path*"],
};
