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

  // Buscar la información de la empresa
  const company = await sanityClient.fetch(
    `*[_type == "company" && _id == $companyId][0]{
      name
    }`,
    { companyId }
  );

  if (!company) {
    console.error('No se encontró la empresa:', companyId);
    return NextResponse.json({ ok: false, error: 'Empresa no encontrada' }, { status: 404 });
  }

  // Buscar usuarios de la empresa
  const users = await sanityClient.fetch(
    `*[_type == "user" && company._ref == $companyId]{
      email,
      firstName
    }`,
    { companyId }
  );

  // Enviar correo a cada usuario
  for (const user of users) {
    try {
      await sendActivationEmail(user.email, user.firstName, company.name);
      console.log(`Correo enviado exitosamente a ${user.email}`);
    } catch (error) {
      console.error(`Error al enviar correo a ${user.email}:`, error);
    }
  }

  return NextResponse.json({ ok: true });
} 