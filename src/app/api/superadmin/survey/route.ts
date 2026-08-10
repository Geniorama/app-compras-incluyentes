import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/sanity.client';
import { isSuperadmin } from '@/lib/superadmin';

const VALID_LIMITS = [20, 50, 100];

interface AggregationRow {
  experienceRating?: number;
  helpedGetClients?: string;
  helpedGetProjects?: string;
  recommendationScore?: number;
  additionalComments?: string;
}

const CHOICES = ['si', 'no', 'en-parte'] as const;
type Choice = (typeof CHOICES)[number];

const countChoices = (rows: AggregationRow[], field: 'helpedGetClients' | 'helpedGetProjects') => {
  const counts: Record<Choice, number> = { si: 0, no: 0, 'en-parte': 0 };
  for (const row of rows) {
    const value = row[field];
    if (value && (CHOICES as readonly string[]).includes(value)) counts[value as Choice] += 1;
  }
  return counts;
};

const buildDistribution = (rows: AggregationRow[], field: 'experienceRating' | 'recommendationScore', min: number, max: number) => {
  const distribution = Array.from({ length: max - min + 1 }, (_, i) => ({ value: min + i, count: 0 }));
  for (const row of rows) {
    const value = row[field];
    if (typeof value === 'number' && value >= min && value <= max) {
      distribution[value - min].count += 1;
    }
  }
  return distribution;
};

const average = (values: number[]) =>
  values.length ? Number((values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(2)) : 0;

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
    const start = (page - 1) * limit;
    const end = start + limit;

    const client = getAuthenticatedClient();

    const baseFilter = `_type == "platformSurveyResponse" && !(_id in path("drafts.**"))`;

    const [allRows, responses, total] = await Promise.all([
      // Todas las respuestas en crudo: el volumen es bajo y agregar en JS evita
      // varias consultas de conteo separadas
      client.fetch<AggregationRow[]>(
        `*[${baseFilter}]{ experienceRating, helpedGetClients, helpedGetProjects, recommendationScore, additionalComments }`
      ),
      client.fetch(
        `*[${baseFilter}] | order(coalesce(submittedAt, _createdAt) desc) [${start}...${end}] {
          _id,
          experienceRating,
          helpedGetClients,
          helpedGetProjects,
          recommendationScore,
          additionalComments,
          submittedAt,
          _createdAt,
          user->{
            _id,
            firstName,
            lastName,
            email,
            company->{ _id, nameCompany }
          }
        }`
      ),
      client.fetch<number>(`count(*[${baseFilter}])`),
    ]);

    const experienceValues = allRows
      .map((r) => r.experienceRating)
      .filter((v): v is number => typeof v === 'number');
    const recommendationValues = allRows
      .map((r) => r.recommendationScore)
      .filter((v): v is number => typeof v === 'number');

    // NPS estándar: promotores (9-10) menos detractores (0-6) sobre el total
    const promoters = recommendationValues.filter((v) => v >= 9).length;
    const passives = recommendationValues.filter((v) => v >= 7 && v <= 8).length;
    const detractors = recommendationValues.filter((v) => v <= 6).length;
    const npsScore = recommendationValues.length
      ? Math.round(((promoters - detractors) / recommendationValues.length) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total: allRows.length,
          avgExperience: average(experienceValues),
          experienceDistribution: buildDistribution(allRows, 'experienceRating', 1, 5),
          helpedGetClients: countChoices(allRows, 'helpedGetClients'),
          helpedGetProjects: countChoices(allRows, 'helpedGetProjects'),
          avgRecommendation: average(recommendationValues),
          recommendationDistribution: buildDistribution(allRows, 'recommendationScore', 0, 10),
          promoters,
          passives,
          detractors,
          npsScore,
          withComments: allRows.filter((r) => r.additionalComments?.trim()).length,
        },
        responses,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching survey responses:', error);
    return NextResponse.json(
      { success: false, message: 'Error al obtener las respuestas del cuestionario' },
      { status: 500 }
    );
  }
}
