'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Spinner } from "flowbite-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const isSuperadmin = user?.role === 'superadmin';

  // El superadmin tiene su propio panel: no usa el dashboard de las empresas.
  useEffect(() => {
    if (!loading && isSuperadmin) {
      router.push('/superadmin');
    }
  }, [loading, isSuperadmin, router]);

  if (loading || isSuperadmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="xl" />
      </div>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
