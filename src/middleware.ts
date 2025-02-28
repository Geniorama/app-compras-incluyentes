// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value; // Obtener token de la cookie

  const isAuthRoute = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register");
  const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard"); // Modifica según las rutas protegidas

  // Si el usuario está autenticado y trata de acceder a login/register, redirigir al dashboard
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Si intenta acceder a una ruta protegida sin estar autenticado, redirigir a login
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// Configurar las rutas donde se ejecutará el middleware
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
