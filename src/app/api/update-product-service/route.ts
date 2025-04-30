import { NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/sanity.client'

export async function POST(request: Request) {
  const client = getAuthenticatedClient();

  try {
    const body = await request.json()
    const {
      type,
      id,
      name,
      description,
      category,
      price,
      status,
      images,
      userId,
      // Campos específicos
      sku,
      duration,
      modality,
      availability,
    } = body

    if (!id) {
      return NextResponse.json(
        { message: 'ID del documento no proporcionado' },
        { status: 400 }
      )
    }

    // Verificar que el documento existe y pertenece al usuario
    const existingDoc = await client.fetch(
      `*[_type == $type && _id == $id && user._ref in *[_type == "user" && firebaseUid == $userId]._id][0]`,
      { type, id, userId }
    )

    if (!existingDoc) {
      return NextResponse.json(
        { message: 'Documento no encontrado o no tienes permisos para editarlo' },
        { status: 404 }
      )
    }

    // Construir el documento base
    const doc = {
      name,
      description,
      category,
      price: price ? Number(price) : undefined,
      status,
      images,
      updatedAt: new Date().toISOString()
    }

    // Agregar campos específicos según el tipo
    if (type === 'product') {
      Object.assign(doc, { sku })
    } else {
      Object.assign(doc, { duration, modality, availability })
    }

    try {
      // Actualizar el documento en Sanity
      const result = await client
        .patch(id)
        .set(doc)
        .commit()

      return NextResponse.json({ data: result })
    } catch (sanityError) {
      console.error('Error de Sanity:', sanityError)
      return NextResponse.json(
        { message: 'Error al actualizar el documento en Sanity' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error al actualizar:', error)
    return NextResponse.json(
      { message: 'Error al procesar la solicitud de actualización' },
      { status: 500 }
    )
  }
}
