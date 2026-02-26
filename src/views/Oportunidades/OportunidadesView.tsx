'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Card, Spinner, Badge, TextInput } from 'flowbite-react';
import DashboardNavbar from '@/components/dashboard/Navbar';
import Link from 'next/link';
import { HiOutlineOfficeBuilding, HiCalendar, HiCurrencyDollar, HiOutlineSearch, HiX, HiAdjustments, HiViewGrid, HiViewList } from 'react-icons/hi';
import BgProduct from '@/assets/img/bg-productos.webp';

interface SanityImage {
  asset?: { _ref: string };
}

interface Opportunity {
  _id: string;
  title: string;
  cover?: SanityImage;
  startDate: string;
  maxApplicationDate: string;
  description: string;
  contractValue?: number;
  status: string;
  company?: {
    _id: string;
    nameCompany: string;
    logo?: SanityImage;
  };
}

interface CompanyOption {
  _id: string;
  nameCompany: string;
  logo?: SanityImage;
}

function getImageUrl(img?: SanityImage): string {
  if (!img?.asset?._ref) return '';
  const ref = img.asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png').replace('-webp', '.webp');
  return `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${ref}`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatDateShort(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function OportunidadesView() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [total, setTotal] = useState(0);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyOpen, setOnlyOpen] = useState(true);
  const [companyId, setCompanyId] = useState('');
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');
  const [startDateFrom, setStartDateFrom] = useState('');
  const [startDateTo, setStartDateTo] = useState('');
  const [maxDateFrom, setMaxDateFrom] = useState('');
  const [maxDateTo, setMaxDateTo] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (onlyOpen) params.set('status', 'open');
      params.set('includeCompanies', '1');
      if (searchTerm) params.set('search', searchTerm);
      if (companyId) params.set('companyId', companyId);
      if (minValue) params.set('minValue', minValue.replace(/\D/g, ''));
      if (maxValue) params.set('maxValue', maxValue.replace(/\D/g, ''));
      if (startDateFrom) params.set('startDateFrom', startDateFrom);
      if (startDateTo) params.set('startDateTo', startDateTo);
      if (maxDateFrom) params.set('maxDateFrom', maxDateFrom);
      if (maxDateTo) params.set('maxDateTo', maxDateTo);
      const res = await fetch(`/api/opportunities?${params}`);
      const data = await res.json();
      setOpportunities(data.opportunities || []);
      setTotal(data.total ?? 0);
      if (data.companies) setCompanies(data.companies);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [onlyOpen, searchTerm, companyId, minValue, maxValue, startDateFrom, startDateTo, maxDateFrom, maxDateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
    setSearchTerm(search);
  };

  const hasActiveFilters = !onlyOpen || searchTerm || companyId || minValue || maxValue || startDateFrom || startDateTo || maxDateFrom || maxDateTo;

  const clearFilters = () => {
    setSearch('');
    setSearchTerm('');
    setOnlyOpen(true);
    setCompanyId('');
    setMinValue('');
    setMaxValue('');
    setStartDateFrom('');
    setStartDateTo('');
    setMaxDateFrom('');
    setMaxDateTo('');
  };

  const selectedCompany = companies.find((c) => c._id === companyId);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      <main className="pt-16">
        {/* Banner con buscador */}
        <div className="relative h-[320px] sm:h-[400px] bg-slate-800">
          <div
            className="absolute inset-0 bg-cover bg-top before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-b before:from-black/50 before:to-black/50"
            style={{ backgroundImage: `url('${BgProduct.src}')` }}
          />
          <div className="relative z-10 container mx-auto px-4 h-full flex flex-col items-center justify-center text-white text-center">
            <h1 className="text-3xl md:text-4xl font-normal mb-6">
              Oportunidades de negocio
            </h1>
            <p className="text-slate-200 mb-6 max-w-xl">
              Licitaciones y convocatorias publicadas por empresas grandes. Postula tu empresa para participar.
            </p>
            <div className="w-full max-w-2xl flex flex-col md:flex-row gap-2">
              <TextInput
                type="text"
                icon={HiOutlineSearch}
                placeholder="Buscar por título o descripción..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-grow-0 w-full"
                theme={{
                  field: {
                    input: {
                      base: 'bg-white border-0 focus:ring-2 focus:ring-blue-500 w-full text-gray-900',
                    },
                  },
                }}
              />
              <Button color="blue" onClick={handleSearch} className="w-full md:w-auto">
                Buscar
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 flex flex-col-reverse md:flex-row gap-8 py-8 max-w-6xl">
          {/* Sidebar de filtros */}
          <aside className="w-full md:w-64 mb-4 md:mb-0">
            <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-5 sticky top-24 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <HiAdjustments className="text-blue-600" /> Filtros
              </h2>

              <div>
                <label className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
                  Estado
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOnlyOpen(true)}
                    className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-colors ${onlyOpen ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'hover:bg-gray-50 border border-transparent text-gray-600'}`}
                  >
                    Solo abiertas
                  </button>
                  <button
                    onClick={() => setOnlyOpen(false)}
                    className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-colors ${!onlyOpen ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'hover:bg-gray-50 border border-transparent text-gray-600'}`}
                  >
                    Todas
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
                  <HiOutlineOfficeBuilding className="text-blue-400" /> Empresa
                </label>
                <div className="space-y-0.5 max-h-40 overflow-y-auto">
                  <button
                    onClick={() => setCompanyId('')}
                    className={`w-full flex items-center gap-2 py-1.5 px-2 rounded-md text-left transition-colors ${!companyId ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'}`}
                  >
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <HiOutlineOfficeBuilding className="w-3 h-3 text-gray-500" />
                    </div>
                    <span className="text-xs truncate">Todas las empresas</span>
                  </button>
                  {companies.map((c) => {
                    const selected = companyId === c._id;
                    return (
                      <button
                        key={c._id}
                        onClick={() => setCompanyId(c._id)}
                        className={`w-full flex items-center gap-2 py-1.5 px-2 rounded-md text-left transition-colors ${selected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'}`}
                      >
                        {c.logo?.asset?._ref ? (
                          <img src={getImageUrl(c.logo)} alt="" className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <HiOutlineOfficeBuilding className="w-3 h-3 text-gray-500" />
                          </div>
                        )}
                        <span className="text-xs truncate">{c.nameCompany}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
                  <HiCurrencyDollar className="text-blue-400" /> Presupuesto (COP)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <TextInput
                    type="text"
                    placeholder="Mín."
                    value={minValue}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '');
                      setMinValue(v ? parseInt(v, 10).toLocaleString('es-CO') : '');
                    }}
                  />
                  <TextInput
                    type="text"
                    placeholder="Máx."
                    value={maxValue}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '');
                      setMaxValue(v ? parseInt(v, 10).toLocaleString('es-CO') : '');
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
                  <HiCalendar className="text-blue-400" /> Fecha inicio
                </label>
                <div className="space-y-2">
                  <TextInput
                    type="date"
                    placeholder="Desde"
                    value={startDateFrom}
                    onChange={(e) => setStartDateFrom(e.target.value)}
                  />
                  <TextInput
                    type="date"
                    placeholder="Hasta"
                    value={startDateTo}
                    onChange={(e) => setStartDateTo(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
                  <HiCalendar className="text-blue-400" /> Cierre postulaciones
                </label>
                <div className="space-y-2">
                  <TextInput
                    type="date"
                    placeholder="Desde"
                    value={maxDateFrom}
                    onChange={(e) => setMaxDateFrom(e.target.value)}
                  />
                  <TextInput
                    type="date"
                    placeholder="Hasta"
                    value={maxDateTo}
                    onChange={(e) => setMaxDateTo(e.target.value)}
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <Button color="gray" size="sm" onClick={clearFilters} className="w-full">
                  <HiX className="w-4 h-4 mr-1" />
                  Limpiar filtros
                </Button>
              )}
            </div>
          </aside>

          {/* Resultados */}
          <div className="flex-1">
            {/* Chips de filtros activos */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {!onlyOpen && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                    Mostrando todas
                    <button onClick={() => setOnlyOpen(true)} className="ml-2 hover:text-gray-900">
                      <HiX className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {searchTerm && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                    Búsqueda: {searchTerm}
                    <button onClick={() => { setSearch(''); setSearchTerm(''); }} className="ml-2 hover:text-gray-900">
                      <HiX className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedCompany && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                    {selectedCompany.logo?.asset?._ref && (
                      <img src={getImageUrl(selectedCompany.logo)} alt="" className="w-4 h-4 rounded-full" />
                    )}
                    {selectedCompany.nameCompany}
                    <button onClick={() => setCompanyId('')} className="hover:text-blue-900">
                      <HiX className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {(minValue || maxValue) && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                    {minValue && `Mín: ${minValue}`}
                    {minValue && maxValue && ' - '}
                    {maxValue && `Máx: ${maxValue}`} COP
                    <button onClick={() => { setMinValue(''); setMaxValue(''); }} className="ml-2 hover:text-green-900">
                      <HiX className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {(startDateFrom || startDateTo) && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-700">
                    Inicio: {startDateFrom ? formatDateShort(startDateFrom) : '…'} - {startDateTo ? formatDateShort(startDateTo) : '…'}
                    <button onClick={() => { setStartDateFrom(''); setStartDateTo(''); }} className="ml-2 hover:text-amber-900">
                      <HiX className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {(maxDateFrom || maxDateTo) && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-700">
                    Cierre: {maxDateFrom ? formatDateShort(maxDateFrom) : '…'} - {maxDateTo ? formatDateShort(maxDateTo) : '…'}
                    <button onClick={() => { setMaxDateFrom(''); setMaxDateTo(''); }} className="ml-2 hover:text-amber-900">
                      <HiX className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {!loading && (
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <p className="text-sm text-gray-500">
                  Mostrando {opportunities.length} resultado{opportunities.length !== 1 ? 's' : ''} de {total}
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    title="Vista en cuadrícula"
                  >
                    <HiViewGrid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    title="Vista en lista"
                  >
                    <HiViewList className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-16">
                <Spinner size="xl" />
              </div>
            ) : opportunities.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-500">
                  {hasActiveFilters
                    ? 'No se encontraron oportunidades con los filtros seleccionados.'
                    : 'No hay oportunidades abiertas en este momento.'}
                </p>
                <p className="text-sm text-gray-400 mt-2">Vuelve más tarde para ver nuevas convocatorias.</p>
                {hasActiveFilters && (
                  <Button color="blue" onClick={clearFilters} className="mt-4">
                    Limpiar filtros
                  </Button>
                )}
              </Card>
            ) : viewMode === 'list' ? (
              <div className="space-y-4">
                {opportunities.map((opp) => {
                  const isExpiringSoon = new Date(opp.maxApplicationDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                  return (
                    <Link key={opp._id} href={`/oportunidades/${opp._id}`}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap gap-2 mb-2">
                              <Badge color={opp.status === 'open' ? 'success' : 'gray'}>
                                {opp.status === 'open' ? 'Abierta' : opp.status}
                              </Badge>
                              {isExpiringSoon && (
                                <Badge color="warning">Pronto a cerrar</Badge>
                              )}
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 line-clamp-1">{opp.title}</h2>
                            {opp.company && (
                              <div className="flex items-center gap-2 mt-1 text-gray-600">
                                {opp.company.logo ? (
                                  <img src={getImageUrl(opp.company.logo)} alt="" className="w-5 h-5 rounded-full object-cover" />
                                ) : (
                                  <HiOutlineOfficeBuilding className="w-4 h-4" />
                                )}
                                <span className="text-sm">{opp.company.nameCompany}</span>
                              </div>
                            )}
                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">{opp.description}</p>
                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <HiCalendar className="w-4 h-4" />
                                Cierre: {formatDate(opp.maxApplicationDate)}
                              </span>
                              {opp.contractValue && (
                                <span className="flex items-center gap-1">
                                  <HiCurrencyDollar className="w-4 h-4" />
                                  {formatCurrency(opp.contractValue)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <Button color="blue">Ver detalles</Button>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {opportunities.map((opp) => {
                  const isExpiringSoon = new Date(opp.maxApplicationDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                  return (
                    <Link key={opp._id} href={`/oportunidades/${opp._id}`}>
                      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                        <div className="h-40 -mx-4 -mt-4 mb-4 overflow-hidden">
                          {opp.cover?.asset?._ref ? (
                            <img
                              src={getImageUrl(opp.cover)}
                              alt={opp.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                          )}
                        </div>
                        <div className="flex justify-between items-start mb-2">
                          <Badge color={opp.status === 'open' ? 'success' : 'gray'}>
                            {opp.status === 'open' ? 'Abierta' : opp.status}
                          </Badge>
                          {isExpiringSoon && (
                            <Badge color="warning">Pronto a cerrar</Badge>
                          )}
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 line-clamp-2">{opp.title}</h2>
                        {opp.company && (
                          <div className="flex items-center gap-2 mt-2 text-gray-600">
                            {opp.company.logo ? (
                              <img src={getImageUrl(opp.company.logo)} alt="" className="w-6 h-6 rounded-full object-cover" />
                            ) : (
                              <HiOutlineOfficeBuilding className="w-5 h-5" />
                            )}
                            <span className="text-sm">{opp.company.nameCompany}</span>
                          </div>
                        )}
                        <p className="text-gray-600 text-sm mt-2 line-clamp-2">{opp.description}</p>
                        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <HiCalendar className="w-4 h-4" />
                            Cierre: {formatDate(opp.maxApplicationDate)}
                          </span>
                          {opp.contractValue && (
                            <span className="flex items-center gap-1">
                              <HiCurrencyDollar className="w-4 h-4" />
                              {formatCurrency(opp.contractValue)}
                            </span>
                          )}
                        </div>
                        <Button color="blue" className="mt-4 w-full">
                          Ver detalles y postular
                        </Button>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
