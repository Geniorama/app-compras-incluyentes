import { NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity.client';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { app } from '@/lib/firebase';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: 'El email es requerido' },
        { status: 400 }
      );
    }

    // Verificar en Firebase Auth
    try {
      const auth = getAuth(app);
      // Intentar iniciar sesión con una contraseña temporal
      // Si el email existe, fallará con un error específico
      await signInWithEmailAndPassword(auth, email, 'temporary-password');
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        // Si el error es que la contraseña es incorrecta, significa que el email existe
        if (error.code === 'auth/wrong-password') {
          return NextResponse.json({ exists: true });
        }
        // Si el error es que el usuario no existe, continuamos con la verificación en Sanity
        if (error.code !== 'auth/user-not-found') {
          console.error('Error al verificar en Firebase:', error);
        }
      }
    }

    // Buscar el email en Sanity
    const query = `*[_type == "user" && email == $email][0]`;
    const user = await sanityClient.fetch(query, { email });

    return NextResponse.json({ exists: !!user });
  } catch (error) {
    console.error('Error al verificar email:', error);
    return NextResponse.json(
      { message: 'Error al verificar el email' },
      { status: 500 }
    );
  }
} 