import { NextRequest, NextResponse } from "next/server";

import { getSessionCookieName, verifySessionToken } from "@/lib/auth";

function isPublicPath(pathname: string) {
  return pathname === "/login" || pathname.startsWith("/_next") || pathname === "/favicon.ico";
}

function isAuthApiPath(pathname: string) {
  return pathname.startsWith("/api/auth/");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(getSessionCookieName())?.value;
  const session = await verifySessionToken(sessionToken);
  const isAuthenticated = Boolean(session);

  if (isPublicPath(pathname) || isAuthApiPath(pathname)) {
    return handlePublicAccess(pathname, request, isAuthenticated);
  }

  return handleProtectedAccess(pathname, request, isAuthenticated);
}

export const config = {
  matcher: ["/((?!.*\\..*).*)"]
};

function handlePublicAccess(pathname: string, request: NextRequest, isAuthenticated: boolean) {
  if (pathname === "/login" && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

function handleProtectedAccess(pathname: string, request: NextRequest, isAuthenticated: boolean) {
  if (isAuthenticated) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ message: "Nao autenticado." }, { status: 401 });
  }

  return NextResponse.redirect(new URL("/login", request.url));
}
