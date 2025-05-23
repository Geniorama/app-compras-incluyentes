"use client";

import { Avatar, Dropdown, Navbar } from "flowbite-react";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import IconLogo from "@/assets/img/logo-icon.webp";
import { TextInput } from "flowbite-react";
import { useAuth } from "@/context/AuthContext";
import { IoSearchOutline } from "react-icons/io5";

export default function DashboardNavbar() {
  const router = useRouter();
  const { user } = useAuth();

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Usuario";
  const email = user?.email || "";

  // Obtener la URL de la imagen de perfil desde Sanity si existe
  const avatarUrl =
    user?.photo && user?.photo.asset?._ref
      ? `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${user.photo.asset._ref
          .replace("image-", "")
          .replace("-jpg", ".jpg")
          .replace("-png", ".png")
          .replace("-webp", ".webp")}`
      : "https://flowbite.com/docs/images/people/profile-picture-5.jpg";

  const handleSignOut = async () => {
    try {
      await logout();
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <Navbar className="fixed w-full z-30 bg-white border-b border-gray-200 px-4 fluid">
      <div className="flex items-center justify-between w-full gap-4">
        {/* Logo y enlaces */}
        <div className="flex items-center gap-4">
          <Navbar.Brand href="/dashboard">
            <img alt="Logo" src={IconLogo.src} className="h-9 block" />
          </Navbar.Brand>
          <ul className="items-center gap-8 hidden md:flex">
            <Navbar.Link href="/empresas">
              <span className="text-sm font-medium">Empresas</span>
            </Navbar.Link>
            <Navbar.Link href="/catalogo">
              <span className="text-sm font-medium">Productos y Servicios</span>
            </Navbar.Link>
          </ul>
        </div>

        {/* Barra de búsqueda y usuario */}
        <div className="flex items-center gap-4 flex-grow justify-end">
          <div className="relative w-full md:w-auto">
            <TextInput placeholder="Buscar..." className="w-full md:w-72" />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 z-10 cursor-pointer">
              <IoSearchOutline className="text-gray-400" />
            </div>
          </div>
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar
                alt="User settings"
                img={avatarUrl}
                rounded
                className="w-8 h-8 md:w-10 md:h-10 !rounded-full overflow-hidden [&>img]:object-cover [&>img]:w-full [&>img]:h-full"
              />
            }
          >
            <Dropdown.Header>
              <span className="block text-sm">{displayName}</span>
              <span className="block truncate text-sm font-medium">
                {email}
              </span>
            </Dropdown.Header>
            <Dropdown.Item onClick={() => router.push("/dashboard/perfil")}>
              Perfil
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => router.push("/dashboard/productos")}>
              Mis productos y servicios
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => router.push("/dashboard/seguridad")}>
              Seguridad
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleSignOut}>Cerrar sesión</Dropdown.Item>
          </Dropdown>
        </div>
      </div>
    </Navbar>
  );
}
