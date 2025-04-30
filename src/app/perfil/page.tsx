'use client';

import ProfileView from "@/views/Dashboard/ProfileView";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Spinner } from "flowbite-react";
import type { UserProfile } from "@/types";

async function getProfile(userId: string): Promise<UserProfile | null> {
  try {
    // Llamar a la API en inglés
    const response = await fetch(`/api/profile/get?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Error al obtener el perfil');
    }
    const data = await response.json();
    return data.success ? data.data.user : null;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

export default function PerfilPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        // Si no hay usuario, terminamos la carga
        if (!user) {
          setLoading(false);
          return;
        }

        const profileData = await getProfile(user.uid);
        if (profileData) {
          console.log('profileData', profileData);
          setProfile(profileData);
        } else {
          setError("No se pudo cargar el perfil");
        }
      } catch (error) {
        console.error("Error al cargar el perfil:", error);
        setError("Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
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

  return <ProfileView initialProfile={profile} />;
} 