'use client';

import { Button } from 'flowbite-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { urlFor } from '@/lib/sanity.image';

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
}

export default function CompanyCard({ _id, nameCompany, businessName, logo }: CompanyCardProps) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-gray-50 rounded-full mr-3 overflow-hidden relative flex-shrink-0">
          {logo ? (
            <Image
              src={urlFor(logo).width(80).height(80).url()}
              alt={nameCompany}
              fill
              className="object-contain p-1"
              sizes="40px"
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
          onClick={() => router.push(`/chat/${_id}`)}
          size="sm"
          className="flex-1 justify-center"
        >
          Enviar Mensaje
        </Button>
      </div>
    </div>
  );
} 