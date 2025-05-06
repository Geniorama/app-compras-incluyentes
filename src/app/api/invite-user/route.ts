import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/sanity.client';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '@/lib/firebaseConfig';

export async function POST(request: Request) {
  try {
    const client = getAuthenticatedClient();
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      inviterUid,
      phone,
      pronoun,
      position,
      typeDocument,
      numDocument
    } = await request.json();
    if (!firstName || !lastName || !email || !password || !inviterUid) {
      return NextResponse.json({ message: 'Faltan datos requeridos' }, { status: 400 });
    }

    // 1. Buscar la compañía del usuario que invita
    const inviter = await client.fetch(`*[_type == "user" && firebaseUid == $uid][0]{ company->{_id} }`, { uid: inviterUid });
    if (!inviter?.company?._id) {
      return NextResponse.json({ message: 'No se encontró la compañía del usuario actual' }, { status: 400 });
    }

    // 2. Crear usuario en Firebase Auth
    let firebaseUser;
    try {
      firebaseUser = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(firebaseUser.user);
    } catch (err: unknown) {
      if (err instanceof Error) {
        return NextResponse.json({ message: err.message || 'Error en Firebase Auth' }, { status: 400 });
      }
      return NextResponse.json({ message: 'Error en Firebase Auth' }, { status: 400 });
    }

    // 3. Crear usuario en Sanity como borrador
    const userDraftId = `drafts.${uuidv4()}`;
    const userDoc = await client.create({
      _id: userDraftId,
      _type: 'user',
      firstName,
      lastName,
      email,
      phone,
      pronoun,
      position,
      typeDocument,
      numDocument,
      role,
      firebaseUid: firebaseUser.user.uid,
      company: { _type: 'reference', _ref: inviter.company._id },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ message: 'Usuario invitado correctamente', user: userDoc });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error al invitar usuario' }, { status: 500 });
  }
} 