// lib/auth.ts
import { auth } from "./firebaseConfig";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification
} from "firebase/auth";
import { setCookie } from "cookies-next";
import { deleteCookie } from "cookies-next";

const getFirebaseErrorMessage = (code: string): string => {
  const errorMessages: Record<string, string> = {
    "auth/email-already-in-use": "El correo electrónico ya está en uso.",
    "auth/invalid-email": "El formato del correo no es válido.",
    "auth/weak-password": "La contraseña es demasiado débil. Usa al menos 6 caracteres.",
    "auth/wrong-password": "La contraseña es incorrecta.",
    "auth/user-not-found": "No se encontró un usuario con este correo.",
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
    "auth/network-request-failed": "Error de conexión. Verifica tu red e intenta de nuevo.",
    "auth/too-many-requests": "Demasiados intentos fallidos. Inténtalo más tarde.",
    "auth/internal-error": "Ocurrió un error interno. Intenta más tarde.",
  };

  return errorMessages[code] || "Ocurrió un error desconocido.";
};

// Registrar usuario
export const registerUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await sendEmailVerification(userCredential.user);
    return userCredential.user;
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error) {
      throw new Error(getFirebaseErrorMessage((error as { code: string }).code));
    }
    throw new Error("Ocurrió un error desconocido.");
  }
};

// Iniciar sesión
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const token = await userCredential.user.getIdToken();

    setCookie("token", token, { maxAge: 60 * 60 * 24, path: "/" });

    return userCredential.user;
  } catch (error: unknown) {
    throw new Error(getFirebaseErrorMessage((error as { code: string }).code));
  }
};

// Cerrar sesión
export const logout = async () => {
  try {
    await signOut(auth);
    deleteCookie("token");
  } catch (error) {
    console.error("Error al cerrar sesión:", getFirebaseErrorMessage((error as { code: string }).code));
  }
};


export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return "Se ha enviado un correo de recuperación.";
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error) {
      throw new Error(getFirebaseErrorMessage((error as { code: string }).code));
    }
    throw new Error("Ocurrió un error desconocido.");
  }
};