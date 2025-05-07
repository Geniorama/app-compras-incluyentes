import { NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity.client';
import { sendActivationEmail } from '@/lib/sendActivationEmail';

export async function POST(request: Request) {
  const body = await request.json();

  // Solo continuar si la empresa fue activada
  if (body?.transition !== 'update' || !body?.document?.active) {
    return NextResponse.json({ ok: true });
  }

  const companyId = body.document._id;

  // Buscar usuarios de la empresa
  const users = await sanityClient.fetch(
    `*[_type == "user" && company._ref == $companyId]{
      email, firstName
    }`,
    { companyId }
  );

  // Enviar correo a cada usuario
  for (const user of users) {
    await sendActivationEmail(user.email, user.firstName);
  }

  return NextResponse.json({ ok: true });
} 