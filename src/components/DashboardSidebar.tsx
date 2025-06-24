'use client';

import { Sidebar } from 'flowbite-react';
import { usePathname, useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';
import {
  HiOutlineShieldExclamation,
  HiUser,
  HiShoppingBag,
  HiOutlineLogout,
  HiOutlineUsers,
  HiOutlineMailOpen
} from 'react-icons/hi';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);

  // Obtener el rol del usuario
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
    };

    fetchUserRole();
  }, [user]);

  // Cerrar sidebar al cambiar de ruta en móvil

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    router.push('/login');
  };

  const menuItems = [
    {
      href: '/dashboard/perfil',
      icon: HiUser,
      label: 'Mi Perfil'
    },
    {
      href: '/dashboard/productos',
      icon: HiShoppingBag,
      label: 'Productos y Servicios'
    },
    {
      href: '/dashboard/mensajes',
      icon: HiOutlineMailOpen,
      label: 'Mensajes'
    },
    // {
    //   href: '/dashboard/notificaciones',
    //   icon: HiOutlineBell,
    //   label: 'Notificaciones'
    // },
    {
      href: '/dashboard/seguridad',
      icon: HiOutlineShieldExclamation,
      label: 'Seguridad'
    }
  ];

  // Agregar la opción de Usuarios y Permisos solo si el usuario es admin
  if (userRole === 'admin') {
    menuItems.push({
      href: '/dashboard/usuarios',
      icon: HiOutlineUsers,
      label: 'Usuarios y Permisos'
    });
  }

  const sidebarContent = (
    <Sidebar className="w-full md:w-64">
      <Sidebar.Items>
        <Sidebar.ItemGroup>
          {menuItems.map((item) => (
            <Sidebar.Item
              key={item.href}
              {...(item.icon ? { icon: item.icon } : {})}
              className={`${pathname === item.href ? 'bg-gray-100' : ''} cursor-pointer`}
              as="div"
              onClick={() => router.push(item.href)}
            >
              <span className="flex items-center">
                {item.label}
              </span>
            </Sidebar.Item>
          ))}
        </Sidebar.ItemGroup>
        <Sidebar.ItemGroup>
          <Sidebar.Item
            icon={HiOutlineLogout}
            onClick={handleLogout}
            className="cursor-pointer"
            as="div"
            >
            Cerrar sesión
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );

  return (
    <div className="hidden md:block w-64">
      {sidebarContent}
    </div>
  );
} 