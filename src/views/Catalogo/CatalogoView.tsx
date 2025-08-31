"use client";

import { useState, useEffect } from 'react';
import { TextInput, Select, Spinner, Button } from 'flowbite-react';
import { HiOutlineSearch, HiX, HiTag, HiOfficeBuilding, HiAdjustments, HiMail, HiRefresh } from 'react-icons/hi';
import DashboardNavbar from '@/components/dashboard/Navbar';
import { SanityProductDocument, SanityServiceDocument, SanityCategoryDocument } from '@/types/sanity';
import BgProduct from '@/assets/img/bg-productos.webp';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCatalogSync } from '@/hooks/useCatalogSync';
import CatalogUpdateNotification from '@/components/CatalogUpdateNotification';
import { getFirstImageUrl, isValidImage, getSanityImageUrl } from '@/utils/sanityImage';

interface Company {
  _id: string;
  nameCompany: string;
}

interface CatalogoViewProps {
  products: SanityProductDocument[];
  services: SanityServiceDocument[];
  categories: SanityCategoryDocument[];
  companies: Company[];
  isLoading: boolean;
}

export default function CatalogoView({ products: initialProducts, services: initialServices, categories: initialCategories, companies: initialCompanies, isLoading }: CatalogoViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('all');
  const [company, setCompany] = useState('');
  
  // Estado local para manejar datos frescos
  const [products, setProducts] = useState(initialProducts);
  const [services, setServices] = useState(initialServices);
  const [categories, setCategories] = useState(initialCategories);
  const [companies, setCompanies] = useState(initialCompanies);
  const [isRefreshing, setIsRefreshing] = useState(false);

  type CompanyRef = { _id?: string; _ref?: string } | null | undefined;
  const getCompanyId = (companyObj: CompanyRef): string => {
    if (!companyObj) return '';
    if ('_id' in companyObj && companyObj._id) return companyObj._id;
    if ('_ref' in companyObj && companyObj._ref) return companyObj._ref;
    return '';
  };

  const filteredProducts = products.filter(
    (item) =>
      item.status === 'active' &&
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!category || (Array.isArray(item.category) && item.category.some(cat => typeof cat === 'string' ? cat === category : cat._ref === category || cat._id === category))) &&
      (!company || (item.company && getCompanyId(item.company) === company))
  );
  const filteredServices = services.filter(
    (item) =>
      item.status === 'active' &&
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!category || (Array.isArray(item.category) && item.category.some(cat => typeof cat === 'string' ? cat === category : cat._ref === category || cat._id === category))) &&
      (!company || (item.company && getCompanyId(item.company) === company))
  );

  const itemsToShow = type === 'product' ? filteredProducts : type === 'service' ? filteredServices : [...filteredProducts, ...filteredServices];

  const handleSearch = () => {
    setSearchTerm(search);
  };

  const handleContactCompany = (companyId: string) => {
    // Redirigir al dashboard de mensajes con la empresa pre-seleccionada
    router.push(`/dashboard/mensajes?empresa=${companyId}`);
  };

  // Función para refrescar datos frescos del catálogo
  const refreshCatalogData = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/catalog/fresh');
      if (!response.ok) {
        throw new Error('Error al obtener datos frescos');
      }
      
      const result = await response.json();
      if (result.success) {
        setProducts(result.data.products);
        setServices(result.data.services);
        setCategories(result.data.categories);
        setCompanies(result.data.companies);
      }
    } catch (error) {
      console.error('Error refreshing catalog data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Usar el hook de sincronización del catálogo
  useCatalogSync({
    onCatalogUpdate: () => {
      // Actualizar los datos cuando se detecte una actualización
      refreshCatalogData();
    },
    syncInterval: 60000 // Sincronizar cada minuto
  });

  // Escuchar eventos de actualización del catálogo
  useEffect(() => {
    const handleCatalogUpdate = () => {
      refreshCatalogData();
    };

    window.addEventListener('catalog-updated', handleCatalogUpdate);
    
    return () => {
      window.removeEventListener('catalog-updated', handleCatalogUpdate);
    };
  }, []);



  // Función para verificar si la empresa es la del usuario actual
  const isUserCompany = (companyId: string) => {
    return user?.company?._id === companyId;
  };

  const getCategoryImageUrl = (cat: SanityCategoryDocument): string | null => {
    if (cat.image && cat.image.asset) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return getSanityImageUrl(cat.image.asset as any);
    }
    return null;
  };



  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      <main className="pt-16">
        {/* Banner superior igual a empresas */}
        <div className="relative h-[600px] bg-slate-800">
          <div
            className="absolute inset-0 bg-cover bg-top before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-b before:from-black/50 before:to-black/50"
            style={{ backgroundImage: `url('${BgProduct.src}')` }}
          />
          <div className="relative z-10 container mx-auto px-4 h-full flex flex-col items-center justify-center text-white text-center">
            <h1 className="text-3xl md:text-4xl font-normal mb-6">
              Explora el catálogo de<br />
              <span className="font-bold">productos y servicios</span>
            </h1>
            <div className="w-full max-w-2xl flex flex-col md:flex-row gap-2">
              <TextInput
                type="text"
                icon={HiOutlineSearch}
                placeholder="Buscar producto o servicio"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-grow-0 w-full"
                theme={{
                  field: {
                    input: {
                      base: "bg-white border-0 focus:ring-2 focus:ring-blue-500 w-full"
                    }
                  }
                }}
              />
              <button
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded px-6 py-2 transition-colors"
                onClick={handleSearch}
                type="button"
              >
                Buscar
              </button>
            </div>
            <div className="mt-4">
              <Button
                color="gray"
                size="sm"
                onClick={refreshCatalogData}
                disabled={isRefreshing}
                className="flex items-center gap-2"
              >
                <HiRefresh className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Actualizando...' : 'Actualizar catálogo'}
              </Button>
            </div>
          </div>
        </div>
        {/* Grid de categorías debajo del banner */}
        <div className="container mx-auto px-4 pt-8">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Categorías</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {categories.map(cat => {
                const selected = category === cat._id;
                const imageUrl = getCategoryImageUrl(cat);
                return (
                  <button
                    key={cat._id}
                    onClick={() => setCategory(selected ? '' : cat._id)}
                    className={`flex flex-col items-center justify-center rounded-xl border-2 transition-all p-2 h-24 bg-white shadow hover:shadow-lg cursor-pointer focus:outline-none ${selected ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-100'}`}
                  >
                    {imageUrl ? (
                      <img src={imageUrl} alt={cat.name} className="w-10 h-10 object-cover rounded-full mb-1 border border-gray-200" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mb-1 text-gray-400 text-xl">🏷️</div>
                    )}
                    <span className={`text-xs font-medium text-center ${selected ? 'text-blue-700' : 'text-gray-700'}`}>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        {/* Sidebar de filtros mejorado */}
        <div className="container mx-auto px-4 flex flex-col-reverse md:flex-row gap-8 pb-10">
          <aside className="w-full md:w-64 mb-4 md:mb-0">
            <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-6 sticky top-24 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-2"><HiAdjustments className="text-blue-600" /> Filtros</h2>
              <div>
                <label className="font-semibold text-gray-700 flex items-center gap-2 mb-1"><HiTag className="text-blue-400" /> Categoría</label>
                <Select value={category} onChange={e => setCategory(e.target.value)} className="rounded-lg border-gray-200">
                  <option value="">Todas las categorías</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="font-semibold text-gray-700 flex items-center gap-2 mb-1"><HiAdjustments className="text-blue-400" /> Tipo</label>
                <Select value={type} onChange={e => setType(e.target.value)} className="rounded-lg border-gray-200">
                  <option value="all">Productos y Servicios</option>
                  <option value="product">Solo Productos</option>
                  <option value="service">Solo Servicios</option>
                </Select>
              </div>
              <div>
                <label className="font-semibold text-gray-700 flex items-center gap-2 mb-1"><HiOfficeBuilding className="text-blue-400" /> Empresa</label>
                <Select value={company} onChange={e => setCompany(e.target.value)} className="rounded-lg border-gray-200">
                  <option value="">Todas las empresas</option>
                  {companies.map(comp => (
                    <option key={comp._id} value={comp._id}>{comp.nameCompany}</option>
                  ))}
                </Select>
              </div>
            </div>
          </aside>
          <div className="flex-1">
            <div className="container mx-auto lg:px-4">
              {/* Chips de filtros activos */}
              {(searchTerm || category || type !== 'all' || company) && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {searchTerm && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                      Búsqueda: {searchTerm}
                      <button
                        onClick={() => { setSearch(''); setSearchTerm(''); }}
                        className="ml-2 hover:text-gray-900"
                      >
                        <HiX className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {category && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                      Categoría: {categories.find(cat => cat._id === category)?.name}
                      <button
                        onClick={() => setCategory('')}
                        className="ml-2 hover:text-blue-900"
                      >
                        <HiX className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {type !== 'all' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700">
                      Tipo: {type === 'product' ? 'Productos' : 'Servicios'}
                      <button
                        onClick={() => setType('all')}
                        className="ml-2 hover:text-purple-900"
                      >
                        <HiX className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {company && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                      Empresa: {companies.find(comp => comp._id === company)?.nameCompany}
                      <button
                        onClick={() => setCompany('')}
                        className="ml-2 hover:text-green-900"
                      >
                        <HiX className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Spinner size="xl" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {itemsToShow.length === 0 ? (
                    <div className="col-span-full text-center text-gray-500">No hay resultados.</div>
                  ) : (
                    itemsToShow.map(item => (
                      <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="relative h-48">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {isValidImage(item.images?.[0] as any) ? (
                            <img
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              src={getFirstImageUrl(item.images as any)}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error('Error loading image:', e);
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          <div className={`w-full h-full bg-gray-200 flex items-center justify-center ${isValidImage(item.images?.[0] as any) ? 'hidden' : ''}`}>
                            <span className="text-gray-400">Sin imagen</span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                          <p className="text-gray-600 text-sm mb-2">{item.description || 'Sin descripción'}</p>
                          
                          {/* Categoría y Empresa */}
                          <div className="flex flex-col gap-1 mb-3">
                            {item.category && Array.isArray(item.category) && item.category.length > 0 && (
                              <div className="flex items-center gap-1">
                                <HiTag className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  {item.category.map(cat => {
                                    const categoryObj = categories.find(c => 
                                      (typeof cat === 'string' ? c._id === cat : c._id === (cat._ref || cat._id))
                                    );
                                    return categoryObj?.name;
                                  }).filter(Boolean).join(', ')}
                                </span>
                              </div>
                            )}
                            {item.company && (
                              <div className="flex items-center gap-1">
                                <HiOfficeBuilding className="w-4 h-4 text-gray-400" />
                                <a 
                                  href={`/empresas/${getCompanyId(item.company)}`}
                                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                >
                                  {companies.find(comp => comp._id === getCompanyId(item.company))?.nameCompany}
                                </a>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-between items-center mb-3">
                            <span className={`leading-4 py-1 rounded-full text-sm font-semibold ${item.price ? 'text-green-600' : 'text-slate-400'}`}>
                              {item.price ? `$${item.price.toLocaleString()}` : 'Precio no especificado'}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Activo</span>
                          </div>

                          {/* Botón Contactar Empresa */}
                          {item.company && !isUserCompany(getCompanyId(item.company)) && (
                            <Button
                              color="blue"
                              size="sm"
                              onClick={() => handleContactCompany(getCompanyId(item.company))}
                              fullSized
                              // className="w-full flex items-center justify-center gap-3"
                            >
                              <HiMail className="w-4 h-4 mr-2 mt-0.5" />
                              Contactar empresa
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Notificación de actualización del catálogo */}
      <CatalogUpdateNotification 
        onRefresh={refreshCatalogData}
        isRefreshing={isRefreshing}
      />
    </div>
  );
} 