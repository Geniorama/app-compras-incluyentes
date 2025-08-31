import CatalogoView from '@/views/Catalogo/CatalogoView';
import { sanityClient, getFreshClient } from '@/lib/sanity.client';
import { sanityQueries } from '@/lib/sanity.queries';
import { SanityProductDocument, SanityServiceDocument, SanityCategoryDocument } from '@/types/sanity';
import { headers } from 'next/headers';

export default async function CatalogoPage() {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const isBot = /bot|crawler|spider|crawling/i.test(userAgent);
  
  // Para bots y casos que requieren datos frescos, usar cliente sin CDN
  const client = isBot ? getFreshClient() : sanityClient;
  
  // Obtener productos, servicios, categorías y empresas activas usando consultas optimizadas
  const [products, services, categories, companies] = await Promise.all([
    client.fetch<SanityProductDocument[]>(sanityQueries.activeProducts),
    client.fetch<SanityServiceDocument[]>(sanityQueries.activeServices),
    client.fetch<SanityCategoryDocument[]>(sanityQueries.categories),
    client.fetch<{_id: string, nameCompany: string}[]>(sanityQueries.activeCompanies),
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