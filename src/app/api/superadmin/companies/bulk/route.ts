import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/sanity.client';
import { isSuperadmin } from '@/lib/superadmin';

type BulkAction = 'activate' | 'deactivate' | 'delete';

export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!(await isSuperadmin(userId))) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
    }

    const { ids, action } = (await request.json()) as { ids?: string[]; action?: BulkAction };

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ message: 'Se requieren ids' }, { status: 400 });
    }
    if (!action || !['activate', 'deactivate', 'delete'].includes(action)) {
      return NextResponse.json({ message: 'Acción inválida' }, { status: 400 });
    }

    const client = getAuthenticatedClient();
    const now = new Date().toISOString();
    const tx = client.transaction();

    if (action === 'delete') {
      ids.forEach((id) => tx.delete(id));
    } else {
      const active = action === 'activate';
      ids.forEach((id) => tx.patch(id, { set: { active, updatedAt: now } }));
    }

    await tx.commit();

    return NextResponse.json({
      success: true,
      data: { action, count: ids.length },
    });
  } catch (error) {
    console.error('Error en acción masiva:', error);
    return NextResponse.json(
      { success: false, message: 'Error al ejecutar la acción masiva' },
      { status: 500 }
    );
  }
}
