// Este archivo se moverá a /src/app/perfil/actualizar/route.ts
import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/sanity.client';
import type { 
  UserData, 
  CompanyData, 
  SanityUserDocument,
  SanityCompanyDocument,
  ApiResponse 
} from '@/types';

const client = getAuthenticatedClient();

interface UpdateResult {
  user?: SanityUserDocument;
  company?: SanityCompanyDocument;
}

export async function POST(request: Request) {
  try {
    const { userId, userData, companyData } = await request.json() as {
      userId: string;
      userData?: Partial<UserData>;
      companyData?: Partial<CompanyData>;
    };

    if (!userId || (!userData && !companyData)) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos requeridos' } as ApiResponse,
        { status: 400 }
      );
    }

    // Verificar que existe el documento del usuario y obtener información completa
    const userDoc = await client.fetch(
      `*[_type == "user" && firebaseUid == $uid][0]{
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
          logo,
          facebook,
          instagram,
          tiktok,
          pinterest,
          linkedin,
          xtwitter
        }
      }`,
      { uid: userId }
    );

    if (!userDoc) {
      return NextResponse.json(
        { success: false, error: 'No se encontró el documento del usuario' } as ApiResponse,
        { status: 404 }
      );
    }

    const result: UpdateResult = {};

    // Actualizar datos del usuario si se proporcionaron
    if (userData) {
      const userResult = await client
        .patch(userDoc._id)
        .set(userData)
        .commit() as SanityUserDocument;
      
      result.user = userResult;
    }

    // Actualizar datos de la empresa si se proporcionaron
    if (companyData && userDoc.company?._id) {
      const companyResult = await client
        .patch(userDoc.company._id)
        .set(companyData)
        .commit() as SanityCompanyDocument;
      
      result.company = companyResult;
    }

    // Obtener la información actualizada después de los cambios
    const updatedDoc = await client.fetch(
      `*[_type == "user" && firebaseUid == $uid][0]{
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
          logo,
          facebook,
          instagram,
          tiktok,
          pinterest,
          linkedin,
          xtwitter
        }
      }`,
      { uid: userId }
    );

    return NextResponse.json({ 
      success: true, 
      data: {
        user: updatedDoc,
        company: updatedDoc.company
      } 
    } as ApiResponse);
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar el perfil' } as ApiResponse,
      { status: 500 }
    );
  }
} 