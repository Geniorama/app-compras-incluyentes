import { NextResponse } from 'next/server'
import { sanityClient } from '@/lib/sanity.client'

export async function POST(request: Request) {
  try {
    const { file, fileType } = await request.json()

    if (!file || !fileType) {
      return NextResponse.json(
        { message: 'Se requiere el archivo y el tipo de archivo' },
        { status: 400 }
      )
    }

    // Validar el formato base64
    if (!file.startsWith('data:image/')) {
      return NextResponse.json(
        { message: 'Formato de imagen inválido' },
        { status: 400 }
      )
    }

    // Remover el prefijo del base64
    const base64Data = file.replace(/^data:image\/\w+;base64,/, '')
    
    try {
      const buffer = Buffer.from(base64Data, 'base64')

      // Subir la imagen a Sanity
      const asset = await sanityClient.assets.upload('image', buffer, {
        filename: `image.${fileType}`,
        contentType: `image/${fileType}`,
      })

      // Retornar el objeto de imagen en el formato que Sanity espera
      return NextResponse.json({
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: asset._id,
        },
      })
    } catch (uploadError) {
      console.error('Error al subir a Sanity:', uploadError)
      return NextResponse.json(
        { message: 'Error al subir la imagen a Sanity: ' + (uploadError instanceof Error ? uploadError.message : 'Error desconocido') },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error en el procesamiento de la solicitud:', error)
    return NextResponse.json(
      { message: 'Error al procesar la solicitud de imagen' },
      { status: 500 }
    )
  }
} 