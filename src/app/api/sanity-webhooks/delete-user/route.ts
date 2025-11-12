import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { adminAuth } from '@/lib/firebase-admin';

const SIGNATURE_HEADER = 'x-sanity-webhook-signature';

const getExpectedSignature = (payload: string, secret: string) => {
  const hash = createHmac('sha256', secret).update(payload).digest('hex');
  return `sha256=${hash}`;
};

const isSignatureValid = (payload: string, signature: string | null, secret: string) => {
  if (!signature) {
    return false;
  }

  const expected = getExpectedSignature(payload, secret);

  if (expected.length !== signature.length) {
    return false;
  }

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
};

const extractFirebaseUid = (payload: Record<string, unknown>): string | null => {
  const possiblePaths = [
    ['document', 'firebaseUid'],
    ['previous', 'firebaseUid'],
    ['payload', 'firebaseUid'],
    ['body', 'firebaseUid'],
    ['data', 'firebaseUid'],
  ];

  for (const path of possiblePaths) {
    let current: unknown = payload;

    for (const key of path) {
      if (typeof current !== 'object' || current === null || !(key in current)) {
        current = undefined;
        break;
      }
      current = (current as Record<string, unknown>)[key];
    }

    if (typeof current === 'string' && current.trim().length > 0) {
      return current;
    }
  }

  if (typeof payload?.firebaseUid === 'string' && payload.firebaseUid.trim().length > 0) {
    return payload.firebaseUid;
  }

  return null;
};

const isDeleteEvent = (payload: Record<string, unknown>) => {
  const transition = payload?.transition;
  const operation = payload?.operation;
  const event = payload?.event;

  return transition === 'delete' || operation === 'delete' || event === 'delete';
};

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
    const signature = request.headers.get(SIGNATURE_HEADER);

    if (!isSignatureValid(rawBody, signature, secret)) {
      return NextResponse.json({ ok: false, error: 'Firma inválida' }, { status: 401 });
    }

    const body = JSON.parse(rawBody) as Record<string, unknown>;

    if (!isDeleteEvent(body)) {
      return NextResponse.json({ ok: true, message: 'Evento ignorado' });
    }

    const firebaseUid = extractFirebaseUid(body);

    if (!firebaseUid) {
      return NextResponse.json(
        { ok: false, error: 'No se encontró el UID de Firebase' },
        { status: 400 },
      );
    }

    try {
      await adminAuth.deleteUser(firebaseUid);
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

