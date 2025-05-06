import { NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/sanity.client'

export async function POST(request: Request) {
  try {
    const client = getAuthenticatedClient();
    const contentType = request.headers.get("content-type") || "";

    let buffer: Buffer | null = null;
    let fileType: string | undefined;

    if (contentType.includes("application/json")) {
      // Modo JSON (registro)
      const { file, fileType: ft } = await request.json();
      if (!file || !ft) {
        return NextResponse.json({ message: 'Se requiere el archivo y el tipo de archivo' }, { status: 400 });
      }
      if (!file.startsWith('data:image/')) {
        return NextResponse.json({ message: 'Formato de imagen inválido' }, { status: 400 });
      }
      const base64Data = file.replace(/^data:image\/\w+;base64,/, '');
      buffer = Buffer.from(base64Data, 'base64');
      fileType = ft;
    } else if (contentType.includes("multipart/form-data")) {
      // Modo FormData (dashboard)
      const formData = await request.formData();
      const file = formData.get("image");
      if (!file || !(file instanceof Blob)) {
        return NextResponse.json({ message: 'No se recibió archivo' }, { status: 400 });
      }
      buffer = Buffer.from(await file.arrayBuffer());
      fileType = file.type.split("/")[1];
    } else {
      return NextResponse.json({ message: "Formato no soportado" }, { status: 400 });
    }

    // Subir la imagen a Sanity
    const asset = await client.assets.upload('image', buffer, {
      filename: `image.${fileType}`,
      contentType: `image/${fileType}`,
    });

    return NextResponse.json({
      asset: {
        _type: 'reference',
        _ref: asset._id,
      },
    });
  } catch (error) {
    console.error('Error en el procesamiento de la solicitud:', error)
    return NextResponse.json(
      { message: 'Error al procesar la solicitud de imagen' },
      { status: 500 }
    )
  }
} 