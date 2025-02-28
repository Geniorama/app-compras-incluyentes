"use client";

import { useAuth } from "@/context/AuthContext";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);
  
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Bienvenido {user?.email}</h1>
      <button onClick={logout} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
        Cerrar sesión
      </button>
    </div>
  )
}
