"use client";

import { Avatar, Dropdown, Navbar } from "flowbite-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { useRouter } from "next/navigation";
import IconLogo from "@/assets/img/logo-icon.webp";
import { TextInput } from "flowbite-react";

export default function DashboardNavbar() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
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
                img="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                rounded
                className="w-10 h-10"
              />
            }
          >
            <Dropdown.Header>
              <span className="block text-sm">Nombre del Usuario</span>
              <span className="block truncate text-sm font-medium">correo@ejemplo.com</span>
            </Dropdown.Header>
            <Dropdown.Item onClick={() => router.push("/dashboard/perfil")}>
              Perfil
            </Dropdown.Item>
            <Dropdown.Item onClick={() => router.push("/dashboard/configuracion")}>
              Configuración
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
            <Navbar.Link href="/dashboard">Empresas</Navbar.Link>
            <Navbar.Link href="/dashboard/productos">Productos y Servicios</Navbar.Link>
            <Navbar.Link href="/dashboard/chat">Chat</Navbar.Link>
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
} 