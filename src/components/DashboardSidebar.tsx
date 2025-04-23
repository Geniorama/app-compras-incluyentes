import React from 'react';
import Link from "next/link";
import { HiOutlineUserCircle, HiOutlineFolder, HiOutlineBell, HiOutlineLockClosed, HiOutlineArrowRight } from "react-icons/hi";
import { usePathname } from "next/navigation";

interface MenuItem {
    href: string;
    icon: React.ReactNode;
    label: string;
}

const menuItems: MenuItem[] = [
    {
        href: "/dashboard/profile",
        icon: <HiOutlineUserCircle className="w-5 h-5" />,
        label: "Mi Perfil"
    },
    {
        href: "/dashboard/products",
        icon: <HiOutlineFolder className="w-5 h-5" />,
        label: "Gestión de Servicios y Productos"
    },
    {
        href: "/dashboard/notifications",
        icon: <HiOutlineBell className="w-5 h-5" />,
        label: "Notificaciones"
    },
    {
        href: "/dashboard/security",
        icon: <HiOutlineLockClosed className="w-5 h-5" />,
        label: "Seguridad"
    }
];

export default function DashboardSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-1/3 xl:w-1/4">
            <ul className="flex flex-col gap-4 border border-gray-200 p-5 rounded-lg text-sm">
                {menuItems.map((item) => (
                    <li key={item.href}>
                        <Link 
                            href={item.href} 
                            className={`flex items-center gap-2 p-3 py-4 rounded-lg ${
                                pathname === item.href ? "bg-violet-200" : ""
                            }`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </Link>
                    </li>
                ))}
                <hr />
                <li>
                    <Link href="/logout" className="flex items-center gap-2 p-3 py-4">
                        <HiOutlineArrowRight className="w-5 h-5" />
                        <span>Cerrar Sesión</span>
                    </Link>
                </li>
            </ul>
        </aside>
    );
} 