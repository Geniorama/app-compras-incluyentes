import { NextResponse } from 'next/server'
import { sanityClient } from '@/lib/sanity.client'

export async function POST(request: Request) {
  try {
    const { file, fileType } = await request.json()

    if (!file || !fileType) {
      return NextResponse.json(
        { message: 'Archivo y tipo son requeridos' },
        { status: 400 }
      )
    }

    // Convertir base64 a buffer
    const imageBuffer = Buffer.from(file.split(',')[1], 'base64')

    // Subir imagen a Sanity
    const asset = await sanityClient.assets.upload('image', imageBuffer, {
      filename: `${Date.now()}.${fileType}`,
    })

    return NextResponse.json({
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id,
      },
    })
  } catch (error) {
    console.error('Error al subir imagen:', error)
    return NextResponse.json(
      { message: 'Error al subir imagen' },
      { status: 500 }
    )
  }
} 