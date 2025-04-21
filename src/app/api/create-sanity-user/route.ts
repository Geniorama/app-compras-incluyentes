import { NextResponse } from 'next/server'
import { sanityClient } from '@/lib/sanity.client'

export async function POST(request: Request) {
  try {
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

    // Verificar que las imágenes estén presentes
    if (!logo || !photo) {
      return NextResponse.json(
        { message: 'Logo y foto son requeridos' },
        { status: 400 }
      )
    }

    const result = await sanityClient.create({
      _type: 'user',
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    return NextResponse.json(
      { message: 'Usuario creado exitosamente', user: result },
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