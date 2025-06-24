import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/sanity.client';

export async function GET(req: NextRequest) {
  const client = getAuthenticatedClient();
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('companyId');

  if (!companyId) {
    return NextResponse.json({ message: 'Falta el ID de la empresa' }, { status: 400 });
  }

  try {
    const count = await client.fetch(`
      count(*[_type == "message" && company._ref == $companyId && read == false && !deleted])
    `, { companyId });

    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener conteo de mensajes:', error);
    return NextResponse.json({ message: 'Error al obtener conteo de mensajes', error }, { status: 500 });
  }
} 