import DashboardNavbar from '@/components/dashboard/Navbar';
import { Card, Button } from 'flowbite-react';
import { HiOutlineGlobeAlt } from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import {
  RiFacebookLine,
  RiInstagramLine,
  RiTiktokLine,
  RiPinterestLine,
  RiLinkedinLine,
  RiTwitterXLine
} from 'react-icons/ri';
import type { CompanyData, Product, Service, SanityImage } from '@/types';
import BgCover from '@/assets/img/bg-portada-empresa.png';

interface EmpresaViewProps {
  company: CompanyData & {
    products?: Product[];
    services?: Service[];
  };
}

function getImageUrl(image: SanityImage) {
  if (!image || !image.asset) return null;
  return `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${image.asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png').replace('-webp', '.webp')}`;
}

export default function EmpresaView({ company }: EmpresaViewProps) {
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

            <Button color='light' className='mt-4'>Enviar mensaje</Button>
          </div>

          {/* Productos */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Productos</h2>
            {products.length === 0 ? (
              <p className="text-gray-500">Esta empresa no tiene productos registrados.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <Card key={product._id} className="shadow-md flex flex-col">
                    {product.images?.[0] && (
                      <img
                        src={getImageUrl(product.images?.[0]) || '/images/placeholder-product.png'}
                        alt={product.name}
                        className="w-full h-40 object-cover rounded mb-2"
                      />
                    )}
                    <div className="flex flex-col flex-grow">
                      <h3 className="text-lg font-bold mb-2">{product.name}</h3>
                      <p className="text-gray-600 mb-2">{product.description}</p>
                      {product.price && <p className="text-green-700 font-semibold mt-auto">${product.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</p>}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Servicios */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Servicios</h2>
            {services.length === 0 ? (
              <p className="text-gray-500">Esta empresa no tiene servicios registrados.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(service => (
                  <Card key={service._id} className="shadow-md flex flex-col">
                    {service.images?.[0] && (
                      <img
                        src={getImageUrl(service.images?.[0]) || '/images/placeholder-service.png'}
                        alt={service.name}
                        className="w-full h-40 object-cover rounded mb-2"
                      />
                    )}
                    <div className="flex flex-col flex-grow">
                      <h3 className="text-lg font-bold mb-2">{service.name}</h3>
                      <p className="text-gray-600 mb-2">{service.description}</p>
                      {service.price && <p className="text-green-700 font-semibold mt-auto">${service.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</p>}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
} 