import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/sanity.client';
import { v4 as uuidv4 } from 'uuid';

interface SurveyBody {
  experienceRating: number;
  helpedGetClients: string;
  helpedGetProjects: string;
  recommendationScore: number;
  additionalComments?: string;
}

export async function POST(request: Request) {
  try {
    const firebaseUid = request.headers.get('x-user-id');
    if (!firebaseUid) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const body = (await request.json()) as SurveyBody;
    const { experienceRating, helpedGetClients, helpedGetProjects, recommendationScore, additionalComments } = body;

    if (
      typeof experienceRating !== 'number' ||
      experienceRating < 1 ||
      experienceRating > 5 ||
      !helpedGetClients ||
      !helpedGetProjects ||
      typeof recommendationScore !== 'number' ||
      recommendationScore < 0 ||
      recommendationScore > 10
    ) {
      return NextResponse.json(
        { success: false, message: 'Datos inválidos. Verifica las respuestas.' },
        { status: 400 }
      );
    }

    const client = getAuthenticatedClient();

    const sanityUser = await client.fetch(
      `*[_type == "user" && firebaseUid == $uid][0]{ _id }`,
      { uid: firebaseUid }
    );

    if (!sanityUser?._id) {
      return NextResponse.json({ success: false, message: 'Usuario no encontrado' }, { status: 404 });
    }

    const doc = await client.create({
      _id: `survey-${uuidv4()}`,
      _type: 'platformSurveyResponse',
      user: { _type: 'reference', _ref: sanityUser._id },
      firebaseUid,
      experienceRating,
      helpedGetClients,
      helpedGetProjects,
      recommendationScore,
      additionalComments: additionalComments || '',
      submittedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, data: { id: doc._id } });
  } catch (error) {
    console.error('Error al guardar encuesta:', error);
    return NextResponse.json(
      { success: false, message: 'Error al guardar la encuesta' },
      { status: 500 }
    );
  }
}
