import { NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/sanity.client'
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const client = getAuthenticatedClient();
    const {
      nameCompany,
      businessName,
      typeDocumentCompany,
      numDocumentCompany,
      ciiu,
      webSite,
      addressCompany,
      firstName,
      lastName,
      email,
      phone,
      typeDocument,
      numDocument,
      pronoun,
      position,
      facebook,
      instagram,
      tiktok,
      pinterest,
      linkedin,
      xtwitter,
      firebaseUid,
      logo,
      photo
    } = await request.json()

    if (!logo || !photo) {
      return NextResponse.json(
        { message: 'Logo y foto son requeridos' },
        { status: 400 }
      )
    }

    // Generar IDs de borrador
    const companyDraftId = `drafts.${uuidv4()}`;
    const userDraftId = `drafts.${uuidv4()}`;

    // Crear empresa como borrador
    const companyDoc = await client.create({
      _id: companyDraftId,
      _type: 'company',
      nameCompany,
      businessName,
      typeDocumentCompany,
      numDocumentCompany,
      ciiu,
      webSite,
      addressCompany,
      logo,
      facebook,
      instagram,
      tiktok,
      pinterest,
      linkedin,
      xtwitter,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    // Crear usuario como borrador y referencia a la empresa borrador
    const userDoc = await client.create({
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
      firebaseUid,
      photo,
      company: {
        _type: 'reference',
        _ref: companyDraftId
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    return NextResponse.json(
      { 
        message: 'Usuario creado exitosamente', 
        user: userDoc,
        company: companyDoc 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Error al crear el usuario' },
      { status: 500 }
    )
  }
} 