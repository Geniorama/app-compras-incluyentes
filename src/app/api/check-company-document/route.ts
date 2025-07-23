import { NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/sanity.client'

export async function POST(request: Request) {
  const { typeDocumentCompany, numDocumentCompany } = await request.json();
  const client = getAuthenticatedClient();

  // Buscar empresa con el mismo tipo y número de documento
  const company = await client.fetch(
    `*[_type == "company" && typeDocumentCompany == $typeDocumentCompany && numDocumentCompany == $numDocumentCompany && !(_id in path("drafts.**"))][0]{
      _id,
      nameCompany,
      businessName,
      active
    }`,
    { typeDocumentCompany, numDocumentCompany }
  );

  if (!company) {
    return NextResponse.json({ exists: false });
  }

  return NextResponse.json({ 
    exists: true,
    companyName: company.nameCompany,
    businessName: company.businessName,
    active: company.active
  });
} 