import { NextRequest, NextResponse } from "next/server";

import { getExpectedSessionToken, sessionCookieName } from "@/lib/auth";

function isPublicPath(pathname: string) {
  return pathname === "/login" || pathname.startsWith("/_next") || pathname === "/favicon.ico";
}

function isAuthApiPath(pathname: string) {
  return pathname.startsWith("/api/auth/");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname) || isAuthApiPath(pathname)) {
    const hasSession = request.cookies.get(sessionCookieName)?.value === getExpectedSessionToken();

    if (pathname === "/login" && hasSession) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  const hasValidSession = request.cookies.get(sessionCookieName)?.value === getExpectedSessionToken();

  if (hasValidSession) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ message: "Nao autenticado." }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!.*\\..*).*)"]
};
