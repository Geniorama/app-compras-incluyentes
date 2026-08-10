import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/sanity.client';
import { isSuperadmin } from '@/lib/superadmin';

function escapeCsv(value: unknown): string {
  if (value == null) return '';
  let str = String(value);
  // Neutralizar fórmulas: Excel y Sheets ejecutan las celdas que empiezan por
  // estos caracteres, y aquí entra texto escrito por los usuarios
  if (/^[=+\-@\t\r]/.test(str)) str = `'${str}`;
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsv(headers: string[], rows: unknown[][]): string {
  return [headers.join(','), ...rows.map((r) => r.map(escapeCsv).join(','))].join('\n');
}

function csvResponse(filenamePrefix: string, csv: string): NextResponse {
  // El BOM hace que Excel abra el archivo como UTF-8 y respete las tildes
  return new NextResponse(`\uFEFF${csv}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

const CHOICE_LABELS: Record<string, string> = {
  si: 'Sí',
  no: 'No',
  'en-parte': 'En parte',
};

function npsCategory(score: unknown): string {
  if (typeof score !== 'number') return '';
  if (score >= 9) return 'Promotor';
  if (score >= 7) return 'Pasivo';
  return 'Detractor';
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
      return csvResponse('usuarios', buildCsv(headers, rows));
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
      return csvResponse('empresas', buildCsv(headers, rows));
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
      return csvResponse('categorias', buildCsv(headers, rows));
    }

    if (type === 'survey') {
      const responses = await client.fetch(
        `*[_type == "platformSurveyResponse" && !(_id in path("drafts.**"))] | order(coalesce(submittedAt, _createdAt) desc) {
          experienceRating,
          helpedGetClients,
          helpedGetProjects,
          recommendationScore,
          additionalComments,
          submittedAt,
          _createdAt,
          "nombre": user->firstName,
          "apellido": user->lastName,
          "email": user->email,
          "empresa": user->company->nameCompany
        }`
      );

      const headers = [
        'Nombre',
        'Apellido',
        'Email',
        'Empresa',
        'Experiencia (1-5)',
        '¿Ayudó a conseguir clientes?',
        '¿Ayudó a conseguir proyectos?',
        'Recomendación (0-10)',
        'Categoría NPS',
        'Comentarios',
        'Fecha de envío',
      ];
      const rows = responses.map((r: Record<string, unknown>) => [
        r.nombre,
        r.apellido,
        r.email,
        r.empresa,
        r.experienceRating,
        CHOICE_LABELS[String(r.helpedGetClients)] ?? '',
        CHOICE_LABELS[String(r.helpedGetProjects)] ?? '',
        r.recommendationScore,
        npsCategory(r.recommendationScore),
        r.additionalComments,
        r.submittedAt || r._createdAt,
      ]);

      return csvResponse('cuestionario', buildCsv(headers, rows));
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
