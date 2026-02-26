import { NextRequest, NextResponse } from 'next/server';
import { sanityClient, getFreshClient } from '@/lib/sanity.client';
import { getAuthenticatedClient } from '@/lib/sanity.client';

const OPPORTUNITY_FIELDS = `
  _id,
  title,
  cover,
  startDate,
  maxApplicationDate,
  description,
  requirements,
  contractValue,
  status,
  company->{ _id, nameCompany, logo },
  applications[]->{ _id, nameCompany }
`;

function escapeGROQ(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const companyId = searchParams.get('companyId');
  const search = searchParams.get('search');
  const minValue = searchParams.get('minValue');
  const maxValue = searchParams.get('maxValue');
  const startDateFrom = searchParams.get('startDateFrom');
  const startDateTo = searchParams.get('startDateTo');
  const maxDateFrom = searchParams.get('maxDateFrom');
  const maxDateTo = searchParams.get('maxDateTo');
  const includeCompanies = searchParams.get('includeCompanies') === '1';
  const limit = searchParams.get('limit');
  const offset = searchParams.get('offset');
  const fresh = searchParams.get('fresh') === '1';

  try {
    const filters: string[] = ['_type == "opportunity"'];
    if (status) filters.push(`status == "${status}"`);
    if (companyId) filters.push(`company._ref == "${companyId}"`);
    if (search && search.trim()) {
      const term = escapeGROQ(search.trim());
      filters.push(`(title match "*${term}*" || (defined(description) && description match "*${term}*"))`);
    }
    if (minValue) {
      const num = parseInt(minValue, 10);
      if (!isNaN(num)) filters.push(`contractValue >= ${num}`);
    }
    if (maxValue) {
      const num = parseInt(maxValue, 10);
      if (!isNaN(num)) filters.push(`contractValue <= ${num}`);
    }
    if (startDateFrom) filters.push(`startDate >= "${startDateFrom}"`);
    if (startDateTo) filters.push(`startDate <= "${startDateTo}"`);
    if (maxDateFrom) filters.push(`maxApplicationDate >= "${maxDateFrom}"`);
    if (maxDateTo) filters.push(`maxApplicationDate <= "${maxDateTo}"`);

    const filter = filters.join(' && ');
    const start = parseInt(offset || '0');
    const end = limit ? start + parseInt(limit) : 1000;
    const query = `*[${filter}] | order(startDate desc) [${start}...${end}] {${OPPORTUNITY_FIELDS}}`;

    const client = fresh ? getFreshClient() : sanityClient;
    const opportunities = await client.fetch(query);
    const total = await client.fetch(`count(*[${filter}])`);

    let companies: Array<{ _id: string; nameCompany: string; logo?: { asset?: { _ref: string } } }> = [];
    if (includeCompanies) {
      const companiesFilter = status ? `_type == "opportunity" && status == "${status}"` : '_type == "opportunity"';
      const companiesQuery = `*[${companiesFilter}] {
        company->{ _id, nameCompany, logo }
      } | order(company->nameCompany asc)`;
      const raw = await client.fetch(companiesQuery) as Array<{ company?: { _id: string; nameCompany: string; logo?: { asset?: { _ref: string } } } }>;
      const seen = new Set<string>();
      companies = (raw || [])
        .filter((r) => {
          const id = r?.company?._id;
          if (!id || seen.has(id)) return false;
          seen.add(id);
          return true;
        })
        .map((r) => r.company!);
    }

    return NextResponse.json({ opportunities, total, ...(includeCompanies && { companies }) }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener oportunidades:', error);
    return NextResponse.json({ message: 'Error al obtener oportunidades' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const client = getAuthenticatedClient();
  const body = await req.json();
  const userId = body.senderId || req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
  }

  try {
    const { title, cover, startDate, maxApplicationDate, description, requirements, contractValue, status } = body;

    if (!title || !startDate || !maxApplicationDate || !description) {
      return NextResponse.json({ message: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const userDoc = await client.fetch(
      `*[_type == "user" && firebaseUid == $userId][0]{ _id, company->{ _id, nameCompany, companySize } }`,
      { userId }
    );
    if (!userDoc?.company?._id) {
      return NextResponse.json({ message: 'Usuario sin empresa asociada' }, { status: 400 });
    }
    if (userDoc.company.companySize !== 'grande') {
      return NextResponse.json({ message: 'Solo empresas grandes pueden publicar oportunidades' }, { status: 403 });
    }

    const now = new Date().toISOString();
    const doc = await client.create({
      _type: 'opportunity',
      title,
      cover: cover || undefined,
      startDate,
      maxApplicationDate,
      description,
      requirements: requirements || undefined,
      contractValue: contractValue ? Number(contractValue) : undefined,
      status: status || 'draft',
      company: { _type: 'reference', _ref: userDoc.company._id },
      applications: [],
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ message: 'Oportunidad creada', opportunity: doc }, { status: 201 });
  } catch (error) {
    console.error('Error al crear oportunidad:', error);
    return NextResponse.json({ message: 'Error al crear oportunidad' }, { status: 500 });
  }
}
