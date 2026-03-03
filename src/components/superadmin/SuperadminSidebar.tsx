'use client';

import { Sidebar } from 'flowbite-react';
import { usePathname, useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';
import {
  HiOutlineUsers,
  HiOutlineOfficeBuilding,
  HiOutlineTag,
  HiOutlineChartBar,
  HiOutlineDownload,
  HiOutlineHome,
  HiOutlineLogout,
} from 'react-icons/hi';

const menuItems = [
  { href: '/superadmin', icon: HiOutlineHome, label: 'Inicio' },
  { href: '/superadmin/usuarios', icon: HiOutlineUsers, label: 'Usuarios' },
  { href: '/superadmin/empresas', icon: HiOutlineOfficeBuilding, label: 'Empresas' },
  { href: '/superadmin/categorias', icon: HiOutlineTag, label: 'Categorías' },
  { href: '/superadmin/estadisticas', icon: HiOutlineChartBar, label: 'Estadísticas' },
  { href: '/superadmin/exportar', icon: HiOutlineDownload, label: 'Exportar datos' },
];

export default function SuperadminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    router.push('/login');
  };

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
              <span className="flex flex-col items-start justify-between w-full">
                <span>{item.label}</span>
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
