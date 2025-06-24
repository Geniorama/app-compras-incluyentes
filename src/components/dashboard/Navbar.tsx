"use client";

import { Avatar, Dropdown, Navbar } from "flowbite-react";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import IconLogo from "@/assets/img/logo-icon.webp";
import { TextInput } from "flowbite-react";
import { useAuth } from "@/context/AuthContext";

export default function DashboardNavbar() {
  const router = useRouter();
  const { user } = useAuth();

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.displayName || user?.email?.split('@')[0] || "Usuario";
  const email = user?.email || "";

  // Obtener la URL de la imagen de perfil desde Sanity si existe
  const avatarUrl = user?.photo && user?.photo.asset?._ref
    ? `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${user.photo.asset._ref
        .replace('image-', '')
        .replace('-jpg', '.jpg')
        .replace('-png', '.png')
        .replace('-webp', '.webp')}`
    : "https://flowbite.com/docs/images/people/profile-picture-5.jpg";

  const handleSignOut = async () => {
    try {
      await logout();
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <Navbar className="fixed w-full z-30 bg-white border-b border-gray-200">
      <div className="flex gap-4 md:order-2">
        <TextInput
          placeholder="Buscar..."
          className="w-full min-w-72"
        />
        <div>
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar
                alt="User settings"
                img={avatarUrl}
                rounded
                className="w-10 h-10"
              />
            }
          >
            <Dropdown.Header>
              <span className="block text-sm">{displayName}</span>
              <span className="block truncate text-sm font-medium">{email}</span>
            </Dropdown.Header>
            <Dropdown.Item onClick={() => router.push("/dashboard/perfil")}>
              Perfil
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => router.push("/dashboard/productos")}>
              Mis productos y servicios
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => router.push("/dashboard/mensajes")} className="flex items-center justify-between">
              <span>Mensajes</span>
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleSignOut}>Cerrar sesión</Dropdown.Item>
          </Dropdown>
          <Navbar.Toggle />
        </div>
      </div>
      <div className="flex md:order-1 items-center gap-3">
        <Navbar.Brand href="/dashboard">
            <img alt="Logo" src={IconLogo.src} className="h-6 sm:h-9" />
        </Navbar.Brand>
        <Navbar.Collapse>
            <Navbar.Link href="/empresas">Empresas</Navbar.Link>
            <Navbar.Link href="/catalogo">Productos y Servicios</Navbar.Link>
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
} 