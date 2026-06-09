import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";
import { DEFAULT_APP_PATH } from "@/lib/nav-tabs";

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const isLoggedIn = !!request.auth;
  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isPublicAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/manifest") ||
    pathname.startsWith("/icons");

  if (isPublicAsset) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/files") ||
    pathname.startsWith("/api/users/check-display-name")
  ) {
    return NextResponse.next();
  }

  if (!isLoggedIn && !isAuthPage && pathname !== "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL(DEFAULT_APP_PATH, request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
