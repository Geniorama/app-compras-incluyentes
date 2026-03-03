import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/sanity.client';
import { isSuperadmin } from '@/lib/superadmin';

function escapeCsv(value: unknown): string {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!(await isSuperadmin(userId))) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'users';

    const client = getAuthenticatedClient();

    if (type === 'users') {
      const users = await client.fetch(
        `*[_type == "user" && !(_id in path("drafts.**"))] | order(_createdAt desc) {
          firstName,
          lastName,
          email,
          phone,
          role,
          _createdAt,
          "empresa": company->nameCompany
        }`
      );

      const headers = ['Nombre', 'Apellido', 'Email', 'Teléfono', 'Rol', 'Empresa', 'Fecha registro'];
      const rows = users.map((u: Record<string, unknown>) => [
        u.firstName,
        u.lastName,
        u.email,
        u.phone,
        u.role,
        u.empresa,
        u._createdAt,
      ]);
      const csv = [headers.join(','), ...rows.map((r: unknown[]) => r.map(escapeCsv).join(','))].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="usuarios-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    if (type === 'companies') {
      const companies = await client.fetch(
        `*[_type == "company" && !(_id in path("drafts.**"))] | order(_createdAt desc) {
          nameCompany,
          businessName,
          webSite,
          department,
          city,
          companySize,
          active,
          _createdAt
        }`
      );

      const headers = ['Nombre', 'Razón social', 'Web', 'Departamento', 'Ciudad', 'Tamaño', 'Activa', 'Fecha registro'];
      const rows = companies.map((c: Record<string, unknown>) => [
        c.nameCompany,
        c.businessName,
        c.webSite,
        c.department,
        c.city,
        c.companySize,
        c.active ? 'Sí' : 'No',
        c._createdAt,
      ]);
      const csv = [headers.join(','), ...rows.map((r: unknown[]) => r.map(escapeCsv).join(','))].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="empresas-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    if (type === 'categories') {
      const categories = await client.fetch(
        `*[_type == "category"] | order(name asc) {
          name,
          description,
          types,
          _createdAt
        }`
      );

      const headers = ['Nombre', 'Descripción', 'Tipos', 'Fecha registro'];
      const rows = categories.map((c: Record<string, unknown>) => [
        c.name,
        c.description,
        Array.isArray(c.types) ? c.types.join('; ') : '',
        c._createdAt,
      ]);
      const csv = [headers.join(','), ...rows.map((r: unknown[]) => r.map(escapeCsv).join(','))].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="categorias-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return NextResponse.json({ message: 'Tipo de exportación no válido' }, { status: 400 });
  } catch (error) {
    console.error('Error exporting superadmin data:', error);
    return NextResponse.json(
      { success: false, message: 'Error al exportar datos' },
      { status: 500 }
    );
  }
}
