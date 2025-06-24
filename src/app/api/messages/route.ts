import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/sanity.client';

export async function GET(req: NextRequest) {
  const client = getAuthenticatedClient();
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('companyId');
  const senderId = searchParams.get('senderId');
  const limit = searchParams.get('limit');

  try {
    let query = '';
    let params = {};
    
    if (companyId) {
      // Obtener mensajes recibidos por la empresa (como destinataria)
      query = `*[_type == "message" && recipientCompany._ref == $companyId && !deleted] | order(createdAt desc) {
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
        }
      }`;
      params = { companyId };
    } else if (senderId) {
      // Buscar el _id real del usuario en Sanity usando el UID de Firebase
      const userDoc = await client.fetch(
        '*[_type == "user" && firebaseUid == $senderId][0]{ _id, company->{ _id } }',
        { senderId }
      );
      if (!userDoc?._id) {
        return NextResponse.json({ message: 'El usuario no existe en Sanity' }, { status: 404 });
      }
      const senderSanityId = userDoc._id;
      const userCompanyId = userDoc.company?._id;
      
      if (!userCompanyId) {
        return NextResponse.json({ message: 'El usuario no pertenece a ninguna empresa' }, { status: 400 });
      }
      
      // Obtener mensajes enviados por la empresa del usuario
      query = `*[_type == "message" && senderCompany._ref == $userCompanyId && !deleted] | order(createdAt desc) {
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
        }
      }`;
      params = { userCompanyId };
    } else {
      return NextResponse.json({ message: 'Falta companyId o senderId' }, { status: 400 });
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