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
  const [sector, setSector] = useState<string[]>([]);
  const [department, setDepartment] = useState('');
  const [city, setCity] = useState('');
  const [peopleGroup, setPeopleGroup] = useState<string[]>([]);
  const [companySize, setCompanySize] = useState<string[]>([]);
  const [inclusionDEI, setInclusionDEI] = useState<string>('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [sortField, setSortField] = useState<'nameCompany' | '_createdAt'>('_createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
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
      if (sector.length > 0) {
        const sectorFilter = sector.map(s => `"${s}"`).join(', ');
        filters.push(`ciiu in [${sectorFilter}]`);
      }
      if (department) filters.push(`department == "${department}"`);
      if (city) filters.push(`city == "${city}"`);
      if (peopleGroup.length > 0) {
        const pgFilter = peopleGroup.map(pg => `"${pg}"`).join(', ');
        filters.push(`peopleGroup in [${pgFilter}]`);
      }
      if (companySize.length > 0) {
        const sizeFilter = companySize.map(size => `"${size}"`).join(', ');
        filters.push(`companySize in [${sizeFilter}]`);
      }
      if (inclusionDEI === 'yes') {
        filters.push(`inclusionDEI == true`);
      } else if (inclusionDEI === 'no') {
        filters.push(`(inclusionDEI == false || !defined(inclusionDEI))`);
      }
      
      if (filters.length > 0) {
        query += ` && ${filters.join(" && ")}`;
      }
      query += `] | order(${sortField} ${sortDirection}) {
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
  }, [currentPage, sector, department, city, searchTerm, peopleGroup, companySize, inclusionDEI, sortField, sortDirection]);

  useEffect(() => {
    fetchCompanies();
  }, [currentPage, sector, department, city, searchTerm, peopleGroup, companySize, inclusionDEI, sortField, sortDirection]);

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
    const newFilters: string[] = [];
    if (searchTerm) {
      newFilters.push(searchTerm);
    }
    sector.forEach(s => newFilters.push(s));
    if (department) newFilters.push(department);
    if (city) newFilters.push(city);
    
    const companySizeLabels: { [key: string]: string } = {
      'micro': 'Micro',
      'pequena': 'Pequeña',
      'mediana': 'Mediana',
      'grande': 'Grande',
      'indefinido': 'Indefinido'
    };
    companySize.forEach(size => {
      newFilters.push(companySizeLabels[size] || size);
    });
    
    if (inclusionDEI === 'yes') {
      newFilters.push('Empresa Aliada DEI');
    } else if (inclusionDEI === 'no') {
      newFilters.push('Sin política DEI');
    }
    
    const peopleGroupLabels: { [key: string]: string } = {
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
    peopleGroup.forEach(pg => {
      newFilters.push(peopleGroupLabels[pg] || pg);
    });
    
    setSelectedFilters(newFilters);
    setCurrentPage(1);
    fetchCompanies();
  };

  const handleRemoveFilter = (filter: string) => {
    setSelectedFilters(selectedFilters.filter(f => f !== filter));
    const peopleGroupLabels: { [key: string]: string } = {
      'LGBTIQ+': 'lgbtiq',
      'Personas con discapacidad Sensorial': 'discapacidad-sensorial',
      'Personas con discapacidad Físico Motora': 'discapacidad-fisico-motora',
      'Personas con discapacidad Psicosocial': 'discapacidad-psicosocial',
      'Personas con discapacidad Cognitiva': 'discapacidad-cognitiva',
      'Migrantes': 'migrantes',
      'Etnia y Raza: Afrodescendientes, raizales y palenqueros': 'etnia-afrodescendientes',
      'Etnia y Raza: Indígenas': 'etnia-indigenas',
      'Víctimas de reconciliación y paz (víctimas, victimarios)': 'victimas-reconciliacion-paz',
      'Pospenadas': 'pospenadas',
      'Diversidad Generacional mayores de 50 años': 'diversidad-generacional-mayores-50',
      'Diversidad Generacional primer empleo': 'diversidad-generacional-primer-empleo',
      'Madres cabeza de familia': 'madres-cabeza-familia',
      'Diversidad Sexual': 'diversidad-sexual',
      'Personas con discapacidad': 'personas-discapacidad',
      'Etnia, raza o afro': 'etnia-raza-afro',
      'Personas migrantes': 'personas-migrantes',
      'Generacional': 'generacional',
      'Equidad de Género': 'equidad-genero',
      'Pospenados o reinsertados': 'pospenados-reinsertados',
      'Ninguno': 'ninguno',
      'Otro': 'otro'
    };
    
    // Remover de arrays
    if (sector.includes(filter)) setSector(sector.filter(s => s !== filter));
    if (filter === department) setDepartment('');
    if (filter === city) setCity('');
    
    const companySizeLabels: { [key: string]: string } = {
      'Micro': 'micro',
      'Pequeña': 'pequena',
      'Mediana': 'mediana',
      'Grande': 'grande',
      'Indefinido': 'indefinido'
    };
    const sizeValue = companySizeLabels[filter];
    if (sizeValue && companySize.includes(sizeValue)) {
      setCompanySize(companySize.filter(size => size !== sizeValue));
    }
    
    if (filter === 'Empresa Aliada DEI') setInclusionDEI('');
    if (filter === 'Sin política DEI') setInclusionDEI('');
    
    const pgValue = peopleGroupLabels[filter];
    if (pgValue && peopleGroup.includes(pgValue)) {
      setPeopleGroup(peopleGroup.filter(pg => pg !== pgValue));
    }
    if (filter === searchTerm) setSearchTerm('');
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
      peopleGroup={peopleGroup}
      selectedFilters={selectedFilters}
      onSearchTermChange={setSearchTerm}
      onSectorChange={(values: string[]) => setSector(values)}
      onDepartmentChange={(value: string) => {
        setDepartment(value);
        if (!value) setCity('');
      }}
      onCityChange={(value: string) => setCity(value)}
      onPeopleGroupChange={(values: string[]) => setPeopleGroup(values)}
      companySize={companySize}
      onCompanySizeChange={(values: string[]) => setCompanySize(values)}
      inclusionDEI={inclusionDEI}
      onInclusionDEIChange={(value: string) => setInclusionDEI(value)}
      sortField={sortField}
      sortDirection={sortDirection}
      onSortChange={(field: 'nameCompany' | '_createdAt', direction: 'asc' | 'desc') => {
        setSortField(field);
        setSortDirection(direction);
      }}
      onPageChange={setCurrentPage}
      onSearch={handleSearch}
      onRemoveFilter={handleRemoveFilter}
    />
  );
} 