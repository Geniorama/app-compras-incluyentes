import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/sanity.client';

export async function GET() {
  const client = getAuthenticatedClient();

  try {
    const companies = await client.fetch(`
      *[_type == "company" && active == true] | order(nameCompany asc) {
        _id,
        nameCompany,
        logo
      }
    `);

    return NextResponse.json({ companies }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener empresas:', error);
    return NextResponse.json({ message: 'Error al obtener empresas', error }, { status: 500 });
  }
} 