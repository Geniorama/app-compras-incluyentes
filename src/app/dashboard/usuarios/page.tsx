'use client';

import UsersView from '@/views/Dashboard/UsersView';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from 'flowbite-react';

export default function UsuariosPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        try {
          const response = await fetch(`/api/profile/get?userId=${user.uid}`);
          const data = await response.json();
          if (data.success) {
            setUserRole(data.data.user.role);
          }
        } catch (error) {
          console.error('Error al obtener el rol del usuario:', error);
        }
      }
      setLoading(false);
    };

    fetchUserRole();
  }, [user]);

  useEffect(() => {
    if (!loading && userRole !== 'admin') {
      router.push('/dashboard/perfil');
    }
  }, [loading, userRole, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!user || userRole !== 'admin') {
    return null;
  }

  return <UsersView />;
} 