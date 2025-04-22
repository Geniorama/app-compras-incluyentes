"use client";

import { TextInput, Button } from "flowbite-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { confirmPasswordReset, verifyPasswordResetCode, AuthError } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { useRouter, useSearchParams } from "next/navigation";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import LogosFooter from "@/assets/img/logos-footer.webp";

interface FormData {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordView() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const password = watch("password");

  useEffect(() => {
    const verifyCode = async () => {
      if (!oobCode) {
        setError("Código de verificación no encontrado");
        return;
      }

      try {
        const email = await verifyPasswordResetCode(auth, oobCode);
        setEmail(email);
      } catch (error) {
        console.error("Error al verificar el código:", error);
        setError("El enlace ha expirado o no es válido");
      }
    };

    verifyCode();
  }, [oobCode]);

  const isPasswordValid = (password: string) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (!oobCode) {
        setError("Código de verificación no encontrado");
        return;
      }

      setIsLoading(true);
      setError("");

      await confirmPasswordReset(auth, oobCode, data.password);
      router.push("/login?passwordReset=success");
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error);
      const authError = error as AuthError;

      switch (authError.code) {
        case "auth/expired-action-code":
          setError("El enlace ha expirado. Por favor, solicita uno nuevo.");
          break;
        case "auth/invalid-action-code":
          setError("El enlace es inválido. Por favor, solicita uno nuevo.");
          break;
        case "auth/weak-password":
          setError("La contraseña es demasiado débil. Debe tener al menos 8 caracteres.");
          break;
        default:
          setError("Ha ocurrido un error. Por favor, intenta de nuevo más tarde.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!oobCode || error) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-8 text-center">
        <h2 className="text-2xl font-semibold mb-4 text-red-600">Error</h2>
        <p className="text-gray-600 mb-6">
          {error || "El enlace de restablecimiento no es válido o ha expirado."}
        </p>
        <Button onClick={() => router.push("/forgot-password")} color="failure">
          Solicitar nuevo enlace
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-semibold mb-2">Cambiar la contraseña</h2>
        <p className="text-gray-600 mb-6">
          de <span className="font-medium">{email}</span>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Nueva contraseña</label>
            <div className="relative">
              <TextInput
                {...register("password", {
                  required: "La contraseña es obligatoria",
                  validate: {
                    isValid: (value) =>
                      isPasswordValid(value) ||
                      "La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial",
                  },
                })}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                color={errors.password ? "failure" : "gray"}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Confirmar contraseña</label>
            <div className="relative">
              <TextInput
                {...register("confirmPassword", {
                  required: "La confirmación de contraseña es obligatoria",
                  validate: (value) =>
                    value === password || "Las contraseñas no coinciden",
                })}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                color={errors.confirmPassword ? "failure" : "gray"}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <RiEyeOffLine /> : <RiEyeLine />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-[#4051B5] enabled:hover:bg-[#3544A2]"
            disabled={isLoading}
          >
            {isLoading ? "Guardando..." : "Guardar"}
          </Button>
        </form>
      </div>

      <img className="mx-auto mb-5 mt-20" src={LogosFooter.src} alt="Logos Footer" />
    </>
  );
} 