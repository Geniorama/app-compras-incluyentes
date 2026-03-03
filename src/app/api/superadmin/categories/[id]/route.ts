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
    const { name, description, types, image } = body;

    const client = getAuthenticatedClient();
    const patch: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (name !== undefined) patch.name = name;
    if (description !== undefined) patch.description = description;
    if (types !== undefined) patch.types = types;
    if (name !== undefined) {
      patch.slug = { _type: 'slug', current: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') };
    }
    if (image !== undefined) {
      if (image?.asset?._ref) {
        patch.image = { _type: 'image', asset: { _type: 'reference', _ref: image.asset._ref } };
      } else {
        patch.image = null;
      }
    }

    await client.patch(id).set(patch).commit();
    const updated = await client.fetch(`*[_id == $id][0]`, { id });

    return NextResponse.json({ success: true, data: { category: updated } });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, message: 'Error al actualizar categoría' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = _request.headers.get('x-user-id');
    if (!(await isSuperadmin(userId))) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
    }

    const { id } = await params;
    const client = getAuthenticatedClient();
    await client.delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, message: 'Error al eliminar categoría' },
      { status: 500 }
    );
  }
}
