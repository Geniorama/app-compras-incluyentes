import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/sanity.client';

export async function GET(req: NextRequest) {
  const client = getAuthenticatedClient();
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('companyId');
  const senderId = searchParams.get('senderId');

  try {
    let query = '';
    let params = {};
    if (companyId) {
      query = `*[_type == "message" && company._ref == $companyId && !deleted] | order(createdAt desc) {
        _id,
        subject,
        content,
        createdAt,
        read,
        sender->{ _id, firstName, lastName, photo },
        company->{ _id, nameCompany, logo }
      }`;
      params = { companyId };
    } else if (senderId) {
      // Buscar el _id real del usuario en Sanity usando el UID de Firebase
      const userDoc = await client.fetch(
        '*[_type == "user" && firebaseUid == $senderId][0]{ _id }',
        { senderId }
      );
      if (!userDoc?._id) {
        return NextResponse.json({ message: 'El usuario no existe en Sanity' }, { status: 404 });
      }
      const senderSanityId = userDoc._id;
      query = `*[_type == "message" && sender._ref == $senderSanityId && !deleted] | order(createdAt desc) {
        _id,
        subject,
        content,
        createdAt,
        read,
        sender->{ _id, firstName, lastName, photo },
        company->{ _id, nameCompany, logo }
      }`;
      params = { senderSanityId };
    } else {
      return NextResponse.json({ message: 'Falta companyId o senderId' }, { status: 400 });
    }

    const messages = await client.fetch(query, params);
    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener mensajes', error }, { status: 500 });
  }
} 