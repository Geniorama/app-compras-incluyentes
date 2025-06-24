"use client";

import { Avatar } from "flowbite-react";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import IconLogo from "@/assets/img/logo-icon.webp";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useState, useEffect } from "react";
import { HiOutlineMenu } from "react-icons/hi";

export default function DashboardNavbar() {
  const router = useRouter();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSecondaryMenuOpen, setIsSecondaryMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    if (typeof window !== "undefined") {
      checkMobile(); // Comprobación inicial
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }
  }, []);

  useEffect(() => {
    if (!isMobile) {
      console.log("isMobile", isMobile);
      setIsSecondaryMenuOpen(true);
    } else {
      console.log("isMobile", isMobile);
      setIsSecondaryMenuOpen(false);
    }
  }, [isMobile]);

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

  const MenuSecondary = () => {
    return (
      <div className={`flex justify-between items-center w-full sm:w-auto`}>
        <nav className="flex justify-center items-center w-full sm:w-auto">
          <ul className={`flex items-center gap-4 flex-col sm:flex-row ${isMobile && "w-full mt-5"}`}>
            <li className="hidden sm:block">
              <Link href="/dashboard">
                <img alt="Logo" src={IconLogo.src} className="h-6 sm:h-8" />
              </Link>
            </li>
            <li className={`${isMobile && "border-b border-gray-200 pb-4 w-full"}`}>
              <Link href="/dashboard">Empresas</Link>
            </li>
            <li className={`${isMobile && "pb-2 w-full"}`}>
              <Link href="/dashboard">Productos y Servicios</Link>
            </li>
          </ul>
        </nav>
      </div>
    )
  }

  return (
    <div className="flex max-w-[100vw] justify-between items-center px-4 py-3 bg-white border-b border-gray-200 fixed w-full z-30 sm:flex-row flex-col-reverse">
      {isSecondaryMenuOpen && <MenuSecondary />}
      
      <div className="flex sm:items-center gap-4 w-full sm:w-auto">
        {/* Logo mobile */}
        <div className="flex justify-start items-center w-full sm:hidden">
          <Link href="/dashboard">
            <img alt="Logo" src={IconLogo.src} className="h-12" />
          </Link>
        </div>

        {/* Menu mobile */}
        <div className="flex justify-end items-center w-full sm:hidden">
          <button className="outline-none" onClick={() => {
            setIsSecondaryMenuOpen(!isSecondaryMenuOpen)
            setIsMenuOpen(false)
          }}>
            <HiOutlineMenu className="h-6 w-6" />
          </button>
        </div>

        <div className="relative flex justify-center items-center">
          <button className="outline-none" onClick={() => {
            setIsMenuOpen(!isMenuOpen)
            if(isMobile) {
              setIsSecondaryMenuOpen(false)
            }
          }}>
            <Avatar
              alt="User settings"
              img={avatarUrl}
              rounded
              className="w-10 h-10"
            />
          </button>

          <div
            className={`absolute top-10 right-0 bg-white shadow-md rounded-md p-2 w-60 z-10 ${isMenuOpen ? "block" : "hidden"}`}
          >
            <div className="flex flex-col gap-1 p-2">
              <span className="text-sm block font-medium text-gray-900">{displayName}</span>
              <span className="text-sm block text-gray-500">{email}</span>
            </div>
            <hr className="my-2" />
            <ul className="flex flex-col gap-2">
              <li className="hover:bg-gray-100 p-2 rounded-md">
                <Link href="/dashboard/perfil">Perfil</Link>
              </li>
              <li className="hover:bg-gray-100 p-2 rounded-md">
                <Link href="/dashboard/productos">
                  Mis productos y servicios
                </Link>
              </li>
              <li className="hover:bg-gray-100 p-2 rounded-md">
                <Link href="/dashboard/mensajes">Mensajes</Link>
              </li>
              <li className="hover:bg-gray-100 p-2 rounded-md">
                <button onClick={handleSignOut}>Cerrar sesión</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
