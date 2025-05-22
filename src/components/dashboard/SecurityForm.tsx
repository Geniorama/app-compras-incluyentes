'use client';

import { useState } from 'react';
import { Button,  Alert } from 'flowbite-react';
import { useAuth } from '@/context/AuthContext';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function SecurityForm() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handlePasswordReset = async () => {
    if (!user?.email) {
      setError('No se encontró un correo electrónico asociado a tu cuenta.');
      return;
    }

    if (!user.emailVerified) {
      setError('Debes verificar tu correo electrónico antes de poder cambiar tu contraseña.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      await sendPasswordResetEmail(auth, user.email);
      setSuccess('Se ha enviado un enlace de restablecimiento de contraseña a tu correo electrónico.');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Ocurrió un error al enviar el correo de restablecimiento.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full px-2 py-8 md:px-8">
      <div className="max-w-xl bg-white rounded-lg shadow p-6 mx-auto md:ml-0">
        <h2 className="text-2xl font-bold mb-6">Seguridad de la cuenta</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Cambiar contraseña</h3>
            <p className="text-gray-600 mb-4">
              Si deseas cambiar tu contraseña, te enviaremos un enlace a tu correo electrónico para que puedas establecer una nueva.
            </p>
            
            {error && (
              <Alert color="failure" className="mb-4">
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert color="success" className="mb-4">
                {success}
              </Alert>
            )}

            <div className="flex items-center gap-4">
              <Button
                color="blue"
                onClick={handlePasswordReset}
                disabled={isLoading || !user?.emailVerified}
              >
                {isLoading ? 'Enviando...' : 'Solicitar cambio de contraseña'}
              </Button>
              
              {!user?.emailVerified && (
                <span className="text-sm text-red-500">
                  Debes verificar tu correo electrónico primero
                </span>
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Estado de la cuenta</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Correo electrónico:</span>
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Estado de verificación:</span>
                <span className={user?.emailVerified ? 'text-green-600' : 'text-red-600'}>
                  {user?.emailVerified ? 'Verificado' : 'No verificado'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 