# Solución para Imágenes de Categorías

## Problema Identificado

Las imágenes de los iconos de las categorías no se mostraban en el catálogo debido a inconsistencias en las consultas de Sanity y la construcción manual de URLs.

## Causa Raíz

1. **Inconsistencia en consultas**: Algunas consultas usaban `_ref` y otras `url`
2. **Construcción manual de URLs**: La función `getCategoryImageUrl` construía URLs manualmente en lugar de usar las utilidades centralizadas
3. **Falta de manejo robusto**: No había manejo de errores para imágenes de categorías

## Solución Implementada

### 1. Corrección de Consultas de Categorías

**Archivo:** `src/lib/sanity.queries.ts`

- Corregidas todas las consultas para usar `url` consistentemente
- Aplicado a: `categories`, `productsByCompany`, `servicesByCompany`, `productsByCategory`, `servicesByCategory`, `searchProducts`, `searchServices`

```typescript
// ✅ Formato consistente para todas las consultas
image{
  asset->{
    _id,
    url  // Consistente en todas las consultas
  }
}
```

### 2. Actualización de Función de Categorías

**Archivo:** `src/views/Catalogo/CatalogoView.tsx`

- Reemplazada la construcción manual de URLs con la utilidad centralizada
- Agregada importación de `getSanityImageUrl`

```typescript
// ❌ Antes - Construcción manual
const getCategoryImageUrl = (cat: SanityCategoryDocument): string | null => {
  if (cat.image && cat.image.asset && cat.image.asset._ref) {
    return `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${cat.image.asset._ref
      .replace('image-', '')
      .replace('-jpg', '.jpg')
      .replace('-png', '.png')
      .replace('-webp', '.webp')}`;
  }
  return null;
};

// ✅ Después - Usando utilidad centralizada
const getCategoryImageUrl = (cat: SanityCategoryDocument): string | null => {
  if (cat.image && cat.image.asset) {
    return getSanityImageUrl(cat.image.asset);
  }
  return null;
};
```

### 3. Importación de Utilidades

**Archivo:** `src/views/Catalogo/CatalogoView.tsx`

```typescript
import { getFirstImageUrl, isValidImage, getSanityImageUrl } from '@/utils/sanityImage';
```

## Archivos Modificados

1. `src/lib/sanity.queries.ts` - Corrección de consultas para usar `url` consistentemente
2. `src/views/Catalogo/CatalogoView.tsx` - Actualización de función y importaciones

## Resultado

✅ **Imágenes de categorías funcionan correctamente** - Los iconos se muestran en el catálogo
✅ **Consistencia en consultas** - Todas las consultas usan el mismo formato
✅ **Código más limpio** - Uso de utilidades centralizadas
✅ **Manejo robusto** - Las utilidades manejan múltiples formatos de imagen

## Verificación

Las imágenes de categorías ahora deberían:
- ✅ Mostrarse correctamente en el grid de categorías del catálogo
- ✅ Tener fallback visual cuando no hay imagen disponible
- ✅ Manejar errores de carga de manera elegante
- ✅ Ser consistentes con el resto de imágenes de la aplicación

## Lección Aprendida

**Consistencia es clave**: Es importante usar el mismo formato de consulta en toda la aplicación y aprovechar las utilidades centralizadas para evitar duplicación de código y errores de construcción de URLs.
