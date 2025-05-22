import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/sanity.client';

export async function POST(req: NextRequest) {
  const client = getAuthenticatedClient();
  const { subject, content, senderId, companyId } = await req.json();

  if (!subject || !content || !senderId || !companyId) {
    return NextResponse.json({ message: 'Faltan campos obligatorios' }, { status: 400 });
  }

  // Buscar el _id real del usuario en Sanity usando el UID de Firebase
  const userDoc = await client.fetch(
    '*[_type == "user" && firebaseUid == $senderId][0]{ _id }',
    { senderId }
  );
  if (!userDoc?._id) {
    return NextResponse.json({ message: 'El usuario no existe en Sanity' }, { status: 404 });
  }
  const senderSanityId = userDoc._id;

  // Validar que la empresa exista en Sanity
  const companyExists = await client.fetch(
    '*[_type == "company" && _id == $companyId][0]._id',
    { companyId }
  );
  if (!companyExists) {
    return NextResponse.json({ message: 'La empresa no existe en Sanity' }, { status: 404 });
  }

  try {
    const result = await client.create({
      _type: 'message',
      subject,
      content,
      sender: { _type: 'reference', _ref: senderSanityId },
      company: { _type: 'reference', _ref: companyId },
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