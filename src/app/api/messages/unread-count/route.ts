import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/sanity.client';

export async function GET(req: NextRequest) {
  const client = getAuthenticatedClient();
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('companyId');
  const userId = searchParams.get('userId');

  if (!companyId && !userId) {
    return NextResponse.json({ message: 'Falta companyId o userId' }, { status: 400 });
  }

  try {
    let count = 0;

    if (companyId) {
      const companyCount = await client.fetch(
        `count(*[_type == "message" && recipientCompany._ref == $companyId && read == false && !deleted])`,
        { companyId }
      );
      count += companyCount;
    }

    if (userId) {
      const userDoc = await client.fetch(
        '*[_type == "user" && firebaseUid == $userId][0]{ _id }',
        { userId }
      );
      if (userDoc?._id) {
        const userCount = await client.fetch(
          `count(*[_type == "message" && recipientUser._ref == $userSanityId && read == false && !deleted])`,
          { userSanityId: userDoc._id }
        );
        count += userCount;
      }
    }

    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener conteo de mensajes:', error);
    return NextResponse.json({ message: 'Error al obtener conteo de mensajes', error }, { status: 500 });
  }
} 