import { NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/sanity.client'

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let buffer: Buffer | null = null;
    let fileType: string | undefined;
    let fileName: string | undefined;

    if (contentType.includes("application/json")) {
      // Modo JSON (registro)
      const { file, fileType: ft, fileName: fn } = await request.json();
      if (!file || !ft) {
        return NextResponse.json({ message: 'Se requiere el archivo y el tipo de archivo' }, { status: 400 });
      }
      // Validar que sea un data URL de PDF (puede variar el formato del MIME)
      if (!file.startsWith('data:') || !file.includes('base64,')) {
        return NextResponse.json({ message: 'Formato de archivo inválido. Se espera un data URL en base64' }, { status: 400 });
      }
      // Extraer el base64 (puede ser data:application/pdf;base64, o data:application/octet-stream;base64, etc.)
      const base64Match = file.match(/^data:[^;]+;base64,(.+)$/);
      if (!base64Match) {
        return NextResponse.json({ message: 'Formato de archivo inválido. No se pudo extraer el base64' }, { status: 400 });
      }
      const base64Data = base64Match[1];
      buffer = Buffer.from(base64Data, 'base64');
      fileType = ft;
      fileName = fn || `document-${Date.now()}.pdf`;
    } else if (contentType.includes("multipart/form-data")) {
      // Modo FormData (dashboard)
      const formData = await request.formData();
      const file = formData.get("file");
      if (!file || !(file instanceof Blob)) {
        return NextResponse.json({ message: 'No se recibió archivo' }, { status: 400 });
      }
      
      // Validar tipo de archivo
      if (file.type !== 'application/pdf') {
        return NextResponse.json({ message: 'Solo se aceptan archivos PDF' }, { status: 400 });
      }
      
      // Validar tamaño del archivo (máximo 10MB para PDFs)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return NextResponse.json({ message: 'El archivo es demasiado grande. Máximo 10MB' }, { status: 413 });
      }
      
      buffer = Buffer.from(await file.arrayBuffer());
      fileType = 'pdf';
      fileName = file.name || `document-${Date.now()}.pdf`;
    } else {
      return NextResponse.json({ message: "Formato no soportado" }, { status: 400 });
    }

    // Subir archivo a Sanity
    const authenticatedClient = getAuthenticatedClient();
    const asset = await authenticatedClient.assets.upload('file', buffer, {
      filename: fileName,
      contentType: `application/pdf`,
      label: 'Company Document',
      title: fileName,
    });

    return NextResponse.json({
      asset: {
        _type: 'file',
        asset: {
          _type: 'reference',
          _ref: asset._id,
        },
      },
    });
  } catch (error) {
    console.error('Error en el procesamiento de la solicitud:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { message: `Error al procesar la solicitud de archivo: ${errorMessage}` },
      { status: 500 }
    )
  }
}

