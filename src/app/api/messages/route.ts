import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/sanity.client';

const MESSAGE_FIELDS = `
  _id,
  subject,
  content,
  createdAt,
  read,
  sender->{ 
    _id, 
    firstName, 
    lastName, 
    photo
  },
  senderCompany->{ 
    _id, 
    nameCompany, 
    logo 
  },
  recipientCompany->{ 
    _id, 
    nameCompany, 
    logo 
  },
  recipientUser->{
    _id,
    firstName,
    lastName,
    photo
  }
`;

export async function GET(req: NextRequest) {
  const client = getAuthenticatedClient();
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('companyId');
  const senderId = searchParams.get('senderId');
  const recipientUserId = searchParams.get('recipientUserId');
  const limit = searchParams.get('limit');

  try {
    let query = '';
    let params: Record<string, string> = {};
    
    if (companyId) {
      // Obtener mensajes recibidos por la empresa (como destinataria)
      query = `*[_type == "message" && recipientCompany._ref == $companyId && !deleted] | order(createdAt desc) {${MESSAGE_FIELDS}}`;
      params = { companyId };
    } else if (recipientUserId) {
      const userDoc = await client.fetch(
        '*[_type == "user" && firebaseUid == $recipientUserId][0]{ _id }',
        { recipientUserId }
      );
      if (!userDoc?._id) {
        return NextResponse.json({ message: 'El usuario no existe en Sanity' }, { status: 404 });
      }
      const recipientSanityId = userDoc._id;
      query = `*[_type == "message" && recipientUser._ref == $recipientSanityId && !deleted] | order(createdAt desc) {${MESSAGE_FIELDS}}`;
      params = { recipientSanityId };
    } else if (senderId) {
      // Buscar el _id real del usuario en Sanity usando el UID de Firebase
      const userDoc = await client.fetch(
        '*[_type == "user" && firebaseUid == $senderId][0]{ _id, company->{ _id } }',
        { senderId }
      );
      if (!userDoc?._id) {
        return NextResponse.json({ message: 'El usuario no existe en Sanity' }, { status: 404 });
      }
      // const senderSanityId = userDoc._id;
      const userCompanyId = userDoc.company?._id;
      
      if (!userCompanyId) {
        return NextResponse.json({ message: 'El usuario no pertenece a ninguna empresa' }, { status: 400 });
      }
      
      // Obtener mensajes enviados por la empresa del usuario
      query = `*[_type == "message" && senderCompany._ref == $userCompanyId && !deleted] | order(createdAt desc) {${MESSAGE_FIELDS}}`;
      params = { userCompanyId };
    } else {
      return NextResponse.json({ message: 'Falta companyId, senderId o recipientUserId' }, { status: 400 });
    }

    let messages = await client.fetch(query, params);
    
    // Aplicar límite si se especifica
    if (limit) {
      const limitNum = parseInt(limit);
      messages = messages.slice(0, limitNum);
    }

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener mensajes', error }, { status: 500 });
  }
} 