import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/sanity.client';

export async function GET(request: Request) {
  try {
    // Obtener el userId de los parámetros de la URL
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Se requiere el ID del usuario'
      });
    }

    const client = getAuthenticatedClient();

    // Obtener el documento del usuario con su información de empresa
    const userDoc = await client.fetch(
      `*[_type == "user" && firebaseUid == $userId][0]{
        _id,
        _type,
        _rev,
        _createdAt,
        _updatedAt,
        firstName,
        lastName,
        email,
        phone,
        pronoun,
        position,
        typeDocument,
        numDocument,
        photo,
        role,
        company->{
          _id,
          _type,
          _rev,
          _createdAt,
          _updatedAt,
          nameCompany,
          businessName,
          typeDocumentCompany,
          numDocumentCompany,
          ciiu,
          webSite,
          addressCompany,
          department,
          city,
          companySize,
          peopleGroup,
          otherPeopleGroup,
          friendlyBizz,
          membership,
          annualRevenue,
          logo,
          facebook,
          instagram,
          tiktok,
          pinterest,
          linkedin,
          xtwitter
        }
      }`,
      { userId }
    );

    if (!userDoc) {
      return NextResponse.json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    console.log('Profile API - Full userDoc:', JSON.stringify(userDoc, null, 2));
    console.log('Profile API - Company data:', JSON.stringify(userDoc.company, null, 2));
    console.log('Profile API - annualRevenue from DB:', userDoc.company?.annualRevenue, 'type:', typeof userDoc.company?.annualRevenue);

    return NextResponse.json({
      success: true,
      data: {
        user: userDoc,
        company: userDoc.company
      }
    });

  } catch (error) {
    console.error('Error al obtener el perfil:', error);
    return NextResponse.json({
      success: false,
      error: 'Error al obtener el perfil'
    });
  }
} 