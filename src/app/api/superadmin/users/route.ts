import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/sanity.client';
import { isSuperadmin } from '@/lib/superadmin';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '@/lib/firebaseConfig';
import { randomUUID } from 'crypto';

const VALID_LIMITS = [20, 50, 100];

function escapeGROQ(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\*/g, '\\*');
}

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!(await isSuperadmin(userId))) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limitParam = parseInt(searchParams.get('limit') || '20', 10);
    const limit = VALID_LIMITS.includes(limitParam) ? limitParam : 20;
    const search = searchParams.get('search')?.trim() || '';
    const start = (page - 1) * limit;
    const end = start + limit;

    const client = getAuthenticatedClient();

    const baseFilter = `_type == "user" && !(_id in path("drafts.**"))`;
    const searchFilter = search
      ? ` && (firstName match "*${escapeGROQ(search)}*" || lastName match "*${escapeGROQ(search)}*" || email match "*${escapeGROQ(search)}*" || (defined(company) && company->nameCompany match "*${escapeGROQ(search)}*"))`
      : '';
    const fullFilter = baseFilter + searchFilter;

    const [users, total] = await Promise.all([
      client.fetch(
        `*[${fullFilter}] | order(_createdAt desc) [${start}...${end}] {
          _id,
          firstName,
          lastName,
          email,
          phone,
          pronoun,
          position,
          typeDocument,
          numDocument,
          role,
          firebaseUid,
          publicProfile,
          notifyEmailMessages,
          photo,
          _createdAt,
          company->{
            _id,
            nameCompany,
            companySize
          }
        }`
      ),
      client.fetch(`count(*[${fullFilter}])`),
    ]);

    return NextResponse.json({
      success: true,
      data: { users, total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching superadmin users:', error);
    return NextResponse.json(
      { success: false, message: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!(await isSuperadmin(userId))) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      companyId,
      phone,
      pronoun,
      position,
      typeDocument,
      numDocument,
      publicProfile,
      notifyEmailMessages,
      photo,
    } = body;

    if (!firstName || !lastName || !email || !role) {
      return NextResponse.json({ message: 'Faltan datos requeridos' }, { status: 400 });
    }
    if (role !== 'superadmin' && role !== 'member' && !companyId) {
      return NextResponse.json({ message: 'La empresa es requerida para este rol' }, { status: 400 });
    }
    if (role === 'member' && !companyId) {
      return NextResponse.json({ message: 'La empresa es requerida para miembros' }, { status: 400 });
    }
    if (role !== 'member' && role !== 'superadmin' && !password) {
      return NextResponse.json({ message: 'La contraseña es requerida para este rol' }, { status: 400 });
    }

    const client = getAuthenticatedClient();

    const superadminDoc = await client.fetch<{ _id: string } | null>(
      `*[_type == "user" && firebaseUid == $uid][0]{ _id }`,
      { uid: userId }
    );

    let firebaseUid: string | undefined;
    if (role !== 'member') {
      if (!password) {
        return NextResponse.json({ message: 'Contraseña requerida' }, { status: 400 });
      }
      try {
        const firebaseUser = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(firebaseUser.user);
        firebaseUid = firebaseUser.user.uid;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error en Firebase Auth';
        return NextResponse.json({ message: msg }, { status: 400 });
      }
    }

    const sanityUserId = randomUUID();
    const companySize = companyId
      ? await client.fetch(`*[_type == "company" && _id == $id][0]{ companySize }`, { id: companyId }).then((c: { companySize?: string } | null) => c?.companySize)
      : 'grande';
    const finalPublicProfile = companySize !== 'grande' ? true : (publicProfile ?? false);

    const userData: Record<string, unknown> = {
      _id: sanityUserId,
      _type: 'user',
      firstName,
      lastName,
      email,
      phone: phone || undefined,
      typeDocument: typeDocument || undefined,
      numDocument: numDocument || undefined,
      pronoun: pronoun || undefined,
      position: position || undefined,
      role,
      publicProfile: finalPublicProfile,
      notifyEmailMessages: notifyEmailMessages === true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (firebaseUid) userData.firebaseUid = firebaseUid;
    if (companyId) userData.company = { _type: 'reference', _ref: companyId };
    if (photo?.asset?._ref) userData.photo = { _type: 'image', asset: { _type: 'reference', _ref: photo.asset._ref } };
    if (superadminDoc?._id) userData.createdBy = { _type: 'reference', _ref: superadminDoc._id };

    const userDoc = await client.create(userData as { _type: string; [key: string]: unknown });

    return NextResponse.json({ success: true, data: { user: userDoc } }, { status: 201 });
  } catch (error) {
    console.error('Error creating superadmin user:', error);
    return NextResponse.json(
      { success: false, message: 'Error al crear usuario' },
      { status: 500 }
    );
  }
}
