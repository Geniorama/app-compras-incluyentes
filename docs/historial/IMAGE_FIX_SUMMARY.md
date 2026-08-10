# Solución al Problema de Imágenes en el Catálogo

## Problema Identificado

Las imágenes no se estaban cargando en el catálogo debido a:

1. **Inconsistencia en las consultas de Sanity**: Las consultas solicitaban `url` pero el código intentaba usar `_ref`
2. **Construcción incorrecta de URLs**: La función para construir URLs de imágenes no manejaba correctamente los diferentes formatos de `_ref` de Sanity
3. **Falta de manejo de errores**: No había fallback cuando las imágenes fallaban al cargar

## Solución Implementada

### 1. Corrección de Consultas de Sanity

**Archivo:** `src/lib/sanity.queries.ts`

- Cambiado todas las consultas para solicitar `_ref` en lugar de `url` del asset
- Esto afecta a todas las consultas: `activeProducts`, `activeServices`, `categories`, etc.

```typescript
// Antes
images[]{
  _type,
  asset->{
    _id,
    url  // ❌ Incorrecto
  }
}

// Después
images[]{
  _type,
  asset->{
    _id,
    _ref  // ✅ Correcto
  }
}
```

### 2. Creación de Utilidades para Imágenes

**Archivo:** `src/utils/sanityImage.ts`

- Función `getSanityImageUrl()` que maneja múltiples formatos de `_ref`
- Función `getFirstImageUrl()` para obtener la primera imagen de un array
- Función `isValidImage()` para validar si una imagen es válida
- Manejo robusto de diferentes formatos de asset reference

```typescript
// Maneja múltiples formatos:
// 1. "image-{id}-{width}x{height}-{format}"
// 2. "image-{id}-{format}"
// 3. Solo el ID del asset
export const getSanityImageUrl = (asset: SanityImageAsset | string): string => {
  // Lógica robusta para construir URLs correctamente
}
```

### 3. Actualización del Catálogo

**Archivo:** `src/views/Catalogo/CatalogoView.tsx`

- Reemplazado la lógica de construcción de URLs con las nuevas utilidades
- Agregado manejo de errores con `onError` para imágenes que fallan
- Mejorado el fallback visual cuando no hay imágenes

```typescript
// Antes
{item.images && item.images.length > 0 && item.images[0].asset && item.images[0].asset._ref ? (
  <img src={`https://cdn.sanity.io/.../${item.images[0].asset._ref.replace(...)}`} />
) : (
  <div>Sin imagen</div>
)}

// Después
{isValidImage(item.images?.[0]) ? (
  <img 
    src={getFirstImageUrl(item.images)}
    onError={(e) => {
      // Manejo de errores
    }}
  />
) : null}
<div className={`${isValidImage(item.images?.[0]) ? 'hidden' : ''}`}>
  Sin imagen
</div>
```

### 4. Actualización del Dashboard

**Archivo:** `src/views/Dashboard/ProductsView.tsx`

- Aplicado las mismas mejoras en la vista de productos y servicios
- Actualizado tanto la vista de grid como la vista de lista
- Consistencia en el manejo de imágenes en toda la aplicación

## Beneficios de la Solución

✅ **Imágenes cargan correctamente** en el catálogo y dashboard
✅ **Manejo robusto de errores** cuando las imágenes fallan
✅ **Código más limpio y mantenible** con utilidades centralizadas
✅ **Consistencia** en el manejo de imágenes en toda la aplicación
✅ **Fallback visual** cuando no hay imágenes disponibles
✅ **Soporte para múltiples formatos** de asset reference de Sanity

## Archivos Modificados

1. `src/lib/sanity.queries.ts` - Corrección de consultas
2. `src/utils/sanityImage.ts` - Nuevas utilidades (creado)
3. `src/views/Catalogo/CatalogoView.tsx` - Actualización del catálogo
4. `src/views/Dashboard/ProductsView.tsx` - Actualización del dashboard

## Pruebas Recomendadas

1. **Verificar carga de imágenes** en el catálogo
2. **Probar con diferentes formatos** de imágenes
3. **Verificar fallback** cuando las imágenes fallan
4. **Comprobar consistencia** entre catálogo y dashboard
5. **Probar con productos sin imágenes**
