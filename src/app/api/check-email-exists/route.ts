import { NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity.client';

/**
 * Verifica si existe un usuario con el email que puede restablecer contraseña
 * (debe tener firebaseUid - los miembros no aplican)
 */
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ exists: false });
    }

    const emailNormalized = email.trim();
    const user = await sanityClient.fetch(
      `*[_type == "user" && email == $email && defined(firebaseUid) && firebaseUid != ""][0]{ _id }`,
      { email: emailNormalized }
    );

    return NextResponse.json({ exists: !!user?._id });
  } catch (error) {
    console.error('Error al verificar email:', error);
    return NextResponse.json({ exists: false });
  }
}
