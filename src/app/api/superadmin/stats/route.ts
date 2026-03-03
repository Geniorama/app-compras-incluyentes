import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/sanity.client';
import { isSuperadmin } from '@/lib/superadmin';

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!(await isSuperadmin(userId))) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
    }

    const client = getAuthenticatedClient();

    const [
      totalUsers,
      totalCompanies,
      activeCompanies,
      pendingCompanies,
      totalProducts,
      totalServices,
      totalCategories,
    ] = await Promise.all([
      client.fetch(`count(*[_type == "user" && !(_id in path("drafts.**"))])`),
      client.fetch(`count(*[_type == "company" && !(_id in path("drafts.**"))])`),
      client.fetch(`count(*[_type == "company" && active == true])`),
      client.fetch(`count(*[_type == "company" && active == false])`),
      client.fetch(`count(*[_type == "product"])`),
      client.fetch(`count(*[_type == "service"])`),
      client.fetch(`count(*[_type == "category"])`),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalCompanies,
        activeCompanies,
        pendingCompanies,
        totalProducts,
        totalServices,
        totalCategories,
      },
    });
  } catch (error) {
    console.error('Error fetching superadmin stats:', error);
    return NextResponse.json(
      { success: false, message: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
