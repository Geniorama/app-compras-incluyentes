'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button, Spinner, Alert } from 'flowbite-react';
import { HiUser, HiOutlineHeart, HiOutlineTrash } from 'react-icons/hi';
import DashboardSidebar from '@/components/DashboardSidebar';
import { useRouter } from 'next/navigation';

interface FavoriteUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  position?: string;
  photo?: { asset?: { _ref?: string } };
  company?: { _id: string; nameCompany?: string };
}

function getImageUrl(image: FavoriteUser['photo']): string {
  if (!image?.asset?._ref) return '';
  const ref = image.asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png').replace('-webp', '.webp');
  return `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${ref}`;
}


export default function FavoritosView() {
  const { user } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.uid) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
    // fetchFavorites definido en el componente; omitido para evitar loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const fetchFavorites = async () => {
    if (!user?.uid) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/favorites', {
        headers: { 'x-user-id': user.uid }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al cargar favoritos');
      setFavorites(data.data?.favorites || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar favoritos');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (userId: string) => {
    if (!user?.uid) return;
    setRemovingId(userId);
    setError('');
    try {
      const res = await fetch('/api/favorites', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.uid
        },
        body: JSON.stringify({ action: 'remove', userId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al quitar de favoritos');
      setFavorites(prev => prev.filter(f => f._id !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al quitar de favoritos');
    } finally {
      setRemovingId(null);
    }
  };

  const handleContactCompany = (companyId: string) => {
    router.push(`/dashboard/mensajes?empresa=${companyId}`);
  };

  if (!user?.uid) {
    return (
      <div className="flex container mx-auto mt-10">
        <DashboardSidebar />
        <main className="w-full md:w-3/4 md:pl-10 mt-6 md:mt-0">
          <Alert color="failure">Debes iniciar sesión para ver tus favoritos.</Alert>
        </main>
      </div>
    );
  }

  return (
    <div className="flex container mx-auto mt-10">
      <DashboardSidebar />
      <main className="w-full md:w-3/4 md:pl-10 mt-6 md:mt-0">
        <h1 className="text-2xl font-bold mb-4">Mis favoritos</h1>
        <p className="text-gray-600 mb-6">
          Usuarios que has marcado como favoritos. Puedes contactarlos directamente desde aquí.
        </p>

        {error && <Alert color="failure" className="mb-4">{error}</Alert>}

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="xl" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <HiOutlineHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No tienes usuarios favoritos aún.</p>
            <p className="text-sm text-gray-500 mb-4">
              Visita las páginas de empresas y marca como favoritos a los usuarios con perfil público.
            </p>
            <Button color="blue" onClick={() => router.push('/empresas')}>
              Explorar empresas
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((fav) => {
              const photoUrl = getImageUrl(fav.photo);
              const fullName = [fav.firstName, fav.lastName].filter(Boolean).join(' ') || 'Usuario';

              return (
                <div
                  key={fav._id}
                  className="bg-white rounded-lg shadow p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow"
                >
                  <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-gray-200 flex items-center justify-center bg-gray-100">
                    {photoUrl ? (
                      <img src={photoUrl} alt={fullName} className="w-full h-full object-cover" />
                    ) : (
                      <HiUser className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">{fullName}</h3>
                  {fav.position && <p className="text-sm text-gray-600 mb-1">{fav.position}</p>}
                  {fav.company?.nameCompany && (
                    <p className="text-xs text-gray-500 mb-3">{fav.company.nameCompany}</p>
                  )}
                  <div className="flex gap-2 mt-4 w-full">
                    {fav.company?._id && (
                      <Button
                        color="blue"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleContactCompany(fav.company!._id)}
                      >
                        Contactar
                      </Button>
                    )}
                    <Button
                      color="failure"
                      size="sm"
                      onClick={() => handleRemoveFavorite(fav._id)}
                      disabled={removingId === fav._id}
                    >
                      {removingId === fav._id ? <Spinner size="sm" /> : <HiOutlineTrash className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
