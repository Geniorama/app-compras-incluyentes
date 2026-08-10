# Solución al Error de Carga de Imágenes

## Problema Identificado

El error "Error loading image" en la línea 537 de `ProductsView.tsx` se debía a inconsistencias en los tipos de `SanityImage` entre diferentes archivos del proyecto.

## Causa Raíz

1. **Conflicto de tipos**: Había dos definiciones diferentes de `SanityImage`:
   - En `src/types/sanity.ts`: Solo con `_ref` y `_type`
   - En `src/utils/sanityImage.ts`: Con `_id`, `_ref`, `_type` y `url`

2. **Importaciones conflictivas**: En `ProductsView.tsx` se importaban tipos de ambos lugares, causando conflictos.

3. **Incompatibilidad de tipos**: Las funciones `getFirstImageUrl` e `isValidImage` esperaban un tipo de `SanityImage` que no coincidía con el definido en `types/sanity.ts`.

## Solución Implementada

### 1. Unificación de Tipos
Actualicé la interfaz `SanityImage` en `src/types/sanity.ts` para incluir todos los campos necesarios:

```typescript
export interface SanityImage {
    _type: 'image';
    asset: {
        _ref: string;
        _type: 'reference';
        _id?: string;        // Agregado
        url?: string;        // Agregado
    };
}
```

### 2. Actualización de SanityImageAsset
Agregué el campo `_type` a la interfaz `SanityImageAsset` en `src/utils/sanityImage.ts`:

```typescript
export interface SanityImageAsset {
  _id: string;
  _ref?: string;
  _type?: 'reference';      // Agregado
  url?: string;
}
```

### 3. Limpieza de Importaciones
Eliminé la importación conflictiva en `ProductsView.tsx`:

```typescript
// Antes
import {
  getFirstImageUrl,
  isValidImage,
  getSanityImageUrl,
  type SanityImage as SanityImageUtils,  // Eliminado
} from "@/utils/sanityImage";

// Después
import {
  getFirstImageUrl,
  isValidImage,
  getSanityImageUrl,
} from "@/utils/sanityImage";
```

## Verificación

Después de aplicar estos cambios:

1. Las imágenes deberían cargar correctamente en el dashboard
2. No deberían aparecer errores de tipos en la consola
3. El fallback "Sin imagen" debería funcionar correctamente cuando las imágenes no se pueden cargar

## Archivos Modificados

- `src/types/sanity.ts` - Actualización de la interfaz SanityImage
- `src/utils/sanityImage.ts` - Actualización de SanityImageAsset
- `src/views/Dashboard/ProductsView.tsx` - Limpieza de importaciones

## Notas Importantes

- Las funciones de utilidad de imágenes ahora son compatibles con los tipos de Sanity
- El manejo de errores de carga de imágenes sigue funcionando correctamente
- Los tipos están unificados en todo el proyecto
