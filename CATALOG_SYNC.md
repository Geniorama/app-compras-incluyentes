# Sincronización del Catálogo - Datos Frescos

## Problema Resuelto

Anteriormente, cuando se creaba o actualizaba un producto/servicio en el dashboard, no aparecía inmediatamente en el catálogo debido al retraso del CDN de Sanity. Esto causaba confusión en los usuarios.

## Solución Implementada

### 1. API de Datos Frescos

**Archivo:** `src/app/api/catalog/fresh/route.ts`

- Endpoint que obtiene datos directamente de Sanity sin usar CDN
- Devuelve productos, servicios, categorías y empresas actualizados
- Usado para obtener datos frescos cuando sea necesario

```typescript
// Ejemplo de uso
const response = await fetch('/api/catalog/fresh');
const result = await response.json();
// result.data contiene los datos frescos
```

### 2. Hook de Sincronización

**Archivo:** `src/hooks/useCatalogSync.ts`

- Hook personalizado para manejar la sincronización del catálogo
- Sincronización automática configurable
- Emisión de eventos personalizados

```typescript
const { refreshCatalogData } = useCatalogSync({
  syncInterval: 60000, // Sincronizar cada minuto
  onCatalogUpdate: () => {
    // Callback cuando se detectan actualizaciones
  }
});
```

### 3. Componente de Notificación

**Archivo:** `src/components/CatalogUpdateNotification.tsx`

- Notificación flotante que aparece cuando se detectan cambios
- Botón para actualizar inmediatamente el catálogo
- Muestra la hora de la última actualización

### 4. Integración en el Dashboard

**Archivo:** `src/views/Dashboard/ProductsView.tsx`

- Emite eventos cuando se crean/actualizan productos
- Notifica al usuario sobre la disponibilidad de datos frescos
- Integración con el sistema de notificaciones

### 5. Actualización Automática del Catálogo

**Archivo:** `src/views/Catalogo/CatalogoView.tsx`

- Botón manual para actualizar datos frescos
- Sincronización automática cada minuto
- Escucha eventos de actualización del dashboard

## Flujo de Funcionamiento

1. **Usuario crea/actualiza producto** en el dashboard
2. **Se emite evento** `catalog-updated`
3. **Notificación aparece** en el catálogo
4. **Usuario puede actualizar** inmediatamente o esperar sincronización automática
5. **Datos frescos se obtienen** sin CDN para mostrar cambios inmediatos

## Beneficios

- ✅ **Datos frescos inmediatos** después de crear/actualizar productos
- ✅ **Notificaciones automáticas** cuando hay cambios
- ✅ **Sincronización automática** cada minuto
- ✅ **Botón manual** para actualización inmediata
- ✅ **Mantiene rendimiento** del CDN para consultas normales
- ✅ **Experiencia de usuario mejorada** con feedback visual

## Configuración

### Intervalo de Sincronización

```typescript
// En CatalogoView.tsx
const { refreshCatalogData } = useCatalogSync({
  syncInterval: 60000 // 1 minuto
});
```

### Detección de Bots

```typescript
// En catalogo/page.tsx
const isBot = /bot|crawler|spider|crawling/i.test(userAgent);
const client = isBot ? getFreshClient() : sanityClient;
```

## Uso para Desarrolladores

### Emitir Evento de Actualización

```typescript
// Cuando se crea/actualiza un producto
window.dispatchEvent(new CustomEvent('catalog-updated'));
```

### Escuchar Eventos de Actualización

```typescript
useEffect(() => {
  const handleCatalogUpdate = () => {
    // Actualizar datos
  };
  
  window.addEventListener('catalog-updated', handleCatalogUpdate);
  return () => window.removeEventListener('catalog-updated', handleCatalogUpdate);
}, []);
```

### Obtener Datos Frescos Manualmente

```typescript
const refreshCatalogData = async () => {
  const response = await fetch('/api/catalog/fresh');
  const result = await response.json();
  if (result.success) {
    // Actualizar estado con result.data
  }
};
```

## Monitoreo y Métricas

- **Tiempo de propagación** del CDN vs datos frescos
- **Frecuencia de uso** del botón de actualización manual
- **Tiempo de respuesta** de la API de datos frescos
- **Tasa de éxito** en sincronizaciones automáticas
