// Consultas optimizadas para Sanity
export const sanityQueries = {
  // Consulta optimizada para productos activos
  activeProducts: `*[_type == "product" && status == "active"] | order(_createdAt desc) {
    _id,
    name,
    description,
    price,
    status,
    sku,
    _createdAt,
    _updatedAt,
    images[]{
      _type,
      asset->{
        _id,
        url
      }
    },
    category[]->{
      _id,
      name
    },
    company->{
      _id,
      nameCompany
    }
  }`,

  // Consulta optimizada para servicios activos
  activeServices: `*[_type == "service" && status == "active"] | order(_createdAt desc) {
    _id,
    name,
    description,
    price,
    status,
    duration,
    modality,
    availability,
    _createdAt,
    _updatedAt,
    images[]{
      _type,
      asset->{
        _id,
        url
      }
    },
    category[]->{
      _id,
      name
    },
    company->{
      _id,
      nameCompany
    }
  }`,

  // Consulta optimizada para categorías
  categories: `*[_type == "category"] | order(name asc) {
    _id,
    name,
    slug,
    types,
    image{
      asset->{
        _id,
        url
      }
    }
  }`,

  // Consulta optimizada para empresas activas
  activeCompanies: `*[_type == "company" && active == true] | order(nameCompany asc) {
    _id,
    nameCompany,
    active
  }`,

  // Consulta para productos por empresa
  productsByCompany: (companyId: string) => `*[_type == "product" && company._ref == "${companyId}" && status == "active"] | order(_createdAt desc) {
    _id,
    name,
    description,
    price,
    status,
    sku,
    _createdAt,
    _updatedAt,
    images[]{
      _type,
      asset->{
        _id,
        url
      }
    },
    category[]->{
      _id,
      name
    }
  }`,

  // Consulta para servicios por empresa
  servicesByCompany: (companyId: string) => `*[_type == "service" && company._ref == "${companyId}" && status == "active"] | order(_createdAt desc) {
    _id,
    name,
    description,
    price,
    status,
    duration,
    modality,
    availability,
    _createdAt,
    _updatedAt,
    images[]{
      _type,
      asset->{
        _id,
        url
      }
    },
    category[]->{
      _id,
      name
    }
  }`,

  // Consulta para productos por categoría
  productsByCategory: (categoryId: string) => `*[_type == "product" && status == "active" && "${categoryId}" in category[]._ref] | order(_createdAt desc) {
    _id,
    name,
    description,
    price,
    status,
    sku,
    _createdAt,
    _updatedAt,
    images[]{
      _type,
      asset->{
        _id,
        url
      }
    },
    category[]->{
      _id,
      name
    },
    company->{
      _id,
      nameCompany
    }
  }`,

  // Consulta para servicios por categoría
  servicesByCategory: (categoryId: string) => `*[_type == "service" && status == "active" && "${categoryId}" in category[]._ref] | order(_createdAt desc) {
    _id,
    name,
    description,
    price,
    status,
    duration,
    modality,
    availability,
    _createdAt,
    _updatedAt,
    images[]{
      _type,
      asset->{
        _id,
        url
      }
    },
    category[]->{
      _id,
      name
    },
    company->{
      _id,
      nameCompany
    }
  }`,

  // Consulta para búsqueda de productos
  searchProducts: (searchTerm: string) => `*[_type == "product" && status == "active" && (name match "${searchTerm}*" || description match "${searchTerm}*")] | order(_createdAt desc) {
    _id,
    name,
    description,
    price,
    status,
    sku,
    _createdAt,
    _updatedAt,
    images[]{
      _type,
      asset->{
        _id,
        url
      }
    },
    category[]->{
      _id,
      name
    },
    company->{
      _id,
      nameCompany
    }
  }`,

  // Consulta para búsqueda de servicios
  searchServices: (searchTerm: string) => `*[_type == "service" && status == "active" && (name match "${searchTerm}*" || description match "${searchTerm}*")] | order(_createdAt desc) {
    _id,
    name,
    description,
    price,
    status,
    duration,
    modality,
    availability,
    _createdAt,
    _updatedAt,
    images[]{
      _type,
      asset->{
        _id,
        url
      }
    },
    category[]->{
      _id,
      name
    },
    company->{
      _id,
      nameCompany
    }
  }`
};
