import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/sanity.client';
import { auth } from '@/lib/firebaseConfig';
import { deleteUser } from 'firebase/auth';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = getAuthenticatedClient();
    const { id } = params;
    const body = await request.json();

    // Verificar que el usuario existe
    const existingUser = await client.fetch(
      `*[_type == "user" && _id == $id][0]`,
      { id }
    );

    if (!existingUser) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar en Sanity
    const updatedUser = await client
      .patch(id)
      .set({
        firstName: body.firstName,
        lastName: body.lastName,
        role: body.role,
        phone: body.phone,
        pronoun: body.pronoun,
        position: body.position,
        typeDocument: body.typeDocument,
        numDocument: body.numDocument,
        updatedAt: new Date().toISOString(),
      })
      .commit();

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json(
      { message: 'Error al actualizar usuario' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = getAuthenticatedClient();
    const { id } = params;

    // Verificar que el usuario existe y obtener su firebaseUid
    const existingUser = await client.fetch(
      `*[_type == "user" && _id == $id][0]{
        _id,
        firebaseUid
      }`,
      { id }
    );

    if (!existingUser) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar en Sanity primero
    await client.delete(id);

    // Intentar eliminar en Firebase
    try {
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.uid === existingUser.firebaseUid) {
        await deleteUser(currentUser);
      } else {
        // Si no es el usuario actual, no podemos eliminarlo directamente
        // En este caso, el usuario tendrá que eliminarse manualmente desde la consola de Firebase
        console.warn('No se pudo eliminar el usuario de Firebase. Se eliminó solo de Sanity.');
      }
    } catch (firebaseError) {
      console.error('Error al eliminar usuario de Firebase:', firebaseError);
      // Continuamos aunque falle Firebase, ya que el usuario ya fue eliminado de Sanity
    }

    return NextResponse.json({ 
      message: 'Usuario eliminado correctamente',
      note: 'Si el usuario no se eliminó de Firebase, deberá eliminarse manualmente desde la consola.'
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json(
      { message: 'Error al eliminar usuario' },
      { status: 500 }
    );
  }
} 