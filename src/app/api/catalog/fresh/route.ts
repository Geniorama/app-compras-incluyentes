import { NextResponse } from 'next/server';
import { getFreshClient } from '@/lib/sanity.client';
import { sanityQueries } from '@/lib/sanity.queries';

export async function GET() {
  try {
    const client = getFreshClient();
    
    // Obtener datos frescos sin CDN
    const [products, services, categories, companies] = await Promise.all([
      client.fetch(sanityQueries.activeProducts),
      client.fetch(sanityQueries.activeServices),
      client.fetch(sanityQueries.categories),
      client.fetch(sanityQueries.activeCompanies),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        products,
        services,
        categories,
        companies
      }
    });
  } catch (error) {
    console.error('Error fetching fresh catalog data:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener datos frescos del catálogo' },
      { status: 500 }
    );
  }
}
