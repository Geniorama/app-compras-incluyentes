// lib/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configuración de las URLs de acción para restablecer contraseña.
// Usar getActionCodeSettings() en el cliente para obtener la URL correcta dinámicamente.
export const getActionCodeSettings = () => ({
  url: typeof window !== 'undefined'
    ? `${window.location.origin}/forgot-password`
    : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/forgot-password`,
  handleCodeInApp: true,
});

// Deprecado: usar getActionCodeSettings() para URL dinámica
export const actionCodeSettings = {
  url: 'http://localhost:3000/forgot-password',
  handleCodeInApp: true,
};
