/**
 * Utilidades para manejar imágenes de Sanity
 */

export interface SanityImageAsset {
  _id: string;
  _ref?: string;
  url?: string;
}

export interface SanityImage {
  _type: 'image';
  asset: SanityImageAsset;
  _key?: string;
}

/**
 * Construye la URL de una imagen de Sanity
 */
export const getSanityImageUrl = (asset: SanityImageAsset | string): string => {
  if (!asset) return '';
  
  // Si ya tiene URL, usarla directamente
  if (typeof asset === 'object' && asset.url) {
    return asset.url;
  }
  
  let assetRef: string;
  
  // Si es un string, usarlo directamente
  if (typeof asset === 'string') {
    assetRef = asset;
  } else {
    // Si es un objeto, usar _ref o _id
    assetRef = asset._ref || asset._id || '';
  }
  
  if (!assetRef) return '';
  
  // Construir URL desde el asset reference
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  
  if (!projectId || !dataset) {
    console.error('Sanity project ID or dataset not configured');
    return '';
  }
  
  // El formato de assetRef puede ser:
  // 1. "image-{id}-{width}x{height}-{format}" (nuevo formato)
  // 2. "image-{id}-{format}" (formato anterior)
  // 3. Solo el ID del asset
  
  // Si ya es solo un ID (sin prefijo "image-")
  if (!assetRef.startsWith('image-')) {
    return `https://cdn.sanity.io/images/${projectId}/${dataset}/${assetRef}`;
  }
  
  const parts = assetRef.split('-');
  
  // Formato: "image-{id}-{width}x{height}-{format}"
  if (parts.length >= 4) {
    const id = parts[1];
    const format = parts[parts.length - 1];
    return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}.${format}`;
  }
  
  // Formato: "image-{id}-{format}"
  if (parts.length >= 3) {
    const id = parts[1];
    const format = parts[2];
    return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}.${format}`;
  }
  
  // Fallback: remover prefijo "image-" y usar como está
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${assetRef.replace('image-', '')}`;
};

/**
 * Obtiene la URL de la primera imagen de un array de imágenes
 */
export const getFirstImageUrl = (images: SanityImage[] | undefined): string => {
  if (!images || images.length === 0) return '';
  
  const firstImage = images[0];
  if (!firstImage || !firstImage.asset) return '';
  
  return getSanityImageUrl(firstImage.asset);
};

/**
 * Verifica si una imagen es válida
 */
export const isValidImage = (image: SanityImage | undefined): boolean => {
  return !!(image && image.asset && (image.asset._ref || image.asset._id || image.asset.url));
};
