'use client';

import ProfileView from "@/views/Dashboard/ProfileView";
import { sanityClient } from "@/lib/sanity.client";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Spinner } from "flowbite-react";

async function getProfile(userId: string) {
  try {
    const profile = await sanityClient.fetch(
      `*[_type == "user" && firebaseUid == $userId][0]{
        _id,
        firstName,
        lastName,
        email,
        phone,
        pronoun,
        position,
        typeDocument,
        numDocument,
        photo,
        role,
        company->{
          _id,
          nameCompany,
          businessName,
          typeDocumentCompany,
          numDocumentCompany,
          ciiu,
          webSite,
          addressCompany,
          logo,
          facebook,
          instagram,
          tiktok,
          pinterest,
          linkedin,
          xtwitter
        }
      }`,
      { userId }
    );
    return profile;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

export default function PerfilPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
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