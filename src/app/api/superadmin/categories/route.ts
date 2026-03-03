import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/sanity.client';
import { isSuperadmin } from '@/lib/superadmin';

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

    const baseFilter = `_type == "category"`;
    const searchFilter = search
      ? ` && (name match "*${escapeGROQ(search)}*" || (defined(description) && description match "*${escapeGROQ(search)}*"))`
      : '';
    const fullFilter = baseFilter + searchFilter;

    const [categories, total] = await Promise.all([
      client.fetch(
        `*[${fullFilter}] | order(name asc) [${start}...${end}] {
          _id,
          name,
          description,
          types,
          slug,
          image{ asset->{ url, _id } },
          _createdAt,
          _updatedAt
        }`
      ),
      client.fetch(`count(*[${fullFilter}])`),
    ]);

    return NextResponse.json({
      success: true,
      data: { categories, total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching superadmin categories:', error);
    return NextResponse.json(
      { success: false, message: 'Error al obtener categorías' },
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
    const { name, description, types, image } = body;

    if (!name || !Array.isArray(types)) {
      return NextResponse.json(
        { message: 'Se requieren name y types' },
        { status: 400 }
      );
    }

    const client = getAuthenticatedClient();
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const superadminDoc = await client.fetch<{ _id: string } | null>(
      `*[_type == "user" && firebaseUid == $uid][0]{ _id }`,
      { uid: userId }
    );

    const docData: Record<string, unknown> = {
      _type: 'category',
      name,
      description: description || '',
      types,
      slug: { _type: 'slug', current: slug },
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
    };
    if (image?.asset?._ref) {
      docData.image = { _type: 'image', asset: { _type: 'reference', _ref: image.asset._ref } };
    }
    if (superadminDoc?._id) {
      docData.createdBy = { _type: 'reference', _ref: superadminDoc._id };
    }
    const doc = await client.create(docData as { _type: string; [key: string]: unknown });

    return NextResponse.json({ success: true, data: { category: doc } }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, message: 'Error al crear categoría' },
      { status: 500 }
    );
  }
}
