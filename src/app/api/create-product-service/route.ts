import { NextResponse } from 'next/server'
import { sanityClient } from '@/lib/sanity.client'

export async function POST(request: Request) {
  try {
    const {
      type,
      name,
      description,
      category,
      price,
      status,
      images,
      sku,
      duration,
      modality,
      availability,
      userId
    } = await request.json()

    // Verificar que las imágenes estén presentes
    if (!images || images.length === 0) {
      return NextResponse.json(
        { message: 'Se requiere al menos una imagen' },
        { status: 400 }
      )
    }

    try {
      // Verificar si el usuario existe en Sanity usando firebaseUid
      const userExists = await sanityClient.fetch(
        `*[_type == "user" && firebaseUid == $userId][0]`,
        { userId }
      )

      if (!userExists) {
        console.error('Usuario no encontrado con firebaseUid:', userId)
        return NextResponse.json(
          { message: 'Usuario no encontrado' },
          { status: 400 }
        )
      }

      // Crear el documento en Sanity
      const result = await sanityClient.create({
        _type: type === 'product' ? 'product' : 'service',
        name,
        description,
        category,
        price: price ? parseFloat(price) : undefined,
        status,
        images,
        user: {
          _type: 'reference',
          _ref: userExists._id // Usar el ID interno de Sanity
        },
        // Campos específicos para productos
        ...(type === 'product' && { sku }),
        // Campos específicos para servicios
        ...(type === 'service' && {
          duration,
          modality,
          availability
        }),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      return NextResponse.json(
        { message: `${type === 'product' ? 'Producto' : 'Servicio'} creado exitosamente`, data: result },
        { status: 201 }
      )
    } catch (sanityError) {
      console.error('Error de Sanity:', sanityError)
      return NextResponse.json(
        { message: 'Error al crear el documento en Sanity: ' + (sanityError instanceof Error ? sanityError.message : 'Error desconocido') },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error en el procesamiento de la solicitud:', error)
    return NextResponse.json(
      { message: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
} 