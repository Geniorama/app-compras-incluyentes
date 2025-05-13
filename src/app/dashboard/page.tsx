"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "flowbite-react";

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      router.push("/empresas");
    }
  }, [user, router]);
  
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Spinner size="xl" />
    </div>
  );
}
