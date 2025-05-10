import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/sanity.client';

export async function GET(request: Request) {
  try {
    const client = getAuthenticatedClient();
    
    // Obtener el usuario actual y su empresa
    const currentUser = await client.fetch(
      `*[_type == "user" && firebaseUid == $uid][0]{
        company->{_id}
      }`,
      { uid: request.headers.get('x-user-id') }
    );

    if (!currentUser?.company?._id) {
      return NextResponse.json(
        { success: false, message: 'No se encontró la empresa del usuario' },
        { status: 404 }
      );
    }

    // Obtener usuarios de la misma empresa
    const users = await client.fetch(
      `*[_type == "user" && company._ref == $companyId]{
        _id,
        firstName,
        lastName,
        email,
        role,
        phone,
        pronoun,
        position,
        typeDocument,
        numDocument
      }`,
      { companyId: currentUser.company._id }
    );

    return NextResponse.json({ 
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json(
      { success: false, message: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
} 