'use client';

import { Sidebar, Button } from 'flowbite-react';
import { usePathname, useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';
import {
  HiOutlineShieldExclamation,
  HiUser,
  // HiOutlineBell,
  HiMenu,
  HiX,
  HiShoppingBag,
  HiOutlineLogout,
  HiOutlineUsers
} from 'react-icons/hi';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);

  // Detectar si estamos en móvil
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

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
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [pathname, isMobile]);

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
              icon={item.icon}
              className={`${pathname === item.href ? 'bg-gray-100' : ''} cursor-pointer`}
              as="div"
              onClick={() => {
                router.push(item.href);
                if (isMobile) {
                  setIsSidebarOpen(false);
                }
              }}
            >
              {item.label}
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
    <>
      {/* Botón de menú hamburguesa para móvil */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <Button
          color="gray"
          pill
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="!p-2"
        >
          {isSidebarOpen ? (
            <HiX className="h-6 w-6" />
          ) : (
            <HiMenu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Overlay para móvil */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar para móvil */}
      <div
        className={`fixed md:hidden top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Menú</h2>
            <Button
              color="gray"
              pill
              onClick={() => setIsSidebarOpen(false)}
              className="!p-2"
            >
              <HiX className="h-5 w-5" />
            </Button>
          </div>
          {sidebarContent}
        </div>
      </div>

      {/* Sidebar para desktop */}
      <div className="hidden md:block w-64">
        {sidebarContent}
      </div>
    </>
  );
} 