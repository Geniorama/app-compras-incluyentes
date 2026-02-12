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
        numDocument,
        publicProfile,
        photo
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

export async function PUT(request: Request) {
  try {
    const client = getAuthenticatedClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id') || request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Falta el ID del usuario' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      role,
      phone,
      pronoun,
      position,
      typeDocument,
      numDocument,
      publicProfile,
      photo
    } = body;

    // Obtener el usuario actual y su empresa para verificar permisos
    const currentUser = await client.fetch(
      `*[_type == "user" && firebaseUid == $uid][0]{
        company->{_id, companySize}
      }`,
      { uid: request.headers.get('x-user-id') }
    );

    if (!currentUser?.company?._id) {
      return NextResponse.json(
        { success: false, message: 'No se encontró la empresa del usuario' },
        { status: 404 }
      );
    }

    // Buscar el usuario a actualizar
    const userToUpdate = await client.fetch(
      `*[_type == "user" && _id == $userId][0]{
        _id,
        company->{_id}
      }`,
      { userId }
    );

    if (!userToUpdate) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el usuario pertenece a la misma empresa
    if (userToUpdate.company._id !== currentUser.company._id) {
      return NextResponse.json(
        { success: false, message: 'No tienes permisos para actualizar este usuario' },
        { status: 403 }
      );
    }

    const companySize = currentUser.company.companySize;
    // Si companySize no es "grande", publicProfile debe ser true obligatoriamente
    const finalPublicProfile = companySize !== "grande" ? true : (publicProfile ?? false);

    // Construir el objeto de actualización
    const updateData: Record<string, unknown> = {
      firstName,
      lastName,
      email,
      role,
      phone,
      pronoun,
      position,
      typeDocument,
      numDocument,
      publicProfile: finalPublicProfile,
      updatedAt: new Date().toISOString()
    };
    if (photo !== undefined) {
      updateData.photo = photo;
    }

    // Actualizar el usuario
    const updatedUser = await client
      .patch(userId)
      .set(updateData)
      .commit();

    return NextResponse.json({ 
      success: true,
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json(
      { success: false, message: 'Error al actualizar usuario' },
      { status: 500 }
    );
  }
} 