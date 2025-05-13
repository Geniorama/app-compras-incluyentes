import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { BsTwitterX } from "react-icons/bs";

export const metadata: Metadata = {
  title: "Compras Incluyentes",
  description: "Plataforma de compras incluyentes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={'font-sans'}>
        <AuthProvider>
          {children}
          <Toaster position="top-right" />
        </AuthProvider>
        <footer className="bg-[#4C66F7] text-white">
          <div className="container mx-auto px-4 py-10">
            <div className="flex justify-between items-center flex-col lg:flex-row space-y-10 lg:space-y-0">
              <div className="flex gap-10 flex-wrap justify-center lg:justify-start">
                <img src="https://comprasincluyentes.geniorama.co/wp-content/uploads/2025/04/logo-blanco-de-compras-incluyentes-2-sin-fondo.png" alt="logo" className="lg:w-auto h-auto object-contain w-26" />
                <img src="https://comprasincluyentes.geniorama.co/wp-content/uploads/2025/04/logo-camara-de-la-diversidad-blanco-768x288-1.png" alt="logo" className="lg:w-auto h-auto object-contain w-26" />
                <img src="https://comprasincluyentes.geniorama.co/wp-content/uploads/2025/04/logo-chambers-americas-768x492-1.png" alt="logo" className="lg:w-auto h-auto object-contain w-26" />
              </div>

              <div>
                <h5>Síguenos en nuestras redes</h5>
                <div className="flex gap-4 mt-3">
                  <Link className="bg-[#FFB650] w-11 h-11 rounded-full flex items-center justify-center text-[#193DC0] text-xl hover:bg-white hover:opacity-90 transition" href="https://www.instagram.com/camdiversidad/" target="_blank" rel="noopener noreferrer">
                    <FaInstagram />
                  </Link>
                  <Link className="bg-[#FFB650] w-11 h-11 rounded-full flex items-center justify-center text-[#193DC0] text-xl hover:bg-white hover:opacity-90 transition" href="https://www.facebook.com/CamDiversidad" target="_blank" rel="noopener noreferrer">
                    <FaFacebook />
                  </Link>
                  <Link className="bg-[#FFB650] w-11 h-11 rounded-full flex items-center justify-center text-[#193DC0] text-xl hover:bg-white hover:opacity-90 transition" href="https://x.com/CamDiversidad" target="_blank" rel="noopener noreferrer">
                    <BsTwitterX />
                  </Link>
                  <Link className="bg-[#FFB650] w-11 h-11 rounded-full flex items-center justify-center text-[#193DC0] text-xl hover:bg-white hover:opacity-90 transition" href="https://www.linkedin.com/company/camdiversidad/" target="_blank" rel="noopener noreferrer">
                    <FaLinkedinIn />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
