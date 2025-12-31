'use client';

import { Button, TextInput, Select, Label } from 'flowbite-react';
import { HiSearch, HiX, HiArrowUp, HiArrowDown } from 'react-icons/hi';
import CompanyCard from '@/components/CompanyCard';
import DashboardNavbar from '@/components/dashboard/Navbar';
import BannerEmpresas from '@/assets/img/banner-empresas.webp';
import { useEffect, useState, useRef } from 'react';
import { getDepartamentosOptions, getCiudadesOptionsByDepartamento } from '@/utils/departamentosCiudades';
import ReactSelect, { StylesConfig, CSSObjectWithLabel } from 'react-select';

interface SanityImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
}

interface Company {
  _id: string;
  nameCompany: string;
  businessName: string;
  logo: SanityImage;
  addressCompany: string;
  webSite: string;
  sector: string;
  typeDocumentCompany: string;
  numDocumentCompany: string;
  ciiu: string;
  department?: string;
  city?: string;
  active: boolean;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  pinterest?: string;
  linkedin?: string;
  xtwitter?: string;
}

interface EmpresasViewProps {
  companies: Company[];
  isLoading: boolean;
  totalResults: number;
  currentPage: number;
  searchTerm: string;
  searchQuery: string;
  sector: string[];
  department: string;
  city: string;
  peopleGroup: string[];
  companySize: string[];
  inclusionDEI: string;
  selectedFilters: string[];
  onSearchTermChange: (value: string) => void;
  onSearchSubmit: () => void;
  onSectorChange: (values: string[]) => void;
  onDepartmentChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onPeopleGroupChange: (values: string[]) => void;
  onCompanySizeChange: (values: string[]) => void;
  onInclusionDEIChange: (value: string) => void;
  sortField: 'nameCompany' | '_createdAt';
  sortDirection: 'asc' | 'desc';
  onSortChange: (field: 'nameCompany' | '_createdAt', direction: 'asc' | 'desc') => void;
  onPageChange: (page: number) => void;
  onRemoveFilter: (filter: string) => void;
}

export default function EmpresasView({
  companies,
  isLoading,
  totalResults,
  currentPage,
  searchTerm,
  searchQuery,
  sector,
  department,
  city,
  peopleGroup,
  companySize,
  inclusionDEI,
  selectedFilters,
  onSearchTermChange,
  onSearchSubmit,
  onSectorChange,
  onDepartmentChange,
  onCityChange,
  onPeopleGroupChange,
  onCompanySizeChange,
  onInclusionDEIChange,
  sortField,
  sortDirection,
  onSortChange,
  onPageChange,
  onRemoveFilter
}: EmpresasViewProps) {
  const [recentCompanies, setRecentCompanies] = useState<Company[]>([]);
  const [isClient, setIsClient] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  // Estados para departamentos y ciudades
  const [departamentosOptions] = useState(() => getDepartamentosOptions());
  const [ciudadesOptions, setCiudadesOptions] = useState<{ value: string; label: string; }[]>([]);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Scroll a resultados cuando cambian las empresas o se realiza una búsqueda
  useEffect(() => {
    if (companies.length > 0 && resultsRef.current && !isLoading) {
      // Pequeño delay para asegurar que el DOM esté actualizado
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [companies, searchQuery, isLoading]);
  
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('recentCompanies') || '[]');
      setRecentCompanies(stored);
    } catch {
      setRecentCompanies([]);
    }
  }, []);

  // Actualizar opciones de ciudades cuando cambie el departamento
  useEffect(() => {
    if (department) {
      const ciudades = getCiudadesOptionsByDepartamento(department);
      setCiudadesOptions(ciudades);
    } else {
      setCiudadesOptions([]);
    }
  }, [department]);

  // Obtener los CIIU únicos de las empresas
  const ciiuOptions = Array.from(new Set(companies.map((c) => c.ciiu).filter(Boolean))).map(ciiu => ({
    value: ciiu,
    label: ciiu
  }));

  // Opciones para tamaño de empresa
  const companySizeOptions = [
    { value: 'micro', label: 'Micro' },
    { value: 'pequena', label: 'Pequeña' },
    { value: 'mediana', label: 'Mediana' },
    { value: 'grande', label: 'Grande' },
    { value: 'indefinido', label: 'Indefinido' }
  ];

  // Opciones para grupos poblacionales
  const peopleGroupOptions = [
    { value: 'lgbtiq', label: 'LGBTIQ+' },
    { value: 'discapacidad-sensorial', label: 'Personas con discapacidad Sensorial' },
    { value: 'discapacidad-fisico-motora', label: 'Personas con discapacidad Físico Motora' },
    { value: 'discapacidad-psicosocial', label: 'Personas con discapacidad Psicosocial' },
    { value: 'discapacidad-cognitiva', label: 'Personas con discapacidad Cognitiva' },
    { value: 'migrantes', label: 'Migrantes' },
    { value: 'etnia-afrodescendientes', label: 'Etnia y Raza: Afrodescendientes, raizales y palenqueros' },
    { value: 'etnia-indigenas', label: 'Etnia y Raza: Indígenas' },
    { value: 'victimas-reconciliacion-paz', label: 'Víctimas de reconciliación y paz (víctimas, victimarios)' },
    { value: 'pospenadas', label: 'Pospenadas' },
    { value: 'diversidad-generacional-mayores-50', label: 'Diversidad Generacional mayores de 50 años' },
    { value: 'diversidad-generacional-primer-empleo', label: 'Diversidad Generacional primer empleo' },
    { value: 'madres-cabeza-familia', label: 'Madres cabeza de familia' },
    { value: 'diversidad-sexual', label: 'Diversidad Sexual' },
    { value: 'personas-discapacidad', label: 'Personas con discapacidad' },
    { value: 'etnia-raza-afro', label: 'Etnia, raza o afro' },
    { value: 'personas-migrantes', label: 'Personas migrantes' },
    { value: 'generacional', label: 'Generacional' },
    { value: 'equidad-genero', label: 'Equidad de Género' },
    { value: 'pospenados-reinsertados', label: 'Pospenados o reinsertados' },
    { value: 'ninguno', label: 'Ninguno' },
    { value: 'otro', label: 'Otro' }
  ];

  // Estilos personalizados para react-select (filtros azules)
  const filterSelectStyles: StylesConfig = {
    control: (base: CSSObjectWithLabel) => ({
      ...base,
      backgroundColor: '#eff6ff',
      borderColor: '#93c5fd',
      '&:hover': {
        borderColor: '#3b82f6'
      }
    }),
    multiValue: (base: CSSObjectWithLabel) => ({
      ...base,
      backgroundColor: '#dbeafe'
    }),
    multiValueLabel: (base: CSSObjectWithLabel) => ({
      ...base,
      color: '#1e40af'
    }),
    multiValueRemove: (base: CSSObjectWithLabel) => ({
      ...base,
      color: '#1e40af',
      '&:hover': {
        backgroundColor: '#93c5fd',
        color: '#fff'
      }
    })
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      <main className="pt-16">
        <div className="relative h-[600px] bg-slate-800">
          <div
            className="absolute inset-0 bg-cover bg-top before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-b before:from-black/50 before:to-black/50"
            style={{ backgroundImage: `url('${BannerEmpresas.src}')` }}
          />
          <div className="relative z-10 container mx-auto px-4 h-full flex flex-col items-center justify-center text-white text-center">
            <h1 className="text-3xl md:text-4xl font-normal mb-6">
              Conecta con las organizaciones y<br />
              PYMES más diversas de <span className="font-bold">América Latina</span>
            </h1>
            <div className="w-full max-w-2xl flex flex-col md:flex-row gap-2">
              <TextInput
                type="text"
                placeholder="Buscar Empresa"
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSearchSubmit();
                  }
                }}
                className="flex-grow-0 w-full"
                icon={HiSearch}
                theme={{
                  field: {
                    input: {
                      base: "bg-white border-0 focus:ring-2 focus:ring-blue-500 w-full"
                    }
                  }
                }}
              />
              <Button 
                color="blue"
                onClick={onSearchSubmit}
                className="w-full md:w-auto"
              >
                Buscar
              </Button>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col justify-between items-start gap-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Empresas</h2>
            <div className="flex flex-wrap gap-4 md:gap-x-4">
              <div className="min-w-[150px]">
                <Label htmlFor="sector-filter" className="text-sm font-medium text-gray-700 mb-1 block">
                  Sector (CIIU)
                </Label>
                {isClient ? (
                  <ReactSelect
                    id="sector-filter"
                    instanceId="sector-filter-select"
                    isMulti
                    options={ciiuOptions}
                    value={ciiuOptions.filter(opt => sector.includes(opt.value))}
                    onChange={(selected) => {
                      if (selected && Array.isArray(selected)) {
                        onSectorChange(selected.map(s => s.value));
                      } else {
                        onSectorChange([]);
                      }
                    }}
                    placeholder="Seleccionar sectores"
                    styles={filterSelectStyles}
                    className="text-sm"
                    noOptionsMessage={() => "No hay opciones"}
                  />
                ) : (
                  <div className="h-10 bg-blue-50 border border-blue-300 rounded text-sm flex items-center px-3 text-gray-500">
                    Cargando...
                  </div>
                )}
              </div>
              <div className="min-w-[150px]">
                <Label htmlFor="department-filter" className="text-sm font-medium text-gray-700 mb-1 block">
                  Departamento
                </Label>
                <Select 
                  id="department-filter"
                  value={department} 
                  onChange={(e) => onDepartmentChange(e.target.value)}
                  className="min-w-[150px]"
                  theme={{
                    field: {
                      select: {
                        base: "bg-blue-50 border-blue-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                      }
                    }
                  }}
                >
                  <option value="">Todos los departamentos</option>
                  {departamentosOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Select>
              </div>
              <div className="min-w-[150px]">
                <Label htmlFor="city-filter" className="text-sm font-medium text-gray-700 mb-1 block">
                  Ciudad
                </Label>
                <Select 
                  id="city-filter"
                  value={city} 
                  onChange={(e) => onCityChange(e.target.value)}
                  className="min-w-[150px]"
                  disabled={!department}
                  theme={{
                    field: {
                      select: {
                        base: `bg-blue-50 border-blue-300 text-sm focus:border-blue-500 focus:ring-blue-500 ${!department ? "bg-gray-100 text-gray-500 border-gray-200" : ""}`
                      }
                    }
                  }}
                >
                  <option value="">Todas las ciudades</option>
                  {ciudadesOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Select>
              </div>
              <div className="min-w-[150px]">
                <Label htmlFor="company-size-filter" className="text-sm font-medium text-gray-700 mb-1 block">
                  Tamaño de empresa
                </Label>
                {isClient ? (
                  <ReactSelect
                    id="company-size-filter"
                    instanceId="company-size-filter-select"
                    isMulti
                    options={companySizeOptions}
                    value={companySizeOptions.filter(opt => companySize.includes(opt.value))}
                    onChange={(selected) => {
                      if (selected && Array.isArray(selected)) {
                        onCompanySizeChange(selected.map(s => s.value));
                      } else {
                        onCompanySizeChange([]);
                      }
                    }}
                    placeholder="Seleccionar tamaños"
                    styles={filterSelectStyles}
                    className="text-sm"
                    noOptionsMessage={() => "No hay opciones"}
                  />
                ) : (
                  <div className="h-10 bg-blue-50 border border-blue-300 rounded text-sm flex items-center px-3 text-gray-500">
                    Cargando...
                  </div>
                )}
              </div>
              <div className="min-w-[180px]">
                <Label htmlFor="people-group-filter" className="text-sm font-medium text-gray-700 mb-1 block">
                  Grupo poblacional
                </Label>
                {isClient ? (
                  <ReactSelect
                    id="people-group-filter"
                    instanceId="people-group-filter-select"
                    isMulti
                    options={peopleGroupOptions}
                    value={peopleGroupOptions.filter(opt => peopleGroup.includes(opt.value))}
                    onChange={(selected) => {
                      if (selected && Array.isArray(selected)) {
                        onPeopleGroupChange(selected.map(s => s.value));
                      } else {
                        onPeopleGroupChange([]);
                      }
                    }}
                    placeholder="Seleccionar grupos"
                    styles={filterSelectStyles}
                    className="text-sm"
                    noOptionsMessage={() => "No hay opciones"}
                  />
                ) : (
                  <div className="h-10 bg-blue-50 border border-blue-300 rounded text-sm flex items-center px-3 text-gray-500">
                    Cargando...
                  </div>
                )}
              </div>
              <div className="min-w-[150px]">
                <Label htmlFor="inclusion-dei-filter" className="text-sm font-medium text-gray-700 mb-1 block">
                  Política DEI
                </Label>
                <Select 
                  id="inclusion-dei-filter"
                  value={inclusionDEI} 
                  onChange={(e) => onInclusionDEIChange(e.target.value)}
                  className="min-w-[150px]"
                  theme={{
                    field: {
                      select: {
                        base: "bg-blue-50 border-blue-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                      }
                    }
                  }}
                >
                  <option value="">Todas las empresas</option>
                  <option value="yes">Empresa Aliada DEI</option>
                  <option value="no">Sin política DEI</option>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="sort-field" className="text-sm font-medium text-gray-700">
                  Ordenar por
                </Label>
                <div className="flex items-center gap-2">
                  <Select
                    id="sort-field"
                    value={sortField}
                    onChange={(e) => onSortChange(e.target.value as 'nameCompany' | '_createdAt', sortDirection)}
                    className="min-w-[120px]"
                    theme={{
                      field: {
                        select: {
                          base: "bg-gray-50 border-gray-300 text-sm text-gray-700 focus:border-gray-400 focus:ring-gray-400"
                        }
                      }
                    }}
                  >
                    <option value="_createdAt">Fecha</option>
                    <option value="nameCompany">Nombre</option>
                  </Select>
                  <div className="flex items-center gap-1">
                    <Button
                      size="xs"
                      color={sortDirection === 'asc' ? 'gray' : 'light'}
                      onClick={() => onSortChange(sortField, 'asc')}
                      className="flex items-center"
                      title="Orden ascendente"
                    >
                      <HiArrowUp className="w-4 h-4" />
                    </Button>
                    <Button
                      size="xs"
                      color={sortDirection === 'desc' ? 'gray' : 'light'}
                      onClick={() => onSortChange(sortField, 'desc')}
                      className="flex items-center"
                      title="Orden descendente"
                    >
                      <HiArrowDown className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {selectedFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedFilters.map((filter) => (
                <span
                  key={filter}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                >
                  {filter}
                  <button
                    onClick={() => onRemoveFilter(filter)}
                    className="ml-2 hover:text-gray-900"
                  >
                    <HiX className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          {searchQuery && !isLoading && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {totalResults} {totalResults === 1 ? 'Resultado' : 'Resultados'} para &quot;{searchQuery}&quot;
              </h2>
            </div>
          )}
          <div ref={resultsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              Array(6).fill(null).map((_, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full mr-3" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-200 rounded flex-1" />
                    <div className="h-8 bg-gray-200 rounded flex-1" />
                  </div>
                </div>
              ))
            ) : (
              companies.map((company) => (
                <CompanyCard
                  key={company._id}
                  {...company}
                  searchTerm={searchQuery}
                />
              ))
            )}
          </div>
          <div className="mt-8 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Resultados: {Math.min((currentPage - 1) * 9 + 1, totalResults)}-{Math.min(currentPage * 9, totalResults)} de {totalResults} items
            </p>
            <div className="flex gap-2">
              <Button 
                color="gray"
                size="sm"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || isLoading}
              >
                Atrás
              </Button>
              <Button 
                color="gray"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage * 9 >= totalResults || isLoading}
              >
                Siguiente
              </Button>
            </div>
          </div>
          {/* Sección de empresas consultadas recientemente */}
          {recentCompanies.length > 0 && !searchQuery && (
            <div className="bg-white rounded-lg border border-gray-200 mt-8 p-6">
              <h3 className="text-lg font-semibold mb-4">Consultado recientemente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentCompanies.map((company) => (
                  <CompanyCard key={company._id} {...company} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 