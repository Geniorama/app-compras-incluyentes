'use client';

import { useEffect, useState, useCallback } from 'react';
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
  department?: string;
  city?: string;
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
  const [department, setDepartment] = useState('');
  const [city, setCity] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  const fetchCompanies = useCallback(async () => {
    try {
      setIsLoading(true);
      // Construir la consulta base
      let query = `*[_type == "company" && active == true`;
      
      // Agregar filtros si existen
      const filters = [];
      if (searchTerm) filters.push(`(nameCompany match "${searchTerm}*" || businessName match "${searchTerm}*")`);
      if (sector) filters.push(`ciiu == "${sector}"`);
      if (department) filters.push(`department == "${department}"`);
      if (city) filters.push(`city == "${city}"`);
      
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
        department,
        city,
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
  }, [currentPage, sector, department, city, searchTerm]);

  useEffect(() => {
    fetchCompanies();
  }, [currentPage, sector, department, city, searchTerm]);

  useEffect(() => {
    if (searchTerm === '') {
      setCurrentPage(1);
      fetchCompanies();
    }
  }, [searchTerm, fetchCompanies]);

  // Limpiar ciudad cuando cambie el departamento
  useEffect(() => {
    if (department === '') {
      setCity('');
    }
  }, [department]);

  const handleSearch = () => {
    const newFilters = [];
    if (searchTerm) {
      newFilters.push(searchTerm);
    }
    if (sector) {
      newFilters.push(sector);
    }
    if (department) {
      newFilters.push(department);
    }
    if (city) {
      newFilters.push(city);
    }
    setSelectedFilters(newFilters);
    setCurrentPage(1);
    fetchCompanies();
  };

  const handleRemoveFilter = (filter: string) => {
    setSelectedFilters(selectedFilters.filter(f => f !== filter));
    if (filter === sector) setSector('');
    if (filter === searchTerm) setSearchTerm('');
    if (filter === department) setDepartment('');
    if (filter === city) setCity('');
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
      department={department}
      city={city}
      selectedFilters={selectedFilters}
      onSearchTermChange={setSearchTerm}
      onSectorChange={setSector}
      onDepartmentChange={setDepartment}
      onCityChange={setCity}
      onPageChange={setCurrentPage}
      onSearch={handleSearch}
      onRemoveFilter={handleRemoveFilter}
    />
  );
} 