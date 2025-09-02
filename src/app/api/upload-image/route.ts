import { NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/sanity.client'

// Función para comprimir imagen
async function compressImage(buffer: Buffer): Promise<Buffer> {
  // Para simplificar, retornamos el buffer original
  // En producción, aquí se implementaría compresión real con sharp o similar
  return buffer;
}

export async function POST(request: Request) {
  try {
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
      
      // Validar tamaño del archivo (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return NextResponse.json({ message: 'El archivo es demasiado grande. Máximo 5MB' }, { status: 413 });
      }
      
      buffer = Buffer.from(await file.arrayBuffer());
      fileType = file.type.split("/")[1];
      
      // Comprimir imagen si es necesario
      buffer = await compressImage(buffer);
    } else {
      return NextResponse.json({ message: "Formato no soportado" }, { status: 400 });
    }

    // Optimizar la subida de imagen con configuración mejorada
    const authenticatedClient = getAuthenticatedClient();
    const asset = await authenticatedClient.assets.upload('image', buffer, {
      filename: `image-${Date.now()}.${fileType}`,
      contentType: `image/${fileType}`,
      // Configuraciones adicionales para mejor rendimiento
      label: 'Product/Service Image',
      title: `Image uploaded at ${new Date().toISOString()}`,
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