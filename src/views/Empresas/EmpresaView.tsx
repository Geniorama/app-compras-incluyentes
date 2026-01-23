'use client';

import DashboardNavbar from '@/components/dashboard/Navbar';
import { Button } from 'flowbite-react';
import { HiOutlineGlobeAlt, HiTag, HiMail, HiPhone } from 'react-icons/hi';
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

interface PublicUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  position?: string;
  email?: string;
  phone?: string;
  photo?: SanityImage | string;
}

interface EmpresaViewProps {
  company: CompanyData & {
    products?: SanityProductDocument[];
    services?: SanityServiceDocument[];
    publicUsers?: PublicUser[];
    _id: string;
  };
}

function getImageUrl(image: SanityImage): string {
  if (!image || !image.asset) return '/images/placeholder-product.png';
  return `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${image.asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png').replace('-webp', '.webp')}`;
}

// Función para formatear el tamaño de empresa
function formatCompanySize(size?: string): string {
  if (!size) return '';
  const sizeMap: { [key: string]: string } = {
    'micro': 'Microempresa',
    'pequena': 'Pequeña',
    'mediana': 'Mediana',
    'grande': 'Grande',
    'indefinido': 'Tamaño no definido'
  };
  return sizeMap[size] || size;
}

// Función para obtener las etiquetas de grupos poblacionales
function getPeopleGroupLabels(groups?: string | string[]): string[] {
  if (!groups) return [];
  
  const groupsArray = Array.isArray(groups) ? groups : [groups];
  
  const peopleGroupMap: { [key: string]: string } = {
    'lgbtiq': 'LGBTIQ+',
    'discapacidad-sensorial': 'Personas con discapacidad Sensorial',
    'discapacidad-fisico-motora': 'Personas con discapacidad Físico Motora',
    'discapacidad-psicosocial': 'Personas con discapacidad Psicosocial',
    'discapacidad-cognitiva': 'Personas con discapacidad Cognitiva',
    'migrantes': 'Migrantes',
    'etnia-afrodescendientes': 'Etnia y Raza: Afrodescendientes, raizales y palenqueros',
    'etnia-indigenas': 'Etnia y Raza: Indígenas',
    'victimas-reconciliacion-paz': 'Víctimas de reconciliación y paz (víctimas, victimarios)',
    'pospenadas': 'Pospenadas',
    'diversidad-generacional-mayores-50': 'Diversidad Generacional mayores de 50 años',
    'diversidad-generacional-primer-empleo': 'Diversidad Generacional primer empleo',
    'madres-cabeza-familia': 'Madres cabeza de familia',
    'diversidad-sexual': 'Diversidad Sexual',
    'personas-discapacidad': 'Personas con discapacidad',
    'etnia-raza-afro': 'Etnia, raza o afro',
    'personas-migrantes': 'Personas migrantes',
    'generacional': 'Generacional',
    'equidad-genero': 'Equidad de Género',
    'pospenados-reinsertados': 'Pospenados o reinsertados',
    'ninguno': 'Ninguno',
    'otro': 'Otro'
  };
  
  return groupsArray
    .filter(group => group && group !== 'ninguno' && group !== 'otro')
    .map(group => peopleGroupMap[group] || group);
}

export default function EmpresaView({ company }: EmpresaViewProps) {
  const router = useRouter();
  const {
    nameCompany,
    businessName,
    description,
    logo,
    addressCompany,
    webSite,
    typeDocumentCompany,
    numDocumentCompany,
    ciiu,
    phone,
    companySize,
    peopleGroup,
    inclusionDEI,
    diverseSupplier,
    chamberOfCommerceValidated,
    taxIdentificationDocumentValidated,
    facebook,
    instagram,
    tiktok,
    pinterest,
    linkedin,
    xtwitter,
    products = [],
    services = [],
    publicUsers = [],
    _id,
  } = company;
  
  const peopleGroupLabels = getPeopleGroupLabels(peopleGroup);

  // Verificar si la empresa está validada (ambos documentos deben estar validados)
  const isCompanyValidated = chamberOfCommerceValidated === 'valido' && taxIdentificationDocumentValidated === 'valido';

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

        {/* Contenedor principal */}
        <div className="container mx-auto px-4 mt-20">
          {/* Tarjeta principal con nombre y badges */}
          <div className="bg-white rounded-lg shadow p-6 mb-6 flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-4">{nameCompany}</h1>
            <div className="flex flex-wrap gap-2 mb-6 justify-center">
              {isCompanyValidated && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border border-green-300">
                  <span>✓</span>
                  <span>Empresa Validada</span>
                </span>
              )}
              {inclusionDEI && (
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <span>🏆</span>
                  <span>Empresa Aliada DEI</span>
                </span>
              )}
              {diverseSupplier && (
                <span className="bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border border-rose-300">
                  <span>✨</span>
                  <span>Proveedora Diversa</span>
                </span>
              )}
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">{ciiu}</span>
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold uppercase">{typeDocumentCompany}: {numDocumentCompany}</span>
            </div>
            <div className="flex gap-2 mb-6">
              {phone && (
                <Button color="success" onClick={handleWhatsAppClick} className="rounded-full shadow">
                  <FaWhatsapp className="h-5 w-5" />
                </Button>
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
            <div className="flex gap-3 justify-center">
              {webSite && (
                <Button 
                  color="light" 
                  onClick={() => window.open(webSite, '_blank')}
                  className="flex items-center gap-2"
                >
                  <HiOutlineGlobeAlt className="h-5 w-5 mr-1" />
                  <span>Sitio Web</span>
                </Button>
              )}
              <Button color='blue' onClick={handleContactCompany}>
                Enviar mensaje
              </Button>
            </div>
          </div>

          {/* Información de contacto y datos básicos */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Información de contacto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Razón social</p>
                <p className="text-base text-gray-800 font-medium">{businessName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Dirección</p>
                <p className="text-base text-gray-800 font-medium">{addressCompany}</p>
              </div>
              {companySize && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Clasificación</p>
                  <p className="text-base text-gray-800 font-medium">{formatCompanySize(companySize)}</p>
                </div>
              )}
              {phone && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Teléfono</p>
                  <p className="text-base text-gray-800 font-medium">{phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Descripción de la empresa */}
          {description && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Sobre la empresa</h2>
              <p className="text-base text-gray-600 leading-relaxed">
                {description}
              </p>
            </div>
          )}

          {/* Grupos poblacionales */}
          {peopleGroupLabels.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Grupos Poblacionales</h2>
              <div className="flex flex-wrap gap-2">
                {peopleGroupLabels.map((label, index) => {
                  // Paleta de colores variada para las etiquetas
                  const colorClasses = [
                    'bg-indigo-100 text-indigo-800 border-indigo-200',
                    'bg-purple-100 text-purple-800 border-purple-200',
                    'bg-pink-100 text-pink-800 border-pink-200',
                    'bg-blue-100 text-blue-800 border-blue-200',
                    'bg-cyan-100 text-cyan-800 border-cyan-200',
                    'bg-teal-100 text-teal-800 border-teal-200',
                    'bg-green-100 text-green-800 border-green-200',
                    'bg-yellow-100 text-yellow-800 border-yellow-200',
                    'bg-orange-100 text-orange-800 border-orange-200',
                    'bg-red-100 text-red-800 border-red-200',
                    'bg-rose-100 text-rose-800 border-rose-200',
                    'bg-amber-100 text-amber-800 border-amber-200',
                  ];
                  const colorClass = colorClasses[index % colorClasses.length];
                  
                  return (
                    <span
                      key={index}
                      className={`${colorClass} px-3 py-1 rounded-full text-xs font-medium border`}
                    >
                      {label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Usuarios públicos */}
          {publicUsers && publicUsers.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Equipo</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {publicUsers.map((user) => {
                  const photoUrl = user.photo && typeof user.photo === 'object' 
                    ? getImageUrl(user.photo) 
                    : (user.photo as string | undefined) || '/images/placeholder-user.png';
                  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Usuario';
                  
                  const userPhoneFormatted = user.phone ? formatPhoneForWhatsApp(user.phone) : '';
                  
                  return (
                    <div key={user._id} className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-gray-200">
                        <img
                          src={photoUrl}
                          alt={fullName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1">{fullName}</h3>
                      {user.position && (
                        <p className="text-sm text-gray-600 mb-3">{user.position}</p>
                      )}
                      <div className="flex flex-col gap-2 w-full mt-2">
                        {user.email && (
                          <a 
                            href={`mailto:${user.email}`}
                            className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <HiMail className="w-4 h-4" />
                            <span className="truncate">{user.email}</span>
                          </a>
                        )}
                        {user.phone && (
                          <a 
                            href={`https://wa.me/${userPhoneFormatted}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 text-sm text-green-600 hover:text-green-800 transition-colors"
                          >
                            <HiPhone className="w-4 h-4" />
                            <span>{user.phone}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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