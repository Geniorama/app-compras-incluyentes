import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/sanity.client';

export async function PATCH(req: NextRequest) {
  const client = getAuthenticatedClient();
  const { messageId } = await req.json();

  if (!messageId) {
    return NextResponse.json({ message: 'Falta el ID del mensaje' }, { status: 400 });
  }

  try {
    await client.patch(messageId).set({ read: true }).commit();
    return NextResponse.json({ message: 'Mensaje marcado como leído' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error al marcar como leído', error: String(error) }, { status: 500 });
  }
} 