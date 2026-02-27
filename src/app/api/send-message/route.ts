import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/sanity.client';
import { sendMessageEmail } from '@/lib/sendMessageEmail';

export async function POST(req: NextRequest) {
  const client = getAuthenticatedClient();
  const { subject, content, senderId, recipientCompanyId, recipientUserId } = await req.json();

  if (!subject || !content || !senderId) {
    return NextResponse.json({ message: 'Faltan campos obligatorios' }, { status: 400 });
  }

  if (!recipientCompanyId && !recipientUserId) {
    return NextResponse.json({ message: 'Debes especificar empresa o persona destinataria' }, { status: 400 });
  }

  if (recipientCompanyId && recipientUserId) {
    return NextResponse.json({ message: 'Especifica solo empresa o persona, no ambos' }, { status: 400 });
  }

  const userDoc = await client.fetch(
    '*[_type == "user" && firebaseUid == $senderId][0]{ _id, firstName, lastName, company->{ _id, nameCompany } }',
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

  let recipientCompanyRef: { _type: string; _ref: string } | null = null;
  let recipientUserRef: { _type: string; _ref: string } | null = null;

  if (recipientCompanyId) {
    const recipientCompanyExists = await client.fetch(
      '*[_type == "company" && _id == $recipientCompanyId][0]._id',
      { recipientCompanyId }
    );
    if (!recipientCompanyExists) {
      return NextResponse.json({ message: 'La empresa destinataria no existe' }, { status: 404 });
    }
    if (senderCompanyId === recipientCompanyId) {
      return NextResponse.json({ message: 'No puedes enviar mensajes a tu propia empresa' }, { status: 400 });
    }
    recipientCompanyRef = { _type: 'reference', _ref: recipientCompanyId };
  } else if (recipientUserId) {
    const recipientUser = await client.fetch(
      `*[_type == "user" && _id == $recipientUserId][0]{
        _id,
        firstName,
        lastName,
        email,
        role,
        publicProfile,
        "company": company->{ _id, companySize }
      }`,
      { recipientUserId }
    );
    if (!recipientUser?._id) {
      return NextResponse.json({ message: 'El usuario destinatario no existe' }, { status: 404 });
    }
    const isVisible =
      recipientUser.publicProfile === true ||
      (recipientUser.role === 'member' && recipientUser.company?.companySize !== 'grande');
    if (!isVisible) {
      return NextResponse.json(
        { message: 'Solo puedes enviar mensajes a usuarios con perfil público' },
        { status: 400 }
      );
    }
    if (senderSanityId === recipientUserId) {
      return NextResponse.json({ message: 'No puedes enviarte mensajes a ti mismo' }, { status: 400 });
    }
    recipientUserRef = { _type: 'reference', _ref: recipientUserId };
    recipientCompanyRef = recipientUser.company?._id
      ? { _type: 'reference', _ref: recipientUser.company._id }
      : null;
  }

  try {
    const messageDoc: Record<string, unknown> = {
      _type: 'message',
      subject,
      content,
      sender: { _type: 'reference', _ref: senderSanityId },
      senderCompany: { _type: 'reference', _ref: senderCompanyId },
      createdAt: new Date().toISOString(),
      read: false,
      deleted: false,
    };
    if (recipientCompanyRef) messageDoc.recipientCompany = recipientCompanyRef;
    if (recipientUserRef) messageDoc.recipientUser = recipientUserRef;

    const result = await client.create(messageDoc as { _type: string; [key: string]: unknown });

    let emailEnviado = true;
    let emailError: string | null = null;

    if (recipientUserRef) {
      const recipientUser = await client.fetch(
        `*[_type == "user" && _id == $userId][0]{ firstName, lastName, email, role, notifyEmailMessages }`,
        { userId: recipientUserId }
      );
      const notifyValue = recipientUser?.notifyEmailMessages;
      const shouldSendEmail = !!recipientUser?.email
        && (notifyValue === true || notifyValue === 'true');
      if (shouldSendEmail) {
        try {
          await sendMessageEmail(
            recipientUser.email,
            [recipientUser.firstName, recipientUser.lastName].filter(Boolean).join(' ') || 'Usuario',
            [userDoc.firstName, userDoc.lastName].filter(Boolean).join(' ') || 'Remitente',
            userDoc.company?.nameCompany || 'Empresa',
            subject,
            content
          );
        } catch (emailErr) {
          emailEnviado = false;
          emailError = emailErr instanceof Error ? emailErr.message : String(emailErr);
          console.error('Error al enviar email al miembro:', emailErr);
        }
      }
    }

    return NextResponse.json(
      { message: 'Mensaje enviado', result, emailEnviado, emailError: emailError ?? undefined },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en send-message:', error);
    return NextResponse.json({ message: 'Error al enviar mensaje', error: String(error) }, { status: 500 });
  }
}
