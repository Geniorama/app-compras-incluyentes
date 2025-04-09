"use client"
import LoginForm from "@/components/LoginForm"
import LogoBlanco from "@/assets/img/logo blanco de compras incluyentes 2 sin fondo.png"
import CoverLogin from "@/assets/img/cover-login.webp"
import Vector from "@/assets/img/vector-bg-login.svg"

export default function LoginView() {
  return (
    <div className='flex h-screen w-full bg-[#F0F0F0]'>
        <div className='bg-[#3C65FB] md:w-2/5 text-white p-5 text-center hidden md:flex flex-col items-center justify-center relative'>
            <div className="text-center relative z-10">
              <img className="max-w-64 mx-auto" src={LogoBlanco.src} alt="" />
              <img className="max-w-full w-full" src={CoverLogin.src} alt="" />
            </div>
            <img className="absolute left-0 bottom-0 z-0 w-full max-w-[600px]" src={Vector.src} alt="" />
        </div>
        <div className='p-5 w-full md:w-3/5 flex items-center justify-center'>
            <div className="w-full md:max-w-md">
              <h2 className="text-3xl font-semibold mb-5 text-center">Accede a tu cuenta</h2>
              <LoginForm />
            </div>
        </div>
    </div>
  )
}
