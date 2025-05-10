'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  HiHome,
  HiShoppingBag,
  HiUser,
  // HiOutlineBell,
} from 'react-icons/hi';

const navItems = [
  {
    href: '/dashboard',
    icon: HiHome,
    label: 'Inicio'
  },
  {
    href: '/dashboard/catalogo',
    icon: HiShoppingBag,
    label: 'Productos'
  },
  // {
  //   href: '/dashboard/notificaciones',
  //   icon: HiOutlineBell,
  //   label: 'Alertas'
  // },
  {
    href: '/dashboard/perfil',
    icon: HiUser,
    label: 'Perfil'
  }
];

export default function MobileNavBar() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center w-full h-full"
            >
              <div
                className={`flex flex-col items-center ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs mt-1">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
} 