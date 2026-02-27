import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/sanity.client';

/**
 * PATCH /api/messages/bulk-delete
 * Marca como eliminados mensajes del usuario.
 * Body: { bandeja?: 'recibidos' | 'enviados', messageIds?: string[], userId: string }
 * - bandeja: borrar toda la bandeja
 * - messageIds: borrar solo esos mensajes (validados por pertenencia al usuario)
 */
export async function PATCH(req: NextRequest) {
  try {
    const client = getAuthenticatedClient();
    const body = await req.json();
    const { bandeja, messageIds: idsParam, userId } = body as {
      bandeja?: string;
      messageIds?: string[];
      userId?: string;
    };

    if (!userId) {
      return NextResponse.json({ message: 'Falta userId' }, { status: 400 });
    }

    const userDoc = await client.fetch(
      '*[_type == "user" && firebaseUid == $userId][0]{ _id, company->{ _id } }',
      { userId }
    );

    if (!userDoc?._id) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }

    const userSanityId = userDoc._id;
    const userCompanyId = userDoc.company?._id;

    let messageIds: string[];

    if (idsParam && Array.isArray(idsParam) && idsParam.length > 0) {
      // Borrar mensajes específicos: validar que pertenecen al usuario
      const validIds: string[] = [];
      for (const id of idsParam) {
        const msg = await client.fetch<{
          recipientCompanyRef?: string;
          recipientUserRef?: string;
          senderCompanyRef?: string;
        }>(
          `*[_type == "message" && _id == $id && !deleted][0]{
            "recipientCompanyRef": recipientCompany._ref,
            "recipientUserRef": recipientUser._ref,
            "senderCompanyRef": senderCompany._ref
          }`,
          { id }
        );
        if (!msg) continue;
        const esRecibidoCompany = msg.recipientCompanyRef === userCompanyId;
        const esRecibidoUser = msg.recipientUserRef === userSanityId;
        const esEnviadoCompany = msg.senderCompanyRef === userCompanyId;
        if (esRecibidoCompany || esRecibidoUser || esEnviadoCompany) {
          validIds.push(id);
        }
      }
      messageIds = validIds;
    } else if (bandeja === 'recibidos' || bandeja === 'enviados') {
      // Borrar toda la bandeja
      if (bandeja === 'recibidos') {
        const recibidosCompany: string[] = userCompanyId
          ? await client.fetch(
              `*[_type == "message" && recipientCompany._ref == $companyId && !deleted]._id`,
              { companyId: userCompanyId }
            )
          : [];
        const recibidosUser: string[] = await client.fetch(
          `*[_type == "message" && recipientUser._ref == $userSanityId && !deleted]._id`,
          { userSanityId }
        );
        const idsSet = new Set([...recibidosCompany, ...recibidosUser]);
        messageIds = Array.from(idsSet);
      } else {
        if (!userCompanyId) {
          return NextResponse.json(
            { message: 'El usuario no pertenece a ninguna empresa' },
            { status: 400 }
          );
        }
        messageIds = await client.fetch(
          `*[_type == "message" && senderCompany._ref == $userCompanyId && !deleted]._id`,
          { userCompanyId }
        );
      }
    } else {
      return NextResponse.json(
        { message: 'Debe especificar bandeja o messageIds' },
        { status: 400 }
      );
    }

    if (messageIds.length === 0) {
      return NextResponse.json(
        { message: 'No hay mensajes para eliminar', deletedCount: 0 },
        { status: 200 }
      );
    }

    const transaction = client.transaction();
    for (const id of messageIds) {
      transaction.patch(id, { set: { deleted: true } });
    }
    await transaction.commit();

    return NextResponse.json(
      { message: 'Bandeja eliminada', deletedCount: messageIds.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al borrar bandeja de mensajes:', error);
    return NextResponse.json(
      { message: 'Error al borrar la bandeja' },
      { status: 500 }
    );
  }
}
