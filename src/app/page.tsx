"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push(user.role === 'superadmin' ? '/superadmin' : '/empresas');
    } else {
      router.push('/login');
    }
  }, [user, router]);

  return (
    <div>
      Cargando...
    </div>
  );
}