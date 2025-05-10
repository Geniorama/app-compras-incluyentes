import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/sanity.client';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '@/lib/firebaseConfig';

interface InviteUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  inviterUid: string;
  phone?: string;
  pronoun?: string;
  position?: string;
  typeDocument?: string;
  numDocument?: string;
}

export async function POST(request: Request) {
  try {
    const client = getAuthenticatedClient();
    const body = await request.json() as InviteUserData;
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
    } = body;

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
      typeDocument,
      numDocument,
      pronoun,
      position,
      firebaseUid: firebaseUser.user.uid,
      role,
      company: {
        _type: 'reference',
        _ref: inviter.company._id
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ 
      message: 'Usuario invitado exitosamente',
      user: userDoc
    });
  } catch (error) {
    console.error('Error al invitar usuario:', error);
    return NextResponse.json(
      { message: 'Error al invitar usuario' },
      { status: 500 }
    );
  }
} 