import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/sanity.client';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = getAuthenticatedClient();
  const userId = req.headers.get('x-user-id');
  const { id } = await params;

  if (!userId) {
    return NextResponse.json({ message: 'Debes iniciar sesión para postularte' }, { status: 401 });
  }

  try {
    const opportunity = await client.fetch(
      `*[_type == "opportunity" && _id == $id][0]{
        _id,
        status,
        "publisherCompanyId": company._ref,
        "applicationRefs": applications[]._ref
      }`,
      { id }
    );

    if (!opportunity) {
      return NextResponse.json({ message: 'Oportunidad no encontrada' }, { status: 404 });
    }
    if (opportunity.status !== 'open') {
      return NextResponse.json({ message: 'Esta oportunidad no está abierta para postulaciones' }, { status: 400 });
    }

    const userDoc = await client.fetch(
      `*[_type == "user" && firebaseUid == $userId][0]{ company->{ _id } }`,
      { userId }
    );
    if (!userDoc?.company?._id) {
      return NextResponse.json({ message: 'Tu usuario no tiene una empresa asociada' }, { status: 400 });
    }

    const companyRef = userDoc.company._id;
    if (opportunity.publisherCompanyId === companyRef) {
      return NextResponse.json({ message: 'No puedes postularte a tu propia oportunidad' }, { status: 400 });
    }

    const refs = (opportunity.applicationRefs || []).filter(Boolean);
    if (refs.includes(companyRef)) {
      return NextResponse.json({ message: 'Tu empresa ya está postulada a esta oportunidad' }, { status: 400 });
    }

    const newApplications = [...refs.map((r: string) => ({ _type: 'reference', _ref: r })), { _type: 'reference', _ref: companyRef }];
    await client
      .patch(id)
      .set({ applications: newApplications, updatedAt: new Date().toISOString() })
      .commit();

    return NextResponse.json({ message: 'Postulación registrada correctamente' }, { status: 200 });
  } catch (error) {
    console.error('Error al postular:', error);
    return NextResponse.json({ message: 'Error al registrar la postulación' }, { status: 500 });
  }
}
