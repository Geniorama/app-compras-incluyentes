// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  // Si no hay token, redirigir a login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Si está autenticado e intenta ir a login o register, redirigir a /empresas
  const isAuthRoute = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register");
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/empresas", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!login|register|_next|favicon.ico|api|public).*)",
  ],
};
