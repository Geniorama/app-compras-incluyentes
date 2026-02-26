import { NextRequest, NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity.client';
import { getAuthenticatedClient } from '@/lib/sanity.client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const opportunity = await sanityClient.fetch(
      `*[_type == "opportunity" && _id == $id][0]{
        _id,
        title,
        cover,
        startDate,
        maxApplicationDate,
        description,
        requirements,
        contractValue,
        status,
        company->{ _id, nameCompany, logo },
        applications[]->{ _id, nameCompany, logo }
      }`,
      { id }
    );
    if (!opportunity) {
      return NextResponse.json({ message: 'Oportunidad no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ opportunity }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener oportunidad:', error);
    return NextResponse.json({ message: 'Error al obtener oportunidad' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = getAuthenticatedClient();
  const userId = req.headers.get('x-user-id');
  const { id } = await params;

  if (!userId) {
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
  }

  try {
    const existing = await client.fetch(
      `*[_type == "opportunity" && _id == $id][0]{ company->{ _id }, status }`,
      { id }
    );
    if (!existing) {
      return NextResponse.json({ message: 'Oportunidad no encontrada' }, { status: 404 });
    }

    const userDoc = await client.fetch(
      `*[_type == "user" && firebaseUid == $userId][0]{ company->{ _id } }`,
      { userId }
    );
    if (!userDoc?.company || userDoc.company._id !== existing.company._id) {
      return NextResponse.json({ message: 'No puedes editar esta oportunidad' }, { status: 403 });
    }

    const body = await req.json();
    const { title, cover, startDate, maxApplicationDate, description, requirements, contractValue, status } = body;

    const patch: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (title !== undefined) patch.title = title;
    if (cover !== undefined) patch.cover = cover;
    if (startDate !== undefined) patch.startDate = startDate;
    if (maxApplicationDate !== undefined) patch.maxApplicationDate = maxApplicationDate;
    if (description !== undefined) patch.description = description;
    if (requirements !== undefined) patch.requirements = requirements;
    if (contractValue !== undefined) patch.contractValue = contractValue !== '' && contractValue !== null ? Number(contractValue) : undefined;
    if (status !== undefined) patch.status = status;

    await client.patch(id).set(patch).commit();

    const updated = await client.fetch(
      `*[_type == "opportunity" && _id == $id][0]{
        _id, title, cover, startDate, maxApplicationDate, description, requirements, contractValue, status,
        company->{ _id, nameCompany, logo },
        applications[]->{ _id, nameCompany }
      }`,
      { id }
    );

    return NextResponse.json({ message: 'Oportunidad actualizada', opportunity: updated }, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar oportunidad:', error);
    return NextResponse.json({ message: 'Error al actualizar oportunidad' }, { status: 500 });
  }
}
