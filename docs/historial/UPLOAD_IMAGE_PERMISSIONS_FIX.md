# Solución al Error de Permisos en Upload de Imágenes

## Problema Identificado

El error "Insufficient permissions; permission 'create' required" se debía a que la API de upload-image estaba usando el cliente público de Sanity (`sanityClient`) que no tiene permisos de escritura.

## Causa Raíz

En `src/app/api/upload-image/route.ts` se estaba importando y usando:
```typescript
import { sanityClient } from '@/lib/sanity.client'
```

El cliente `sanityClient` está configurado para operaciones de solo lectura y no incluye el token de autenticación necesario para subir imágenes.

## Solución Implementada

### 1. Cambio de Importación
```typescript
// Antes
import { sanityClient } from '@/lib/sanity.client'

// Después  
import { getAuthenticatedClient } from '@/lib/sanity.client'
```

### 2. Uso del Cliente Autenticado
```typescript
// Antes
const asset = await sanityClient.assets.upload('image', buffer, {

// Después
const authenticatedClient = getAuthenticatedClient();
const asset = await authenticatedClient.assets.upload('image', buffer, {
```

## Variables de Entorno Requeridas

Para que la solución funcione, necesitas configurar las siguientes variables de entorno en tu archivo `.env.local`:

```env
# Sanity Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=tu_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2023-05-03

# Sanity API Token (CRÍTICO para subir imágenes)
SANITY_API_TOKEN=tu_sanity_api_token
```

## Cómo Obtener el Token de Sanity

1. Ve a [manage.sanity.io](https://manage.sanity.io)
2. Selecciona tu proyecto
3. Ve a "API" en el menú lateral
4. Crea un nuevo token con permisos de "Editor" o "Write"
5. Copia el token y agrégalo a tu archivo `.env.local`

## Verificación

Después de aplicar estos cambios y configurar las variables de entorno:

1. Reinicia el servidor de desarrollo
2. Intenta subir una imagen desde el dashboard
3. Verifica que no aparezcan errores de permisos en la consola

## Archivos Modificados

- `src/app/api/upload-image/route.ts` - Cambio de cliente de Sanity
- `env.example` - Archivo de ejemplo con variables de entorno
