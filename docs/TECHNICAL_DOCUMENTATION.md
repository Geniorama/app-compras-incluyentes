# Documentación Técnica · Aplicación Compras Incluyentes

## 1. Propósito
Esta documentación resume la arquitectura, dependencias, configuración y principales flujos de la aplicación **Compras Incluyentes**. Está dirigida a personas desarrolladoras y DevOps que necesiten operar, mantener o evolucionar la plataforma.

## 2. Visión general
- Aplicación web construida con **Next.js 15 (App Router)** y **React 19**, orientada a conectar empresas incluyentes mediante un catálogo de productos/servicios y un módulo de mensajería.
- Los datos de negocio se almacenan en **Sanity CMS**, mientras que la autenticación de usuarios se apoya en **Firebase Authentication**.
- La aplicación expone múltiples _API Routes_ (serverless) para sincronizar datos entre el frontend, Sanity y Firebase, además de webhooks de Sanity y utilidades de subida de imágenes.
- El estado global de autenticación se maneja con un contexto React (`AuthContext`) que hidrata la información adicional de la empresa del usuario desde Sanity.

## 3. Stack tecnológico
| Capa | Tecnología | Uso principal |
| ---- | ---------- | ------------- |
| Framework web | Next.js 15 (App Router) | Render de páginas públicas/privadas, API Routes |
| UI | React 19, Flowbite React, TailwindCSS | Componentes, formularios, estilos utilitarios |
| Datos | Sanity CMS | Modelado de empresas, usuarios, productos, servicios y mensajes |
| Autenticación | Firebase Auth (SDK web y Admin) | Registro/login, manejo de sesiones, sincronización vía webhooks |
| Correo | Nodemailer (SMTP) | Notificaciones cuando una empresa es activada |
| Otros | `react-hook-form`, `react-hot-toast`, `react-select`, `lucide-react` | UX, formularios, iconografía |

## 4. Scripts de npm
| Script | Descripción |
| ------ | ----------- |
| `npm run dev` | Inicia el servidor de desarrollo de Next.js (http://localhost:3000). |
| `npm run build` | Genera la build optimizada para producción. |
| `npm run start` | Levanta la build generada en modo producción. |
| `npm run lint` | Ejecuta ESLint con la configuración de Next.js. |

## 5. Configuración de entorno
Crear un archivo `.env.local` basado en `env.example` y completar las variables:

| Variable | Obligatoria | Descripción |
| -------- | ----------- | ----------- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sí | ID del proyecto Sanity. |
| `NEXT_PUBLIC_SANITY_DATASET` | Sí | Dataset de Sanity (p. ej. `production`). |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Opcional | Versionado de la API (el código usa `2023-05-03` por defecto). |
| `SANITY_API_TOKEN` | Sí | Token con permisos de escritura para crear/actualizar documentos y subir assets. |
| `SANITY_WEBHOOK_SECRET` | Sí (webhooks) | Firma compartida para validar webhooks entrantes desde Sanity. |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Sí | Configuración pública de Firebase web. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Sí | Dominio de autenticación de Firebase. |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Sí | ID de proyecto Firebase. |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Sí | Bucket de almacenamiento asociado. |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sí | Sender ID para Firebase Cloud Messaging (si aplica). |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Sí | App ID de Firebase. |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Sí (webhooks) | Llave privada del servicio de cuenta para Firebase Admin. Se debe mantener el formato con saltos de línea reales (`\n`). |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Sí (webhooks) | Email del cliente del servicio de cuenta Firebase Admin. |
| `SMTP_HOST` | Opcional | Host SMTP (por defecto `smtp-relay.brevo.com`). |
| `SMTP_PORT` | Opcional | Puerto SMTP (por defecto `587`). |
| `SMTP_USER` / `SMTP_PASS` | Opcional | Credenciales SMTP para `sendActivationEmail`. |
| `SMTP_FROM` | Opcional | Dirección remitente para los correos de activación. |

> ⚠️ En `env.example` las variables del Admin SDK figuran como `FIREBASE_PRIVATE_KEY` y `FIREBASE_CLIENT_EMAIL`. En el código se consumen como `FIREBASE_ADMIN_PRIVATE_KEY` y `FIREBASE_ADMIN_CLIENT_EMAIL`. Ajustar el nombre según la convención real del entorno.

## 6. Arquitectura de la solución
### 6.1 Frontend (App Router)
- Las páginas viven en `src/app`, siguiendo la convención de directorios de App Router.
- Rutas públicas clave: `/`, `/login`, `/register`, `/forgot-password`, `/catalogo`, `/empresas`.
- Rutas protegidas del dashboard bajo `/dashboard/*` (mensajes, perfil, seguridad, productos, usuarios, etc.) que comparten layout (`src/app/dashboard/layout.tsx`) y componentes (`DashboardLayout`, `DashboardSidebar`, `Navbar`).
- Se emplea TailwindCSS (config en `tailwind.config.ts`) para estilos utilitarios y Flowbite React para componentes UI adicionales.

### 6.2 Capa API (Next.js API Routes)
- Los archivos en `src/app/api/**/route.ts` funcionan como endpoints serverless. Operaciones principales:
  - Gestión de usuarios y empresas en Sanity (`create-sanity-user`, `invite-user`, `user-company`).
  - Catálogo de productos/servicios (`products`, `services`, `catalog/fresh`).
  - Mensajería entre empresas (`send-message`, `messages/*`).
  - Verificaciones previas al registro (`check-email`, `check-company-document`, `check-user-sanity`).
  - Webhooks de Sanity para activar empresas o depurar usuarios en Firebase.
  - Subida de imágenes (`upload-image`) y manejo de perfiles (`profile/get`, `profile/update`).

### 6.3 Integración con Sanity
- Tres clientes configurados en `src/lib/sanity.client.ts`:
  - `sanityClient`: solo lectura, usa CDN.
  - `getAuthenticatedClient()`: lectura/escritura con token (sin CDN).
  - `getFreshClient()`: solo lectura sin CDN para datos frescos.
- Las consultas reutilizables están centralizadas en `src/lib/sanity.queries.ts`.
- Los modelos de tipos TypeScript para documentos (`Company`, `Product`, `Service`, etc.) viven en `src/types`.

### 6.4 Autenticación y middleware
- El contexto `AuthContext` (`src/context/AuthContext.tsx`) complementa el usuario de Firebase con datos de Sanity (empresa, nombre, foto).
- Tras iniciar sesión, se persiste un token de Firebase en cookie (`token`) que habilita el middleware protector.

```5:18:src/middleware.ts
export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  const isAuthRoute = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register");
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/empresas", req.url));
  }
  return NextResponse.next();
}
```

- No existen validaciones adicionales de roles en los endpoints; se depende de encabezados (`x-user-id`) o del `firebaseUid` recibido para limitar acciones.

## 7. Estructura de carpetas relevante
| Ruta | Descripción |
| ---- | ----------- |
| `src/app/` | Páginas y layouts (App Router) y API Routes. |
| `src/components/` | Componentes reutilizables (formularios, layout del dashboard, notificaciones). |
| `src/views/` | Componentes de página desacoplados de rutas específicas. |
| `src/lib/` | Integraciones (Sanity, Firebase, Nodemailer), helpers de autenticación. |
| `src/context/` | Contextos React (actualmente `AuthContext`). |
| `src/hooks/` | Hooks reutilizables (`useCatalogSync`). |
| `src/utils/` | Utilidades (formateos, helpers para imágenes y datos). |
| `src/types/` | Definiciones TypeScript compartidas entre frontend y API. |
| `public/` | Assets estáticos. |
| `docs/` | Documentación técnica (este archivo). |

## 8. Modelos de datos en Sanity
| Documento | Campos clave | Notas |
| ---------- | ------------ | ----- |
| `company` | Identificación, datos de contacto, `active`, referencias multimedia | Campo `active` habilita visibilidad en el catálogo. |
| `user` | Datos personales, `firebaseUid`, `role`, referencia a `company` | Se crean como borrador o publicados según flujo (registro vs invitación). |
| `product` | Nombre, descripción, precio, `status`, categorías, referencias de empresa y usuarios (`createdBy`, `updatedBy`) | `status` controla visibilidad en el catálogo. |
| `service` | Similares a `product`, con duración/modalidad. |
| `message` | `subject`, `content`, referencia a remitente/destinatario y empresas, flags `read`/`deleted`. |
| `category` | Nombre, tipos (`product`, `service`), imágenes. |

## 9. Flujos funcionales principales
### 9.1 Registro de empresa y usuario administrador
1. El formulario de registro crea el usuario en Firebase (`registerUser` en `lib/auth.ts`).
2. Se invoca `POST /api/create-sanity-user` para crear la empresa (publicada pero `active: false`) y su usuario administrativo en Sanity.
3. El estado `active` de la empresa se gestiona desde Sanity; cuando cambia a `true`, el webhook `sanity-company-activated` envía correos de notificación.

### 9.2 Invitación de usuarios adicionales
1. Los administradores usan el módulo `/dashboard/usuarios`.
2. `POST /api/invite-user` crea la cuenta en Firebase con contraseña sugerida y genera un borrador de usuario en Sanity vinculado a la misma empresa.
3. No existe endpoint para publicar automáticamente el borrador; debe completarse desde Sanity o extender el flujo.

### 9.3 Gestión de catálogo
- Desde el dashboard, `POST /api/products` y `POST /api/services` crean registros con referencias al usuario autenticado y su empresa.
- Las actualizaciones usan `PUT` (establecen `updatedBy`).
- `useCatalogSync` consulta `/api/catalog/fresh` periódicamente para asegurar datos actualizados sin depender del CDN.

### 9.4 Mensajería entre empresas
- `POST /api/send-message` crea mensajes en Sanity, evitando envíos hacia la misma empresa.
- `GET /api/messages?companyId=...` recupera bandejas de entrada; alternativamente, `senderId` filtra los mensajes enviados por la empresa del usuario.
- `PATCH /api/messages/mark-as-read` y `GET /api/messages/unread-count` complementan la UX de notificaciones.

### 9.5 Gestión de perfil
- `GET /api/profile/get?userId=<firebaseUid>` trae datos combinados de usuario+empresa.
- `POST /api/profile/update` acepta parches parciales para usuario y empresa, aplicados mediante `client.patch`.

## 10. Endpoints HTTP
| Método | Ruta | Descripción | Auth / Notas |
| ------ | ---- | ----------- | ------------- |
| `POST` | `/api/check-email` | Verifica existencia de email en Firebase y Sanity. | Sin autenticación. |
| `POST` | `/api/check-company-document` | Comprueba duplicidad de NIT/tipo de empresa en Sanity. | Sin autenticación. |
| `POST` | `/api/check-user-sanity` | Valida si el usuario existe y si la empresa está activa. | Sin autenticación. |
| `GET` | `/api/companies` | Lista empresas activas (nombre + logo). | Requiere `SANITY_API_TOKEN`. |
| `POST` | `/api/create-sanity-user` | Crea empresa y usuario administrador (publicados, `active: false`). | Requiere token de Sanity. |
| `POST` | `/api/invite-user` | Crea usuario en Firebase y borrador en Sanity; liga a empresa del invitante. | Header `x-user-id` con UID de Firebase del invitante. |
| `GET` | `/api/users` | Lista usuarios de la empresa del UID recibido. | Header `x-user-id` obligatorio. |
| `GET` | `/api/user-company` | Obtiene empresa asociada a un `_id` de usuario de Sanity. | Sin control de auth adicional. |
| `GET` | `/api/profile/get` | Devuelve perfil consolidado usando `firebaseUid`. | Requiere `userId` en query. |
| `POST` | `/api/profile/update` | Actualiza datos de usuario/empresa. | `userId` (UID Firebase) en body. |
| `POST/PUT/DELETE` | `/api/products` | CRUD de productos asociados a la empresa del usuario. | `userId` (UID) en body. |
| `POST/PUT/DELETE` | `/api/services` | CRUD de servicios. | `userId` (UID) en body. |
| `GET` | `/api/catalog/fresh` | Obtiene catálogo completo (sin CDN). | Público, pero requiere token de proyecto válido. |
| `POST` | `/api/upload-image` | Sube assets a Sanity (JSON base64 o FormData). | Requiere token con permisos de asset. |
| `POST` | `/api/send-message` | Envía mensaje entre empresas. | `senderId` (UID Firebase) en body. |
| `GET` | `/api/messages` | Lista mensajes recibidos o enviados. | Query `companyId` o `senderId`. |
| `PATCH` | `/api/messages/mark-as-read` | Marca mensaje como leído. | `messageId` en body. |
| `GET` | `/api/messages/unread-count` | Cuenta mensajes no leídos por empresa. | `companyId` en query. |
| `POST` | `/api/sanity-company-activated` | Webhook Sanity: envía correos al activar empresa. | Protegido vía secreto. |
| `POST` | `/api/sanity-webhooks/delete-user` | Webhook Sanity: elimina usuario en Firebase al borrar documento. | Verificación estricta de firma. |

## 11. Componentes clave del frontend
- `CatalogoView`, `EmpresasView`, `Dashboard/*View.tsx`: encapsulan la lógica de cada vista separada de la ruta Next.js.
- Formularios reutilizables (`LoginForm`, `RegisterForm`, `ProductServiceForm`, `SecurityForm`).
- `DashboardLayout`, `DashboardSidebar`, `DashboardNavbar`: definen la estructura del área privada.
- `InternationalPhoneInput` (hay un espacio extra en el nombre del archivo) integra entradas telefónicas internacionales.
- Notificaciones y toasts para catálogo (`CatalogUpdateNotification`, `MessageNotification`).

## 12. Hooks y utilidades
- `useCatalogSync`: programa peticiones recurrentes a `/api/catalog/fresh` y dispara eventos `catalog-updated`.
- `src/utils/sanityImage.ts`: construye URLs de assets, verifica imágenes válidas y ofrece fallback cuando no hay imagen.
- `src/data/ciiu.ts`, `src/data/cities.ts` y `src/utils/departamentosCiudades.ts`: listas de apoyo para formularios.

## 13. Gestión de imágenes
- `/api/upload-image` acepta tanto FormData (dashboard) como JSON base64 (registro) y sube directamente a Sanity Assets.
- Actualmente no se comprimen imágenes (el método `compressImage` devuelve el buffer sin cambios); se recomienda integrar `sharp` en producción.

## 14. Correo transaccional
- `src/lib/sendActivationEmail.ts` usa Nodemailer con credenciales SMTP configurables. Verifica la conexión antes de enviar y maneja errores de forma aislada para cada destinatario.
- El webhook `sanity-company-activated` invoca este helper para notificar a todos los usuarios de la empresa.

## 15. Consideraciones de seguridad y pendientes detectados
- **Protección de API Routes**: la mayoría depende solo de UIDs (`senderId`, `userId`) enviados desde el cliente. No hay validación contra el token de Firebase; conviene validar la cookie/bearer token en el servidor antes de permitir operaciones sensibles.
- **Roles**: aunque los usuarios tienen `role` (`admin`, `user`), no existe control de autorización en los endpoints ni en el frontend.
- **Endpoint inexistente**: el frontend intenta llamar `PUT /api/users/:id`, pero no hay ruta dinámica que lo soporte.
- **Webhook de activación**: el query de la empresa usa `name`, pero al enviar correos se refiere a `company.nameCompany`; revisar para evitar valores `undefined`.
- **Variables Firebase Admin**: alinear nombres de variables de entorno con lo que espera el código.
- **Internacionalización**: Toda la UI está en español; no hay soporte multi-idioma.
- **Manejo de borradores**: los usuarios invitados quedan en `drafts.*`. Definir política de publicación o automatizarla vía webhook.

## 16. Próximos pasos sugeridos
- Implementar verificación del token de Firebase en las API Routes (por ejemplo, usando `firebase-admin` en middleware server-side).
- Exponer rutas adicionales para actualizar/eliminar usuarios (`/api/users/[id]`) o ajustar el frontend para operar solo con lo disponible.
- Incorporar pruebas automatizadas (unitarias o integración) al menos para los flujos críticos (registro, CRUD catálogo, mensajería).
- Automatizar la publicación de usuarios invitados o crear un proceso claro en Sanity Studio.
- Añadir compresión real de imágenes en `/api/upload-image`.
- Mantener este documento actualizado cuando cambien los flujos o se agreguen nuevos endpoints.


