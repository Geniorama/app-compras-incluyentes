'use client';

import NotificationsView from "@/views/Dashboard/NotificationsView";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Spinner } from "flowbite-react";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNotifications() {
      try {
        if (!user) {
          setLoading(false);
          return;
        }

        // Aquí puedes agregar la lógica para cargar las notificaciones desde tu backend
        // Por ahora solo simulamos la carga
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error("Error al cargar las notificaciones:", error);
        setError("Error al cargar las notificaciones");
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center text-red-500">Usuario no autenticado</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return <NotificationsView />;
} 