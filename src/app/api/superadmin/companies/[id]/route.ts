import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/sanity.client';
import { isSuperadmin } from '@/lib/superadmin';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!(await isSuperadmin(userId))) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { active } = body;

    if (typeof active !== 'boolean') {
      return NextResponse.json(
        { message: 'Se requiere el campo active (boolean)' },
        { status: 400 }
      );
    }

    const client = getAuthenticatedClient();
    await client
      .patch(id)
      .set({ active, updatedAt: new Date().toISOString() })
      .commit();

    return NextResponse.json({ success: true, data: { active } });
  } catch (error) {
    console.error('Error updating company:', error);
    return NextResponse.json(
      { success: false, message: 'Error al actualizar empresa' },
      { status: 500 }
    );
  }
}
