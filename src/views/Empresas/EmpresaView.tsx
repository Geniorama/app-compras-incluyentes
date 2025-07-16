'use client';

import DashboardNavbar from '@/components/dashboard/Navbar';
import { Button } from 'flowbite-react';
import { HiOutlineGlobeAlt, HiTag } from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import {
  RiFacebookLine,
  RiInstagramLine,
  RiTiktokLine,
  RiPinterestLine,
  RiLinkedinLine,
  RiTwitterXLine
} from 'react-icons/ri';
import type { CompanyData } from '@/types';
import type { SanityProductDocument, SanityServiceDocument, SanityImage, SanityCategoryDocument } from '@/types/sanity';
import BgCover from '@/assets/img/bg-portada-empresa.png';
import { useRouter } from 'next/navigation';

interface EmpresaViewProps {
  company: CompanyData & {
    products?: SanityProductDocument[];
    services?: SanityServiceDocument[];
    _id: string;
  };
}

function getImageUrl(image: SanityImage): string {
  if (!image || !image.asset) return '/images/placeholder-product.png';
  return `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${image.asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png').replace('-webp', '.webp')}`;
}

export default function EmpresaView({ company }: EmpresaViewProps) {
  const router = useRouter();
  const {
    nameCompany,
    businessName,
    logo,
    addressCompany,
    webSite,
    typeDocumentCompany,
    numDocumentCompany,
    ciiu,
    phone,
    facebook,
    instagram,
    tiktok,
    pinterest,
    linkedin,
    xtwitter,
    products = [],
    services = [],
    _id,
  } = company;

  const formatPhoneForWhatsApp = (phone?: string) => {
    if (!phone) return '';
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) return '57' + cleanPhone.substring(1);
    if (cleanPhone.startsWith('57')) return cleanPhone;
    return '57' + cleanPhone;
  };

  const handleWhatsAppClick = () => {
    const formattedPhone = formatPhoneForWhatsApp(phone);
    if (!formattedPhone) return;
    const whatsappUrl = `https://wa.me/${formattedPhone}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleContactCompany = () => {
    router.push(`/dashboard/mensajes?empresa=${_id}`);
  };


  return (
    <>
      <DashboardNavbar />
      <main className="bg-gray-50 min-h-screen pb-10">
        {/* Header visual solo con logo */}
        <div style={{ backgroundImage: `url(${BgCover.src})` }} className="relative bg-gradient-to-r from-blue-600 to-blue-400 h-56 flex items-end justify-center bg-cover bg-center">
          <div className="absolute left-1/2 transform -translate-x-1/2 translate-y-1/2 z-10">
            <img
              src={typeof logo === 'object' && logo ? getImageUrl(logo) ?? '/images/placeholder-company.png' : (logo as string) || '/images/placeholder-company.png'}
              alt={nameCompany}
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
            />
          </div>
        </div>

        {/* Info principal en tarjeta */}
        <div className="container mx-auto px-4 mt-20">
          <div className="bg-white rounded-lg shadow p-6 mb-8 flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-2">{nameCompany}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">{ciiu}</span>
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold uppercase">{typeDocumentCompany}: {numDocumentCompany}</span>
            </div>
            <div className="flex gap-2 mb-4">
              {phone && (
                <Button color="success" onClick={handleWhatsAppClick} className="rounded-full shadow">
                  <FaWhatsapp className="h-5 w-5" />
                </Button>
              )}
              {webSite && (
                <a href={webSite} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 hover:bg-white transition text-blue-600 shadow"
                  aria-label="Sitio Web"
                >
                  <HiOutlineGlobeAlt className="h-5 w-5" />
                </a>
              )}
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 hover:bg-white transition text-gray-700 shadow"
                  aria-label="Facebook"
                >
                  <RiFacebookLine className="h-5 w-5" />
                </a>
              )}
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 hover:bg-white transition text-gray-700 shadow"
                  aria-label="Instagram"
                >
                  <RiInstagramLine className="h-5 w-5" />
                </a>
              )}
              {tiktok && (
                <a href={tiktok} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 hover:bg-white transition text-gray-700 shadow"
                  aria-label="TikTok"
                >
                  <RiTiktokLine className="h-5 w-5" />
                </a>
              )}
              {pinterest && (
                <a href={pinterest} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 hover:bg-white transition text-gray-700 shadow"
                  aria-label="Pinterest"
                >
                  <RiPinterestLine className="h-5 w-5" />
                </a>
              )}
              {linkedin && (
                <a href={linkedin} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 hover:bg-white transition text-gray-700 shadow"
                  aria-label="LinkedIn"
                >
                  <RiLinkedinLine className="h-5 w-5" />
                </a>
              )}
              {xtwitter && (
                <a href={xtwitter} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 hover:bg-white transition text-gray-700 shadow"
                  aria-label="X"
                >
                  <RiTwitterXLine className="h-5 w-5" />
                </a>
              )}
            </div>
          
            <ul className='flex flex-col justify-center items-center gap-2'>
              <li className='text-sm text-gray-600'> <b>Razón social:</b> {businessName}</li>
              <li className='text-sm text-gray-600'> <b>Dirección:</b> {addressCompany}</li>
            </ul>

            <Button color='light' className='mt-4' onClick={handleContactCompany}>
              Enviar mensaje
            </Button>
          </div>

          {/* Productos */}
          <section className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Productos</h2>
            {products.length === 0 ? (
              <p className="text-gray-500">Esta empresa no tiene productos registrados.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(product => (
                  <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="relative h-48">
                      {product.images?.[0] ? (
                        <img
                          src={getImageUrl(product.images[0])}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">Sin imagen</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">{product.description || 'Sin descripción'}</p>
                      
                      {/* Categoría */}
                      {product.category && Array.isArray(product.category) && product.category.length > 0 && (
                        <div className="flex items-center gap-1 mb-3">
                          <HiTag className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {(product.category as SanityCategoryDocument[]).map((cat: SanityCategoryDocument) => cat.name).join(', ')}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <span className={`leading-4 py-1 rounded-full text-sm font-semibold ${product.price ? 'text-green-600' : 'text-slate-400'}`}>
                          {product.price ? `$${product.price.toLocaleString()}` : 'Precio no especificado'}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Activo</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Servicios */}
          <section className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Servicios</h2>
            {services.length === 0 ? (
              <p className="text-gray-500">Esta empresa no tiene servicios registrados.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {services.map(service => (
                  <div key={service._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="relative h-48">
                      {service.images?.[0] ? (
                        <img
                          src={getImageUrl(service.images[0])}
                          alt={service.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">Sin imagen</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">{service.description || 'Sin descripción'}</p>
                      
                      {/* Categoría */}
                      {service.category && Array.isArray(service.category) && service.category.length > 0 && (
                        <div className="flex items-center gap-1 mb-3">
                          <HiTag className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {(service.category as SanityCategoryDocument[]).map((cat: SanityCategoryDocument) => cat.name).join(', ')}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <span className={`leading-4 py-1 rounded-full text-sm font-semibold ${service.price ? 'text-green-600' : 'text-slate-400'}`}>
                          {service.price ? `$${service.price.toLocaleString()}` : 'Precio no especificado'}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Activo</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
} 