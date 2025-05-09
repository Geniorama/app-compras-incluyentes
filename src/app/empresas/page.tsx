'use client';

import { useEffect, useState } from 'react';
import EmpresasView from '@/views/Empresas/EmpresasView';
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
  sector: string;
  typeDocumentCompany: string;
  numDocumentCompany: string;
  ciiu: string;
  active: boolean;
  phone: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  pinterest?: string;
  linkedin?: string;
  xtwitter?: string;
}

export default function EmpresasPage() {
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
  }, [currentPage, sector, location]);

  useEffect(() => {
    if (searchTerm === '') {
      setCurrentPage(1);
      fetchCompanies();
    }
    // eslint-disable-next-line
  }, [searchTerm]);

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      // Construir la consulta base
      let query = `*[_type == "company" && active == true`;
      
      // Agregar filtros si existen
      const filters = [];
      if (searchTerm) filters.push(`(nameCompany match "${searchTerm}*" || businessName match "${searchTerm}*")`);
      if (sector) filters.push(`ciiu == "${sector}"`);
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
        sector,
        typeDocumentCompany,
        numDocumentCompany,
        ciiu,
        phone,
        facebook,
        instagram,
        tiktok,
        pinterest,
        linkedin,
        xtwitter
      }`;

      // Consulta para el total de resultados
      const totalQuery = `count(*[_type == "company" && active == true${filters.length > 0 ? ` && ${filters.join(" && ")}` : ''}])`;
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
    if (filter === searchTerm) setSearchTerm('');
    if (filter === location) setLocation('');
    setCurrentPage(1);
  };

  return (
    <EmpresasView
      companies={companies}
      isLoading={isLoading}
      totalResults={totalResults}
      currentPage={currentPage}
      searchTerm={searchTerm}
      sector={sector}
      selectedFilters={selectedFilters}
      onSearchTermChange={setSearchTerm}
      onSectorChange={setSector}
      onPageChange={setCurrentPage}
      onSearch={handleSearch}
      onRemoveFilter={handleRemoveFilter}
    />
  );
} 