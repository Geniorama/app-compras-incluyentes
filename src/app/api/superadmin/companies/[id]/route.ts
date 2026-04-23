import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/sanity.client';
import { isSuperadmin } from '@/lib/superadmin';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!(await isSuperadmin(userId))) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
    }

    const { id } = await params;
    const client = getAuthenticatedClient();
    const company = await client.fetch(
      `*[_type == "company" && _id == $id][0]{
        _id,
        nameCompany,
        businessName,
        description,
        typeDocumentCompany,
        numDocumentCompany,
        ciiu,
        webSite,
        addressCompany,
        country,
        countries,
        department,
        city,
        companySize,
        sector,
        phone,
        logo,
        active,
        facebook,
        instagram,
        tiktok,
        pinterest,
        linkedin,
        xtwitter,
        peopleGroup,
        otherPeopleGroup,
        friendlyBizz,
        inclusionDEI,
        membership,
        annualRevenue,
        collaboratorsCount,
        _createdAt,
        _updatedAt
      }`,
      { id }
    );

    if (!company) {
      return NextResponse.json({ message: 'Empresa no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { company } });
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json(
      { success: false, message: 'Error al obtener empresa' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!(await isSuperadmin(userId))) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      nameCompany,
      businessName,
      description,
      typeDocumentCompany,
      numDocumentCompany,
      ciiu,
      webSite,
      addressCompany,
      country,
      countries,
      department,
      city,
      companySize,
      sector,
      phone,
      logo,
      active,
      facebook,
      instagram,
      tiktok,
      pinterest,
      linkedin,
      xtwitter,
      peopleGroup,
      otherPeopleGroup,
      friendlyBizz,
      inclusionDEI,
      membership,
      annualRevenue,
      collaboratorsCount,
    } = body;

    const patch: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (typeof active === 'boolean') patch.active = active;
    if (nameCompany !== undefined) patch.nameCompany = nameCompany;
    if (businessName !== undefined) patch.businessName = businessName;
    if (description !== undefined) patch.description = description;
    if (typeDocumentCompany !== undefined) patch.typeDocumentCompany = typeDocumentCompany;
    if (numDocumentCompany !== undefined) patch.numDocumentCompany = numDocumentCompany;
    if (ciiu !== undefined) patch.ciiu = ciiu;
    if (webSite !== undefined) patch.webSite = webSite;
    if (addressCompany !== undefined) patch.addressCompany = addressCompany;
    if (country !== undefined) patch.country = country;
    if (countries !== undefined) patch.countries = Array.isArray(countries) ? countries : [];
    if (department !== undefined) patch.department = department;
    if (city !== undefined) patch.city = city;
    if (companySize !== undefined) patch.companySize = companySize;
    if (sector !== undefined) patch.sector = sector;
    if (phone !== undefined) patch.phone = phone;
    if (logo !== undefined) patch.logo = logo;
    if (facebook !== undefined) patch.facebook = facebook;
    if (instagram !== undefined) patch.instagram = instagram;
    if (tiktok !== undefined) patch.tiktok = tiktok;
    if (pinterest !== undefined) patch.pinterest = pinterest;
    if (linkedin !== undefined) patch.linkedin = linkedin;
    if (xtwitter !== undefined) patch.xtwitter = xtwitter;
    if (peopleGroup !== undefined) patch.peopleGroup = Array.isArray(peopleGroup) ? peopleGroup : [];
    if (otherPeopleGroup !== undefined) patch.otherPeopleGroup = otherPeopleGroup;
    if (typeof friendlyBizz === 'boolean') patch.friendlyBizz = friendlyBizz;
    if (typeof inclusionDEI === 'boolean') patch.inclusionDEI = inclusionDEI;
    if (typeof membership === 'boolean') patch.membership = membership;
    if (annualRevenue !== undefined) patch.annualRevenue = Number(annualRevenue) || 0;
    if (collaboratorsCount !== undefined) patch.collaboratorsCount = Number(collaboratorsCount) || 0;

    const client = getAuthenticatedClient();
    await client.patch(id).set(patch).commit();

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error('Error updating company:', error);
    return NextResponse.json(
      { success: false, message: 'Error al actualizar empresa' },
      { status: 500 }
    );
  }
}
