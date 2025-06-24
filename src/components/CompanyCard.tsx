/* eslint-disable @next/next/no-img-element */
'use client';

import { Button } from 'flowbite-react';
import { useRouter } from 'next/navigation';

interface SanityImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
}

interface CompanyCardProps {
  _id: string;
  nameCompany: string;
  businessName: string;
  logo: SanityImage;
  phone?: string;
}

export default function CompanyCard({ _id, nameCompany, businessName, logo, phone }: CompanyCardProps) {
  const router = useRouter();

  // Función para obtener la URL de la imagen de Sanity
  const getImageUrl = (image: SanityImage) => {
    if (!image || !image.asset) return null;
    return `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${image.asset._ref.replace("image-", "").replace("-jpg", ".jpg").replace("-png", ".png").replace("-webp", ".webp")}`;
  };

  const handleWhatsAppClick = () => {
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${cleanPhone}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleMessageClick = () => {
    // Redirigir al dashboard de mensajes con la empresa pre-seleccionada
    router.push(`/dashboard/mensajes?empresa=${_id}`);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-gray-50 rounded-full mr-3 overflow-hidden relative flex-shrink-0">
          {logo && getImageUrl(logo) ? (
            <img
              src={getImageUrl(logo) || '/images/placeholder-company.png'}
              alt={nameCompany}
              className="w-full h-full object-contain p-1"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{nameCompany}</h3>
          <p className="text-sm text-gray-500">{businessName}</p>
        </div>
      </div>
      <hr className='mb-5 mt-2' />
      <div className="flex gap-2">
        <Button
          color="blue"
          onClick={() => router.push(`/empresas/${_id}`)}
          size="sm"
          className="flex-1 justify-center"
        >
          Ver Empresa
        </Button>
        <Button
          color="light"
          onClick={handleMessageClick}
          size="sm"
          className="flex-1 justify-center"
        >
          Enviar Mensaje
        </Button>
      </div>
    </div>
  );
} 