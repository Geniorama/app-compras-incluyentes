import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/sanity.client';
import { isSuperadmin } from '@/lib/superadmin';
import { adminAuth } from '@/lib/firebase-admin';

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
    const {
      firstName,
      lastName,
      email,
      role,
      companyId,
      phone,
      pronoun,
      position,
      typeDocument,
      numDocument,
      publicProfile,
      photo,
      notifyEmailMessages,
    } = body;

    const client = getAuthenticatedClient();
    const existing = await client.fetch(
      `*[_type == "user" && _id == $id][0]{
        _id,
        firebaseUid,
        company->{ _id, companySize }
      }`,
      { id }
    );

    if (!existing) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }

    const companySize = companyId
      ? await client.fetch(
          `*[_type == "company" && _id == $cid][0]{ companySize }`,
          { cid: companyId }
        ).then((c: { companySize?: string } | null) => c?.companySize)
      : existing.company?.companySize || 'grande';
    const finalPublicProfile = companySize !== 'grande' ? true : (publicProfile ?? false);

    const patch: Record<string, unknown> = {
      firstName: firstName ?? '',
      lastName: lastName ?? '',
      email: email ?? '',
      role: role ?? 'user',
      phone: phone ?? '',
      pronoun: pronoun ?? '',
      position: position ?? '',
      typeDocument: typeDocument ?? '',
      numDocument: numDocument ?? '',
      publicProfile: finalPublicProfile,
      notifyEmailMessages: Boolean(notifyEmailMessages),
      updatedAt: new Date().toISOString(),
    };
    if (companyId !== undefined && companyId) {
      patch.company = { _type: 'reference', _ref: companyId };
    }
    if (photo !== undefined) patch.photo = photo;

    const patchOp = client.patch(id);
    patchOp.set(patch);
    if (companyId !== undefined && !companyId) {
      patchOp.unset(['company']);
    }
    await patchOp.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating superadmin user:', error);
    return NextResponse.json(
      { success: false, message: 'Error al actualizar usuario' },
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
    const existing = await client.fetch(
      `*[_type == "user" && _id == $id][0]{ _id, firebaseUid }`,
      { id }
    );

    if (!existing) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }

    await client.delete(id);

    if (existing.firebaseUid) {
      try {
        await adminAuth.deleteUser(existing.firebaseUid);
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code;
        if (code !== 'auth/user-not-found') {
          console.error('Error deleting Firebase user:', err);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting superadmin user:', error);
    return NextResponse.json(
      { success: false, message: 'Error al eliminar usuario' },
      { status: 500 }
    );
  }
}
