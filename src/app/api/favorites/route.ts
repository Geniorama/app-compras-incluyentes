import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/sanity.client';

export async function GET(request: Request) {
  try {
    const firebaseUid = request.headers.get('x-user-id');
    if (!firebaseUid) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const client = getAuthenticatedClient();
    const currentUser = await client.fetch(
      `*[_type == "user" && firebaseUid == $uid][0]{
        _id,
        "favorites": favorites[]->{
          _id,
          firstName,
          lastName,
          position,
          email,
          phone,
          photo,
          "company": company->{
            _id,
            nameCompany
          }
        }
      }`,
      { uid: firebaseUid }
    );

    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { favorites: currentUser.favorites || [] }
    });
  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    return NextResponse.json(
      { success: false, message: 'Error al obtener favoritos' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const firebaseUid = request.headers.get('x-user-id');
    if (!firebaseUid) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { action, userId } = body as { action: 'add' | 'remove'; userId: string };

    if (!action || !userId) {
      return NextResponse.json(
        { success: false, message: 'Se requiere action (add/remove) y userId' },
        { status: 400 }
      );
    }

    if (action !== 'add' && action !== 'remove') {
      return NextResponse.json(
        { success: false, message: 'Action debe ser "add" o "remove"' },
        { status: 400 }
      );
    }

    const client = getAuthenticatedClient();

    const currentUser = await client.fetch(
      `*[_type == "user" && firebaseUid == $uid][0]{
        _id,
        "favorites": favorites[]->_id
      }`,
      { uid: firebaseUid }
    );

    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Usuario no encontrado' }, { status: 404 });
    }

    const existingIds = (currentUser.favorites || []) as string[];

    let newFavorites: { _type: string; _ref: string }[];

    if (action === 'add') {
      if (existingIds.includes(userId)) {
        return NextResponse.json({
          success: true,
          data: { message: 'Usuario ya está en favoritos' }
        });
      }
      const targetUser = await client.fetch(
        `*[_type == "user" && _id == $userId][0]{ _id, publicProfile }`,
        { userId }
      );
      if (!targetUser) {
        return NextResponse.json({ success: false, message: 'Usuario no encontrado' }, { status: 404 });
      }
      if (!targetUser.publicProfile) {
        return NextResponse.json(
          { success: false, message: 'Solo puedes agregar usuarios con perfil público' },
          { status: 400 }
        );
      }
      const currentRefs = existingIds.map((id: string) => ({ _type: 'reference' as const, _ref: id }));
      newFavorites = [...currentRefs, { _type: 'reference', _ref: userId }];
    } else {
      newFavorites = existingIds
        .filter((id: string) => id !== userId)
        .map((id: string) => ({ _type: 'reference' as const, _ref: id }));
    }

    await client
      .patch(currentUser._id)
      .set({
        favorites: newFavorites,
        updatedAt: new Date().toISOString()
      })
      .commit();

    return NextResponse.json({
      success: true,
      data: { favorites: newFavorites }
    });
  } catch (error) {
    console.error('Error al actualizar favoritos:', error);
    return NextResponse.json(
      { success: false, message: 'Error al actualizar favoritos' },
      { status: 500 }
    );
  }
}
