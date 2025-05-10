import CatalogoView from '@/views/Catalogo/CatalogoView';
import { sanityClient } from '@/lib/sanity.client';
import { SanityProductDocument, SanityServiceDocument, SanityCategoryDocument } from '@/types/sanity';

export default async function CatalogoPage() {
  // Obtener productos, servicios, categorías y empresas activas
  const [products, services, categories, companies] = await Promise.all([
    sanityClient.fetch<SanityProductDocument[]>(
      `*[_type == "product" && status == "active"]{..., images[], company->{_id, nameCompany} }`
    ),
    sanityClient.fetch<SanityServiceDocument[]>(
      `*[_type == "service" && status == "active"]{..., images[], company->{_id, nameCompany} }`
    ),
    sanityClient.fetch<SanityCategoryDocument[]>(
      `*[_type == "category"]{_id, name, image}`
    ),
    sanityClient.fetch<{_id: string, nameCompany: string}[]>(
      `*[_type == "company" && active == true]{_id, nameCompany}`
    ),
  ]);

  return (
    <CatalogoView
      products={products}
      services={services}
      categories={categories}
      companies={companies}
      isLoading={false}
    />
  );
} 