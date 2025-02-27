import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token && req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url)); // Redirige a login si no hay token
  }
}

export const config = {
  matcher: ["/dashboard/:path*"], // Protege todas las rutas dentro de /dashboard
};
