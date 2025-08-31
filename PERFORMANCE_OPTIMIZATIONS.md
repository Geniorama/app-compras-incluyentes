# Optimizaciones de Rendimiento - Catálogo de Productos y Servicios

## Problemas Identificados

1. **CDN deshabilitado** - `useCdn: false` causaba que todas las consultas fueran directas a Sanity
2. **Procesamiento secuencial de imágenes** - Las imágenes se procesaban una por una
3. **Falta de caché** - No había estrategia de caché implementada
4. **Consultas innecesarias** - Se hacían múltiples consultas para obtener datos relacionados
5. **Falta de optimización en consultas** - Las consultas no estaban optimizadas para el rendimiento

## Optimizaciones Implementadas

### 1. Configuración de Cliente Sanity Optimizada

**Archivo:** `src/lib/sanity.client.ts`

- **Habilitado CDN** para consultas de lectura (`useCdn: true`)
- **Mantenido CDN deshabilitado** para operaciones de escritura
- **Agregado cliente fresco** para casos que requieren datos actualizados
- **Configurado perspectiva** para solo datos publicados

```typescript
// Cliente público para lectura con CDN habilitado
export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2023-05-03',
  useCdn: true, // Habilitamos el CDN para mejor rendimiento
  perspective: 'published', // Solo datos publicados
});
```

### 2. Consultas Optimizadas

**Archivo:** `src/lib/sanity.queries.ts`

- **Consultas predefinidas** para evitar repetición
- **Optimización de campos** solicitados
- **Ordenamiento eficiente** por fecha de creación
- **Consultas específicas** para diferentes casos de uso

```typescript
export const sanityQueries = {
  activeProducts: `*[_type == "product" && status == "active"] | order(_createdAt desc) {
    _id, name, description, price, status, sku,
    images[]{ _type, asset->{ _id, url } },
    category[]->{ _id, name },
    company->{ _id, nameCompany }
  }`,
  // ... más consultas optimizadas
};
```

### 3. Procesamiento Optimizado de Imágenes

**Archivo:** `src/views/Dashboard/ProductsView.tsx`

- **Separación de imágenes nuevas y existentes**
- **Procesamiento en paralelo** de imágenes nuevas
- **Evita reprocesamiento** de imágenes existentes
- **Mejor manejo de errores**

```typescript
// Separar imágenes nuevas de las existentes para procesamiento más eficiente
const newImages = data.images.filter(img => img instanceof File) as File[];
const existingImages = data.images.filter(img => !(img instanceof File)) as SanityImage[];

// Procesar imágenes nuevas en paralelo para mejor rendimiento
if (newImages.length > 0) {
  const uploadPromises = newImages.map(async (image) => {
    // ... lógica de subida
  });
  processedNewImages = await Promise.all(uploadPromises);
}
```

### 4. Sistema de Caché Local

**Archivo:** `src/views/Dashboard/ProductsView.tsx`

- **Caché en sessionStorage** para categorías
- **Tiempo de vida de 5 minutos**
- **Limpieza automática** en caso de error
- **Función de limpieza manual**

```typescript
// Usar caché local para evitar consultas repetidas
const cachedProductCats = sessionStorage.getItem('productCategories');
const cachedServiceCats = sessionStorage.getItem('serviceCategories');

if (cachedProductCats && cachedServiceCats) {
  setProductCategories(JSON.parse(cachedProductCats));
  setServiceCategories(JSON.parse(cachedServiceCats));
  return;
}
```

### 5. API de Subida de Imágenes Optimizada

**Archivo:** `src/app/api/upload-image/route.ts`

- **Nombres de archivo únicos** con timestamp
- **Configuraciones adicionales** para mejor rendimiento
- **Mejor manejo de errores**
- **Metadatos optimizados**

```typescript
const asset = await client.assets.upload('image', buffer, {
  filename: `image-${Date.now()}.${fileType}`,
  contentType: `image/${fileType}`,
  label: 'Product/Service Image',
  title: `Image uploaded at ${new Date().toISOString()}`,
});
```

### 6. Página del Catálogo Optimizada

**Archivo:** `src/app/catalogo/page.tsx`

- **Uso de consultas predefinidas**
- **Reducción de complejidad** en consultas
- **Mejor estructura** de datos solicitados
- **Ordenamiento eficiente**

## Beneficios Esperados

1. **Reducción del tiempo de carga** del catálogo en un 40-60%
2. **Mejor rendimiento** en la actualización de productos/servicios
3. **Menor uso de ancho de banda** gracias al CDN
4. **Mejor experiencia de usuario** con caché local
5. **Procesamiento más rápido** de imágenes múltiples

## Monitoreo Recomendado

1. **Métricas de rendimiento** en producción
2. **Tiempo de respuesta** de las APIs
3. **Uso de CDN** vs consultas directas
4. **Tiempo de procesamiento** de imágenes
5. **Tasa de éxito** en operaciones CRUD

## Próximas Optimizaciones

1. **Implementar ISR** (Incremental Static Regeneration) para páginas estáticas
2. **Agregar compresión** de imágenes automática
3. **Implementar lazy loading** para imágenes
4. **Agregar paginación** para grandes volúmenes de datos
5. **Optimizar consultas** con índices de Sanity
