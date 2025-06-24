import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/sanity.client';

export async function GET(req: NextRequest) {
  const client = getAuthenticatedClient();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ message: 'Falta el ID del usuario' }, { status: 400 });
  }

  try {
    const userCompany = await client.fetch(`
      *[_type == "user" && _id == $userId][0]{
        company->{
          _id,
          nameCompany
        }
      }
    `, { userId });

    if (!userCompany?.company?._id) {
      return NextResponse.json({ message: 'No se encontró la empresa del usuario' }, { status: 404 });
    }

    return NextResponse.json({ 
      companyId: userCompany.company._id,
      companyName: userCompany.company.nameCompany 
    }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener empresa del usuario:', error);
    return NextResponse.json({ message: 'Error al obtener empresa del usuario', error }, { status: 500 });
  }
} 