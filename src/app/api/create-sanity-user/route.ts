import { NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/sanity.client'
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const client = getAuthenticatedClient();
    const {
      nameCompany,
      businessName,
      description,
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
      country,
      countries,
      membership,
      companySize,
      peopleGroup,
      otherPeopleGroup,
      infoVisibilityConsent,
      dataTreatmentConsent,
      friendlyBizz,
      inclusionDEI,
      annualRevenue,
      collaboratorsCount,
      chamberOfCommerce,
      taxIdentificationDocument,
      publicProfile,
      userCountry,
      userDepartment,
      userCity,
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

    const companyCountries = Array.isArray(countries) ? countries : (country ? [country] : []);

    // Crear empresa como publicada y con active: false
    const companyDoc = await client.create({
      _id: companyId,
      _type: 'company',
      nameCompany,
      businessName,
      description,
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
      department: department || '',
      city: city || '',
      country: country || (companyCountries[0] || ''),
      countries: companyCountries,
      companySize,
      peopleGroup,
      otherPeopleGroup,
      friendlyBizz: friendlyBizz || false,
      inclusionDEI: inclusionDEI === 'yes' ? true : false,
      membership: membership === 'yes' ? true : false,
      annualRevenue: annualRevenue || 0,
      collaboratorsCount: collaboratorsCount || 0,
      chamberOfCommerce,
      taxIdentificationDocument,
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
      country: userCountry || '',
      department: userDepartment || '',
      city: userCity || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      infoVisibilityConsent: infoVisibilityConsent || false,
      dataTreatmentConsent,
      // Si companySize no es "grande", publicProfile debe ser true obligatoriamente
      publicProfile: companySize !== "grande" ? true : (publicProfile || false),
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