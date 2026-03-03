'use client';

import { useEffect, useState } from 'react';
import { Card, Spinner } from 'flowbite-react';
import { HiUsers, HiOfficeBuilding, HiTag, HiCheckCircle } from 'react-icons/hi';
import { useAuth } from '@/context/AuthContext';
import SuperadminSidebar from '@/components/superadmin/SuperadminSidebar';

interface Stats {
  totalUsers: number;
  totalCompanies: number;
  activeCompanies: number;
  pendingCompanies: number;
  totalProducts: number;
  totalServices: number;
  totalCategories: number;
}

export default function SuperadminDashboardView() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.uid) return;
      try {
        const res = await fetch('/api/superadmin/stats', {
          headers: { 'x-user-id': user.uid },
        });
        const data = await res.json();
        if (data.success) setStats(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="flex container mx-auto mt-10">
        <SuperadminSidebar />
        <main className="w-full md:w-3/4 md:pl-10 mt-6 md:mt-0 flex justify-center items-center">
          <Spinner size="xl" />
        </main>
      </div>
    );
  }

  const cards = [
    { label: 'Usuarios', value: stats?.totalUsers ?? 0, icon: HiUsers, color: 'blue' },
    { label: 'Empresas totales', value: stats?.totalCompanies ?? 0, icon: HiOfficeBuilding, color: 'green' },
    { label: 'Empresas activas', value: stats?.activeCompanies ?? 0, icon: HiCheckCircle, color: 'success' },
    { label: 'Empresas pendientes', value: stats?.pendingCompanies ?? 0, icon: HiOfficeBuilding, color: 'yellow' },
    { label: 'Productos', value: stats?.totalProducts ?? 0, icon: HiTag, color: 'purple' },
    { label: 'Servicios', value: stats?.totalServices ?? 0, icon: HiTag, color: 'indigo' },
    { label: 'Categorías', value: stats?.totalCategories ?? 0, icon: HiTag, color: 'pink' },
  ];

  return (
    <div className="flex container mx-auto mt-10">
      <SuperadminSidebar />
      <main className="w-full md:w-3/4 md:pl-10 mt-6 md:mt-0">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Panel Superadmin</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="max-w-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
              </div>
              <Icon className="h-10 w-10 text-gray-400" />
            </div>
          </Card>
        ))}
        </div>
      </main>
    </div>
  );
}
