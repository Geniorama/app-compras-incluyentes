'use client';

import { useState, useEffect } from 'react';
import { Button, TextInput, Select } from 'flowbite-react';
import { HiSearch, HiX } from 'react-icons/hi';
import CompanyCard from '@/components/CompanyCard';
import DashboardNavbar from '@/components/dashboard/Navbar';
import { sanityClient } from '@/lib/sanity.client';

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
}

export default function EmpresasView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sector, setSector] = useState('');
  const [location, setLocation] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    fetchCompanies();
    // eslint-disable-next-line
  }, [currentPage, sector, location]);

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      // Construir la consulta base
      let query = `*[_type == "user"`;
      
      // Agregar filtros si existen
      const filters = [];
      if (searchTerm) filters.push(`(nameCompany match "${searchTerm}*" || businessName match "${searchTerm}*")`);
      if (sector) filters.push(`sector == "${sector}"`);
      if (location) filters.push(`addressCompany match "${location}*"`);
      
      if (filters.length > 0) {
        query += ` && ${filters.join(" && ")}`;
      }
      query += `] | order(_createdAt desc) {
        _id,
        nameCompany,
        businessName,
        logo,
        addressCompany,
        webSite,
        sector
      }`;

      // Consulta para el total de resultados
      const totalQuery = `count(*[_type == "user"${filters.length > 0 ? ` && ${filters.join(" && ")}` : ''}])`;
      const total = await sanityClient.fetch(totalQuery);
      setTotalResults(total);

      // Agregar paginación
      const start = (currentPage - 1) * 9;
      query += `[${start}...${start + 9}]`;

      const results = await sanityClient.fetch(query);
      setCompanies(results);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    const newFilters = [];
    if (searchTerm) {
      newFilters.push(searchTerm);
    }
    if (sector) {
      newFilters.push(sector);
    }
    if (location) {
      newFilters.push(location);
    }
    setSelectedFilters(newFilters);
    setCurrentPage(1);
    fetchCompanies();
  };

  const handleRemoveFilter = (filter: string) => {
    setSelectedFilters(selectedFilters.filter(f => f !== filter));
    if (filter === sector) setSector('');
    if (filter === location) setLocation('');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      <main className="pt-16">
        <div className="relative h-[300px] bg-gradient-to-r from-blue-600 to-blue-800">
          <div className="absolute inset-0 bg-[url('/images/hero-pattern.png')] opacity-10" />
          <div className="relative z-10 container mx-auto px-4 h-full flex flex-col items-center justify-center text-white text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              Conecta con las organizaciones y<br />
              PYMES más diversas de <span className="text-blue-200">América Latina</span>
            </h1>
            <div className="w-full max-w-2xl flex flex-col md:flex-row gap-2">
              <TextInput
                type="text"
                placeholder="Buscar Empresa"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow"
                icon={HiSearch}
                theme={{
                  field: {
                    input: {
                      base: "bg-white border-0 focus:ring-2 focus:ring-blue-500"
                    }
                  }
                }}
              />
              <Select 
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="md:w-48"
                theme={{
                  field: {
                    select: {
                      base: "bg-white border-0 focus:ring-2 focus:ring-blue-500"
                    }
                  }
                }}
              >
                <option value="">Todos los sectores</option>
                <option value="salud">Salud</option>
                <option value="tecnologia">Tecnología</option>
                <option value="comercio">Comercio</option>
                <option value="servicios">Servicios</option>
              </Select>
              <Button 
                color="light"
                onClick={handleSearch}
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
            <div className="flex flex-wrap gap-2">
              <Select 
                value={sector} 
                onChange={(e) => setSector(e.target.value)}
                className="w-36"
                theme={{
                  field: {
                    select: {
                      base: "bg-white border-gray-200 text-sm"
                    }
                  }
                }}
              >
                <option value="">Todos los sectores</option>
                <option value="salud">Salud</option>
                <option value="tecnologia">Tecnología</option>
                <option value="comercio">Comercio</option>
              </Select>
              <Select 
                value={location} 
                onChange={(e) => setLocation(e.target.value)}
                className="w-36"
                theme={{
                  field: {
                    select: {
                      base: "bg-white border-gray-200 text-sm"
                    }
                  }
                }}
              >
                <option value="">Ubicación</option>
                <option value="medellin">Medellín</option>
                <option value="bogota">Bogotá</option>
                <option value="cali">Cali</option>
              </Select>
              <Select
                className="w-36"
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
                    onClick={() => handleRemoveFilter(filter)}
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
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || isLoading}
              >
                Atrás
              </Button>
              <Button 
                color="gray"
                size="sm"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage * 9 >= totalResults || isLoading}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 