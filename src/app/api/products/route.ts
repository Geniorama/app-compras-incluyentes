import { NextResponse, NextRequest } from 'next/server';
import { getAuthenticatedClient } from '@/lib/sanity.client';

export async function POST(request: NextRequest) {
  try {
    const client = getAuthenticatedClient();
    const { data, userId } = await request.json();

    // Obtener el ID del usuario en Sanity
    const sanityUser = await client.fetch(
      `*[_type == "user" && firebaseUid == $firebaseUid][0]{
        _id,
        company->{_id}
      }`,
      { firebaseUid: userId }
    );

    if (!sanityUser?._id) {
      return NextResponse.json(
        { success: false, error: 'No se encontró el usuario en Sanity' },
        { status: 404 }
      );
    }

    // Preparar los datos para Sanity
    const docData = {
      _type: 'product',
      ...data,
      company: {
        _type: "reference",
        _ref: sanityUser.company._id
      },
      createdBy: {
        _type: "reference",
        _ref: sanityUser._id
      },
      updatedBy: {
        _type: "reference",
        _ref: sanityUser._id
      }
    };

    // Crear el documento
    const result = await client.create(docData);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear el producto' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const client = getAuthenticatedClient();
    const { id, data, userId } = await request.json();

    // Obtener el ID del usuario en Sanity
    const sanityUser = await client.fetch(
      `*[_type == "user" && firebaseUid == $firebaseUid][0]{
        _id
      }`,
      { firebaseUid: userId }
    );

    if (!sanityUser?._id) {
      return NextResponse.json(
        { success: false, error: 'No se encontró el usuario en Sanity' },
        { status: 404 }
      );
    }

    // Actualizar el documento
    const result = await client
      .patch(id)
      .set({
        ...data,
        updatedBy: {
          _type: "reference",
          _ref: sanityUser._id
        }
      })
      .commit();

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar el producto' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const client = getAuthenticatedClient();
    const { id } = await request.json();

    await client.delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar el producto' },
      { status: 500 }
    );
  }
} 