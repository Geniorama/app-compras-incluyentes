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
    const body = JSON.parse(rawBody) as Record<string, unknown>;
    const signature =
      request.headers.get(SIGNATURE_HEADER) ??
      request.headers.get(LEGACY_SIGNATURE_HEADER);

    if (!isSignatureValid(rawBody, signature, secret)) {
      return NextResponse.json({ ok: false, error: 'Firma inválida' }, { status: 401 });
    }

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

