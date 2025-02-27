import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "secreto_super_seguro";

// Simulación de usuario en base de datos
const fakeUser = { id: "1", name: "Usuario", email: "test@email.com", password: "123456" };

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (email !== fakeUser.email || password !== fakeUser.password) {
    return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
  }

  // Crear token JWT
  const token = jwt.sign({ id: fakeUser.id, email: fakeUser.email }, SECRET_KEY, { expiresIn: "1h" });

  const response = NextResponse.json({ message: "Login exitoso" });
  response.cookies.set("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });

  return response;
}
