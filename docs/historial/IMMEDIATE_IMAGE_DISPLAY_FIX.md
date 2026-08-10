# Solución al Problema de Imágenes No Visibles Inmediatamente

## Problema Identificado

Después de crear un producto o servicio, las imágenes no aparecen inmediatamente en el dashboard y se muestra el error "Error loading image". Sin embargo, después de recargar la página, las imágenes sí aparecen correctamente.

## Causa Raíz

El problema se debía a una inconsistencia en la estructura de datos de las imágenes entre:

1. **Datos iniciales**: Obtenidos con consultas que expanden las imágenes usando `asset->{_id, url}`
2. **Datos de creación/actualización**: Devueltos por las APIs con imágenes en formato de referencia (`_ref`)

Cuando se creaba un producto, la API devolvía el documento con las imágenes en formato de referencia, pero el estado local esperaba imágenes expandidas con URLs directas.

## Solución Implementada

### 1. Modificación de la API de Productos (`src/app/api/products/route.ts`)

**Para creación (POST):**
```typescript
// Antes
const result = await client.create(docData);
return NextResponse.json({ success: true, data: result });

// Después
const result = await client.create(docData);
const createdProduct = await client.fetch(`
  *[_id == $id] {
    _id,
    _type,
    _rev,
    _createdAt,
    _updatedAt,
    name,
    description,
    category,
    price,
    status,
    sku,
    images[]{
      _type,
      asset->{
        _id,
        url
      }
    },
    company,
    createdBy,
    updatedBy
  }[0]
`, { id: result._id });

return NextResponse.json({ success: true, data: createdProduct });
```

**Para actualización (PUT):**
```typescript
// Antes
const result = await client.patch(id).set({...}).commit();
return NextResponse.json({ success: true, data: result });

// Después
const result = await client.patch(id).set({...}).commit();
const updatedProduct = await client.fetch(`
  *[_id == $id] {
    // ... misma consulta que arriba
  }[0]
`, { id });

return NextResponse.json({ success: true, data: updatedProduct });
```

### 2. Modificación de la API de Servicios (`src/app/api/services/route.ts`)

Aplicadas las mismas modificaciones que en productos, pero incluyendo los campos específicos de servicios (`duration`, `modality`, `availability`).

## Resultado

Ahora cuando se crea o actualiza un producto/servicio:

1. ✅ Las imágenes aparecen inmediatamente en el dashboard
2. ✅ No se muestran errores de carga de imágenes
3. ✅ La estructura de datos es consistente entre datos iniciales y nuevos
4. ✅ No es necesario recargar la página para ver las imágenes

## Archivos Modificados

- `src/app/api/products/route.ts` - Expansión de imágenes en respuestas de API
- `src/app/api/services/route.ts` - Expansión de imágenes en respuestas de API

## Notas Importantes

- Las consultas adicionales en las APIs agregan un pequeño overhead, pero garantizan consistencia de datos
- La estructura de imágenes ahora es uniforme en todo el proyecto
- El manejo de errores de carga de imágenes sigue funcionando como respaldo
