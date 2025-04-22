"use client";

import { TextInput, Button } from "flowbite-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { sendPasswordResetEmail, AuthError } from "firebase/auth";
import { auth, actionCodeSettings } from "@/lib/firebaseConfig";
import LogosFooter from "@/assets/img/logos-footer.webp";

interface FormData {
  email: string;
}

export default function ForgotPasswordView() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      setError("");
      setSuccess(false);
      
      await sendPasswordResetEmail(auth, data.email, actionCodeSettings);
      setSuccess(true);
    } catch (error) {
      console.error("Error al enviar el correo de recuperación:", error);
      const authError = error as AuthError;
      
      switch (authError.code) {
        case "auth/user-not-found":
          setError("No hemos encontrado ninguna cuenta con esa dirección de correo.");
          break;
        case "auth/invalid-email":
          setError("El correo electrónico no es válido.");
          break;
        case "auth/too-many-requests":
          setError("Has realizado demasiados intentos. Por favor, espera unos minutos antes de intentar de nuevo.");
          break;
        default:
          console.error("Código de error:", authError.code);
          setError("Ha ocurrido un error. Por favor, intenta de nuevo más tarde.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-semibold mb-2">Reestablecer contraseña</h2>
        <p className="text-gray-600 mb-6">
          Para restablecer tu contraseña, escribe tu correo electrónico.
        </p>

        {success ? (
          <div className="text-center py-4">
            <div className="mb-4 text-green-600">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Correo enviado
            </h3>
            <p className="text-gray-600 mb-6">
              Hemos enviado un enlace de recuperación a tu correo electrónico.
              Por favor, revisa también tu carpeta de spam.
            </p>
            <Link href="/login" className="text-blue-600 hover:underline">
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Correo</label>
              <TextInput
                {...register("email", {
                  required: "El correo electrónico es obligatorio",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "El correo electrónico no es válido",
                  },
                  onChange: () => setError(""),
                })}
                id="email"
                type="email"
                placeholder="micorreo@business.co"
                color={errors.email || error ? "failure" : "gray"}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Enviando..." : "Continuar"}
            </Button>

            <div className="text-center">
              <Link
                href="/login"
                className="text-blue-600 hover:underline text-sm"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          </form>
        )}
      </div>

      <img className=" mx-auto mb-5 mt-20" src={LogosFooter.src} alt="Logos Footer" />
    </>
  );
}
