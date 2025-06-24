import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/sanity.client';

export async function POST(req: NextRequest) {
  const client = getAuthenticatedClient();
  const { subject, content, senderId, recipientCompanyId } = await req.json();

  if (!subject || !content || !senderId || !recipientCompanyId) {
    return NextResponse.json({ message: 'Faltan campos obligatorios' }, { status: 400 });
  }

  // Buscar el _id real del usuario en Sanity usando el UID de Firebase
  const userDoc = await client.fetch(
    '*[_type == "user" && firebaseUid == $senderId][0]{ _id, company->{ _id, nameCompany } }',
    { senderId }
  );
  if (!userDoc?._id) {
    return NextResponse.json({ message: 'El usuario no existe en Sanity' }, { status: 404 });
  }
  const senderSanityId = userDoc._id;
  const senderCompanyId = userDoc.company?._id;

  if (!senderCompanyId) {
    return NextResponse.json({ message: 'El usuario no pertenece a ninguna empresa' }, { status: 400 });
  }

  // Validar que la empresa destinataria exista en Sanity
  const recipientCompanyExists = await client.fetch(
    '*[_type == "company" && _id == $recipientCompanyId][0]._id',
    { recipientCompanyId }
  );
  if (!recipientCompanyExists) {
    return NextResponse.json({ message: 'La empresa destinataria no existe en Sanity' }, { status: 404 });
  }

  // Evitar que una empresa se envíe mensajes a sí misma
  if (senderCompanyId === recipientCompanyId) {
    return NextResponse.json({ message: 'No puedes enviar mensajes a tu propia empresa' }, { status: 400 });
  }

  try {
    const result = await client.create({
      _type: 'message',
      subject,
      content,
      sender: { _type: 'reference', _ref: senderSanityId },
      senderCompany: { _type: 'reference', _ref: senderCompanyId },
      recipientCompany: { _type: 'reference', _ref: recipientCompanyId },
      createdAt: new Date().toISOString(),
      read: false,
      deleted: false
    });
    return NextResponse.json({ message: 'Mensaje enviado', result }, { status: 201 });
  } catch (error) {
    console.error('Error en send-message:', error);
    return NextResponse.json({ message: 'Error al enviar mensaje', error: String(error) }, { status: 500 });
  }
} 