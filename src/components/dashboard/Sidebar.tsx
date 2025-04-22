"use client";

import { Sidebar } from "flowbite-react";
import { HiOutlineUserCircle, HiOutlineFolderOpen, HiOutlineBell, HiOutlineShieldCheck } from "react-icons/hi";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="w-100" aria-label="Sidebar with logo branding example">
      <Sidebar.Items>
        <Sidebar.ItemGroup>
          <Link href="/dashboard" passHref>
            <Sidebar.Item
              icon={HiOutlineUserCircle}
              as="div"
              className={pathname === "/dashboard/profile" ? "bg-gray-100 dark:bg-gray-700" : ""}
            >
              Mi Perfil
            </Sidebar.Item>
          </Link>
          <Link href="/dashboard/productos" passHref>
            <Sidebar.Item
              icon={HiOutlineFolderOpen}
              as="div"
              className={pathname === "/dashboard/productos" ? "bg-gray-100 dark:bg-gray-700" : ""}
            >
              Gestión de Servicios y Productos
            </Sidebar.Item>
          </Link>
          <Link href="/dashboard/pedidos" passHref>
            <Sidebar.Item
              icon={HiOutlineBell}
              as="div"
              className={pathname === "/dashboard/pedidos" ? "bg-gray-100 dark:bg-gray-700" : ""}
            >
              Notificaciones
            </Sidebar.Item>
          </Link>
          <Link href="/dashboard/categorias" passHref>
            <Sidebar.Item
              icon={HiOutlineShieldCheck}
              as="div"
              className={pathname === "/dashboard/categorias" ? "bg-gray-100 dark:bg-gray-700" : ""}
            >
              Seguridad
            </Sidebar.Item>
          </Link>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
} 