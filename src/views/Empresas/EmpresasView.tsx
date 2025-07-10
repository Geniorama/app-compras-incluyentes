'use client';

import { Button, TextInput, Select } from 'flowbite-react';
import { HiSearch, HiX } from 'react-icons/hi';
import CompanyCard from '@/components/CompanyCard';
import DashboardNavbar from '@/components/dashboard/Navbar';
import BannerEmpresas from '@/assets/img/banner-empresas.webp';
import { useEffect, useState } from 'react';
import { getDepartamentosOptions, getCiudadesOptionsByDepartamento } from '@/utils/departamentosCiudades';

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
  sector: string;
  department: string;
  city: string;
  selectedFilters: string[];
  onSearchTermChange: (value: string) => void;
  onSectorChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onSearch: () => void;
  onRemoveFilter: (filter: string) => void;
}

export default function EmpresasView({
  companies,
  isLoading,
  totalResults,
  currentPage,
  searchTerm,
  sector,
  department,
  city,
  selectedFilters,
  onSearchTermChange,
  onSectorChange,
  onDepartmentChange,
  onCityChange,
  onPageChange,
  onSearch,
  onRemoveFilter
}: EmpresasViewProps) {
  const [recentCompanies, setRecentCompanies] = useState<Company[]>([]);
  
  // Estados para departamentos y ciudades
  const [departamentosOptions] = useState(() => getDepartamentosOptions());
  const [ciudadesOptions, setCiudadesOptions] = useState<{ value: string; label: string; }[]>([]);

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
  const ciiuOptions = Array.from(new Set(companies.map((c) => c.ciiu).filter(Boolean)));

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
                onClick={onSearch}
                className="w-full md:w-auto"
              >
                Buscar
              </Button>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Empresas</h2>
            <div className="flex flex-wrap gap-2 md:gap-x-4">
              <Select 
                value={sector} 
                onChange={(e) => onSectorChange(e.target.value)}
                className="min-w-[150px]"
                theme={{
                  field: {
                    select: {
                      base: "bg-white border-gray-200 text-sm"
                    }
                  }
                }}
              >
                <option value="">Todos los sectores (CIIU)</option>
                {ciiuOptions.map((ciiu) => (
                  <option key={ciiu} value={ciiu}>{ciiu}</option>
                ))}
              </Select>
              <Select 
                value={department} 
                onChange={(e) => onDepartmentChange(e.target.value)}
                className="min-w-[150px]"
                theme={{
                  field: {
                    select: {
                      base: "bg-white border-gray-200 text-sm"
                    }
                  }
                }}
              >
                <option value="">Todos los departamentos</option>
                {departamentosOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
              <Select 
                value={city} 
                onChange={(e) => onCityChange(e.target.value)}
                className="min-w-[150px]"
                disabled={!department}
                theme={{
                  field: {
                    select: {
                      base: `bg-white border-gray-200 text-sm ${!department ? "bg-gray-100 text-gray-500" : ""}`
                    }
                  }
                }}
              >
                <option value="">Todas las ciudades</option>
                {ciudadesOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
              <Select
                className="w-36 min-w-[150px]"
                theme={{
                  field: {
                    select: {
                      base: "bg-white border-gray-200 text-sm"
                    }
                  }
                }}
              >
                <option value="">Ordenar por</option>
                <option value="relevance">Relevancia</option>
                <option value="recent">Más recientes</option>
                <option value="name">Nombre</option>
              </Select>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          {recentCompanies.length > 0 && (
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