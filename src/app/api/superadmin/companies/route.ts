import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/sanity.client';
import { isSuperadmin } from '@/lib/superadmin';
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

    const baseFilter = `_type == "company" && !(_id in path("drafts.**"))`;
    const searchFilter = search
      ? ` && (nameCompany match "*${escapeGROQ(search)}*" || businessName match "*${escapeGROQ(search)}*" || department match "*${escapeGROQ(search)}*" || city match "*${escapeGROQ(search)}*")`
      : '';
    const fullFilter = baseFilter + searchFilter;

    const [companies, total] = await Promise.all([
      client.fetch(
        `*[${fullFilter}] | order(_createdAt desc) [${start}...${end}] {
          _id,
          nameCompany,
          businessName,
          webSite,
          department,
          city,
          companySize,
          active,
          _createdAt,
          _updatedAt
        }`
      ),
      client.fetch(`count(*[${fullFilter}])`),
    ]);

    return NextResponse.json({
      success: true,
      data: { companies, total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching superadmin companies:', error);
    return NextResponse.json(
      { success: false, message: 'Error al obtener empresas' },
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
      nameCompany,
      businessName,
      description,
      typeDocumentCompany,
      numDocumentCompany,
      ciiu,
      webSite,
      addressCompany,
      department,
      city,
      country,
      companySize,
      sector,
      phone,
      active,
      logo,
    } = body;

    if (!nameCompany?.trim()) {
      return NextResponse.json(
        { message: 'El nombre de la empresa es requerido' },
        { status: 400 }
      );
    }

    const client = getAuthenticatedClient();
    const companyId = randomUUID();

    const superadminDoc = await client.fetch<{ _id: string } | null>(
      `*[_type == "user" && firebaseUid == $uid][0]{ _id }`,
      { uid: userId }
    );

    const docData: Record<string, unknown> = {
      _id: companyId,
      _type: 'company',
      nameCompany: nameCompany.trim(),
      businessName: (businessName || nameCompany).trim(),
      description: description || '',
      typeDocumentCompany: typeDocumentCompany || 'nit',
      numDocumentCompany: numDocumentCompany || '',
      ciiu: ciiu || '',
      webSite: webSite || '',
      addressCompany: addressCompany || '',
      department: department || '',
      city: city || '',
      country: country || 'Colombia',
      companySize: companySize || 'indefinido',
      sector: sector || '',
      phone: phone || '',
      active: active === true,
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
    };

    if (logo?.asset?._ref) {
      docData.logo = { _type: 'image', asset: { _type: 'reference', _ref: logo.asset._ref } };
    }
    if (superadminDoc?._id) {
      docData.createdBy = { _type: 'reference', _ref: superadminDoc._id };
    }

    const doc = await client.create(docData as { _type: string; [key: string]: unknown });

    return NextResponse.json({ success: true, data: { company: doc } }, { status: 201 });
  } catch (error) {
    console.error('Error creating superadmin company:', error);
    return NextResponse.json(
      { success: false, message: 'Error al crear empresa' },
      { status: 500 }
    );
  }
}
