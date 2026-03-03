import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { adminAuth } from '@/lib/firebase-admin';

const SIGNATURE_HEADER = 'x-sanity-webhook-signature';
const LEGACY_SIGNATURE_HEADER = 'sanity-webhook-signature';

const isSignatureValid = (payload: string, signature: string | null, secret: string) => {
  if (!signature) {
    return false;
  }

  const trimmed = signature.trim();

  // Legacy header: sha256=<hex>
  if (trimmed.startsWith('sha256=')) {
    const expected = createHmac('sha256', secret).update(payload).digest('hex');
    const received = trimmed.slice(7);

    if (expected.length !== received.length) {
      return false;
    }

    try {
      return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(received, 'hex'));
    } catch {
      return false;
    }
  }

  // New Sanity header format: t=<timestamp>,v1=<base64 hmac>
  const parts = trimmed.split(',').map((part) => part.trim());
  const v1Part = parts.find((part) => part.startsWith('v1='));
  const tPart = parts.find((part) => part.startsWith('t='));

  if (!v1Part || !tPart) {
    return false;
  }

  const received = v1Part.slice(3);
  const timestamp = tPart.slice(2);

  if (!timestamp) {
    return false;
  }

  const message = `${timestamp}.${payload}`;

  try {
    const expectedBuffer = createHmac('sha256', secret).update(message).digest();
    const receivedBuffer = Buffer.from(
      received.replace(/-/g, '+').replace(/_/g, '/'),
      'base64',
    );

    if (expectedBuffer.length !== receivedBuffer.length) {
      return false;
    }

    return timingSafeEqual(expectedBuffer, receivedBuffer);
  } catch {
    return false;
  }
};

const POSSIBLE_DOC_PATHS = ['document', 'previous', 'payload', 'body', 'data'];

function getFromPayload<T>(payload: Record<string, unknown>, key: string): T | null {
  for (const base of POSSIBLE_DOC_PATHS) {
    const obj = payload[base];
    if (typeof obj === 'object' && obj !== null && key in obj) {
      const val = (obj as Record<string, unknown>)[key];
      if (val != null) return val as T;
    }
  }
  if (key in payload) {
    const val = payload[key];
    if (val != null) return val as T;
  }
  return null;
}

/** Solo proceder si el documento eliminado es un usuario publicado (no un borrador) y no es superadmin. */
function shouldDeleteFirebaseUser(payload: Record<string, unknown>): { firebaseUid: string } | null {
  const docType = getFromPayload<string>(payload, '_type');
  const docId = getFromPayload<string>(payload, '_id') ?? '';
  const firebaseUid = getFromPayload<string>(payload, 'firebaseUid');
  const role = getFromPayload<string>(payload, 'role');

  // Debe ser un documento de tipo user con firebaseUid
  if (docType !== 'user' || !firebaseUid || typeof firebaseUid !== 'string' || firebaseUid.trim().length === 0) {
    return null;
  }

  // NUNCA borrar superadmin de Firebase (evita bloqueo total del panel)
  if (role === 'superadmin') {
    return null;
  }

  // NO borrar Firebase si se elimina un BORRADOR (drafts.user-xxx). Solo si es el documento publicado.
  // Al eliminar/descartar borradores en Studio se dispara el webhook y se borraba el usuario por error.
  if (docId.startsWith('drafts.') || docId.includes('.drafts.')) {
    return null;
  }

  return { firebaseUid: firebaseUid.trim() };
}

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.SANITY_WEBHOOK_SECRET;

    if (!secret) {
      return NextResponse.json(
        { ok: false, error: 'Configuración de secretos incompleta' },
        { status: 500 },
      );
    }

    const rawBody = await request.text();
    const body = JSON.parse(rawBody) as Record<string, unknown>;
    const signature =
      request.headers.get(SIGNATURE_HEADER) ??
      request.headers.get(LEGACY_SIGNATURE_HEADER);
    const sanityOperation = request.headers.get('sanity-operation');

    if (!isSignatureValid(rawBody, signature, secret)) {
      return NextResponse.json({ ok: false, error: 'Firma inválida' }, { status: 401 });
    }

    if (
      sanityOperation &&
      sanityOperation.toLowerCase() !== 'delete'
    ) {
      return NextResponse.json({ ok: true, message: 'Evento ignorado' });
    }

    const result = shouldDeleteFirebaseUser(body);

    if (!result) {
      return NextResponse.json(
        { ok: true, message: 'Evento ignorado (no es eliminación de usuario publicado o es borrador)' },
      );
    }

    try {
      await adminAuth.deleteUser(result.firebaseUid);
    } catch (error) {
      // Ignorar si el usuario ya no existe
      if (!(error instanceof Error) || !('code' in error) || (error as { code: string }).code !== 'auth/user-not-found') {
        throw error;
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error al procesar el webhook de Sanity:', error);
    return NextResponse.json(
      { ok: false, error: 'Error al procesar el webhook' },
      { status: 500 },
    );
  }
}

