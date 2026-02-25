import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/sanity.client';

/**
 * Obtiene usuarios con perfil visible (pueden recibir mensajes persona a persona).
 * Regla: publicProfile == true O (role == "member" Y company->companySize != "grande")
 */
export async function GET() {
  try {
    const client = getAuthenticatedClient();

    const users = await client.fetch(
      `*[_type == "user" && (
        publicProfile == true ||
        (role == "member" && company->companySize != "grande")
      )] | order(firstName asc) {
        _id,
        firstName,
        lastName,
        email,
        position,
        photo,
        role,
        "company": company->{
          _id,
          nameCompany
        }
      }`
    );

    return NextResponse.json({ users: users || [] });
  } catch (error) {
    console.error('Error al obtener usuarios visibles:', error);
    return NextResponse.json({ message: 'Error al obtener usuarios', users: [] }, { status: 500 });
  }
}
