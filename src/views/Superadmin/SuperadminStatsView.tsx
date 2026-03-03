'use client';

import { useEffect, useState } from 'react';
import { Card, Spinner } from 'flowbite-react';
import { HiUsers, HiOfficeBuilding, HiCheckCircle, HiXCircle, HiTag } from 'react-icons/hi';
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

export default function SuperadminStatsView() {
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

  const items = [
    { label: 'Usuarios totales', value: stats?.totalUsers ?? 0, icon: HiUsers },
    { label: 'Empresas totales', value: stats?.totalCompanies ?? 0, icon: HiOfficeBuilding },
    { label: 'Empresas activas', value: stats?.activeCompanies ?? 0, icon: HiCheckCircle },
    { label: 'Empresas pendientes', value: stats?.pendingCompanies ?? 0, icon: HiXCircle },
    { label: 'Productos', value: stats?.totalProducts ?? 0, icon: HiTag },
    { label: 'Servicios', value: stats?.totalServices ?? 0, icon: HiTag },
    { label: 'Categorías', value: stats?.totalCategories ?? 0, icon: HiTag },
  ];

  return (
    <div className="flex container mx-auto mt-10">
      <SuperadminSidebar />
      <main className="w-full md:w-3/4 md:pl-10 mt-6 md:mt-0">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Estadísticas</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
              </div>
              <Icon className="h-12 w-12 text-blue-500" />
            </div>
          </Card>
        ))}
        </div>
      </main>
    </div>
  );
}
