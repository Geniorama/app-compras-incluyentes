"use client"
import LoginForm from "@/components/LoginForm"
import LogoBlanco from "@/assets/img/logo blanco de compras incluyentes 2 sin fondo.png"
import FotoMujeres from "@/assets/img/mujeres-login.png"
import Vector from "@/assets/img/Vector.svg"

export default function LoginView() {
  return (
    <div className='flex h-screen w-full bg-[#F0F0F0]'>
        <div className='bg-blue-600 w-2/5 text-white p-5 text-center flex flex-col items-center justify-center relative'>
            <div className="text-center relative z-10">
              <img className="max-w-full mx-auto" src={LogoBlanco.src} alt="" />
              <img className="max-w-full" src={FotoMujeres.src} alt="" />
            </div>
            <img className="absolute left-0 bottom-0 z-0" src={Vector.src} alt="" />
        </div>
        <div className='p-5 w-3/5 flex items-center justify-center'>
            <div className="w-full max-w-md">
              <h2 className="text-2xl font-bold mb-5">Accede a tu cuenta</h2>
              <LoginForm />
            </div>
        </div>
    </div>
  )
}
