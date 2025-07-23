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
      photo,
      department,
      city,
      membership,
      companySize,
      peopleGroup,
      otherPeopleGroup,
      infoVisibilityConsent,
      dataTreatmentConsent,
    } = await request.json()

    if (!logo || !photo) {
      return NextResponse.json(
        { message: 'Logo y foto son requeridos' },
        { status: 400 }
      )
    }

    // Generar ID normal para la empresa y el usuario (ambos publicados)
    const companyId = uuidv4();
    const userId = uuidv4();

    // Crear empresa como publicada y con active: false
    const companyDoc = await client.create({
      _id: companyId,
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
      department,
      city,
      companySize,
      peopleGroup,
      otherPeopleGroup,
      active: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    // Crear usuario como publicado y referencia a la empresa publicada
    const userDoc = await client.create({
      _id: userId,
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
      role: 'admin',
      company: {
        _type: 'reference',
        _ref: companyId
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      membership: membership === 'yes' ? true : false,
      infoVisibilityConsent: infoVisibilityConsent || false,
      dataTreatmentConsent,
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