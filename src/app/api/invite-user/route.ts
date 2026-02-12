import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/sanity.client';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '@/lib/firebaseConfig';

interface InviteUserData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: string;
  inviterUid: string;
  phone?: string;
  pronoun?: string;
  position?: string;
  typeDocument?: string;
  numDocument?: string;
  publicProfile?: boolean;
  photo?: { _type: string; asset: { _type: string; _ref: string } };
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
      numDocument,
      publicProfile,
      photo
    } = body;

    if (!firstName || !lastName || !email || !inviterUid) {
      return NextResponse.json({ message: 'Faltan datos requeridos' }, { status: 400 });
    }

    // Validar contraseña solo si el rol no es "member"
    if (role !== 'member' && !password) {
      return NextResponse.json({ message: 'La contraseña es requerida para este rol' }, { status: 400 });
    }

    // 1. Buscar la compañía del usuario que invita
    const inviter = await client.fetch(`*[_type == "user" && firebaseUid == $uid][0]{ company->{_id, companySize} }`, { uid: inviterUid });
    if (!inviter?.company?._id) {
      return NextResponse.json({ message: 'No se encontró la compañía del usuario actual' }, { status: 400 });
    }

    const companySize = inviter.company.companySize;
    // Si companySize no es "grande", publicProfile debe ser true obligatoriamente
    const finalPublicProfile = companySize !== "grande" ? true : (publicProfile || false);

    // 2. Crear usuario en Firebase Auth solo si el rol NO es "member"
    let firebaseUid: string | undefined = undefined;
    if (role !== 'member') {
      if (!password) {
        return NextResponse.json({ message: 'La contraseña es requerida para este rol' }, { status: 400 });
      }
      try {
        const firebaseUser = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(firebaseUser.user);
        firebaseUid = firebaseUser.user.uid;
      } catch (err: unknown) {
        if (err instanceof Error) {
          return NextResponse.json({ message: err.message || 'Error en Firebase Auth' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Error en Firebase Auth' }, { status: 400 });
      }
    }

    // 3. Crear usuario en Sanity
    // Los miembros se crean como documentos publicados (no drafts) ya que no necesitan autenticación
    const userDraftId = role === 'member' ? uuidv4() : `drafts.${uuidv4()}`;
    const userData: {
      _id: string;
      _type: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      typeDocument?: string;
      numDocument?: string;
      pronoun?: string;
      position?: string;
      role: string;
      publicProfile: boolean;
      company: {
        _type: string;
        _ref: string;
      };
      createdAt: string;
      updatedAt: string;
      firebaseUid?: string;
      photo?: { _type: string; asset: { _type: string; _ref: string } };
    } = {
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
      role,
      publicProfile: finalPublicProfile,
      company: {
        _type: 'reference',
        _ref: inviter.company._id
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Solo agregar firebaseUid si existe (no es member)
    if (firebaseUid) {
      userData.firebaseUid = firebaseUid;
    }

    // Agregar foto si fue subida
    if (photo?.asset?._ref) {
      userData.photo = { _type: 'image', asset: { _type: 'reference', _ref: photo.asset._ref } };
    }

    const userDoc = await client.create(userData);

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