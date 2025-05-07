import { NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/sanity.client'

export async function POST(request: Request) {
  const { email } = await request.json();
  const client = getAuthenticatedClient();

  // Buscar usuario publicado y traer el campo active de la empresa
  const user = await client.fetch(
    `*[_type == "user" && email == $email && !(_id in path("drafts.**"))][0]{
      _id,
      company->{
        _id,
        _type,
        active
      }
    }`,
    { email }
  );

  if (!user) {
    return NextResponse.json({ exists: false, published: false, companyActive: false });
  }

  // Verificar si la empresa está activa (publicada y active: true)
  const isCompanyActive = !!user.company && !user.company._id?.startsWith('drafts.') && user.company.active === true;

  return NextResponse.json({ 
    exists: true, 
    published: true,
    companyActive: isCompanyActive 
  });
} 