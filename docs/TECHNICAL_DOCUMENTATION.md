# Documentación Técnica · Aplicación Compras Incluyentes

> Última actualización: 10 de agosto de 2026.

## 1. Propósito
Esta documentación resume la arquitectura, dependencias, configuración y principales flujos de la aplicación **Compras Incluyentes**. Está dirigida a personas desarrolladoras y DevOps que necesiten operar, mantener o evolucionar la plataforma.

## 2. Visión general
- Aplicación web construida con **Next.js 15 (App Router)** y **React 19**, orientada a conectar empresas incluyentes mediante un catálogo de productos/servicios, un tablero de oportunidades (licitaciones) y un módulo de mensajería.
- Los datos de negocio se almacenan en **Sanity CMS**, mientras que la autenticación de usuarios se apoya en **Firebase Authentication**.
- La aplicación expone múltiples _API Routes_ (serverless) para sincronizar datos entre el frontend, Sanity y Firebase, además de webhooks de Sanity y utilidades de subida de archivos.
- El estado global de autenticación se maneja con un contexto React (`AuthContext`) que hidrata la información adicional de la empresa del usuario desde Sanity.
- Existen tres áreas funcionales: el **sitio público** (catálogo, empresas, oportunidades), el **dashboard de empresa** (`/dashboard/*`) y el **panel de superadministración** (`/superadmin/*`).

## 3. Stack tecnológico
| Capa | Tecnología | Uso principal |
| ---- | ---------- | ------------- |
| Framework web | Next.js 15 (App Router) | Render de páginas públicas/privadas, API Routes |
| UI | React 19, Flowbite React, TailwindCSS | Componentes, formularios, estilos utilitarios |
| Datos | Sanity CMS (`@sanity/client`, `next-sanity`) | Modelado de empresas, usuarios, productos, servicios, oportunidades, mensajes y encuestas |
| Autenticación | Firebase Auth (SDK web y Admin) | Registro/login, manejo de sesiones, sincronización vía webhooks |
| Correo | Nodemailer (SMTP) | Notificaciones de activación de empresa y de mensajes nuevos |
| Otros | `react-hook-form`, `react-hot-toast`, `react-select`, `react-icons`, `lucide-react`, `cookies-next`, `@portabletext/react` | UX, formularios, iconografía, cookies, texto enriquecido |

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
| `NEXT_PUBLIC_APP_URL` | Opcional | URL pública del sitio, usada en enlaces de los correos. |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Sí | Configuración pública de Firebase web. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Sí | Dominio de autenticación de Firebase. |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Sí | ID de proyecto Firebase (también lo usa el Admin SDK). |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Sí | Bucket de almacenamiento asociado. |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sí | Sender ID para Firebase Cloud Messaging (si aplica). |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Sí | App ID de Firebase. |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Sí (webhooks, superadmin) | Llave privada de la cuenta de servicio. El código reemplaza `\n` escapados por saltos reales. |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Sí (webhooks, superadmin) | Email de la cuenta de servicio de Firebase Admin. |
| `SMTP_HOST` | Opcional | Host SMTP (por defecto `smtp-relay.brevo.com`). |
| `SMTP_PORT` | Opcional | Puerto SMTP (por defecto `587`). |
| `SMTP_USER` / `SMTP_PASS` | Opcional | Credenciales SMTP para el envío de correos. |
| `SMTP_FROM` | Opcional | Dirección remitente. |

> ⚠️ En `env.example` las variables del Admin SDK figuran como `FIREBASE_PRIVATE_KEY` y `FIREBASE_CLIENT_EMAIL`, pero `src/lib/firebase-admin.ts` las consume como `FIREBASE_ADMIN_PRIVATE_KEY` y `FIREBASE_ADMIN_CLIENT_EMAIL`. Si el Admin SDK falla al inicializar, revisar primero este desajuste.

## 6. Arquitectura de la solución

### 6.1 Frontend (App Router)
Las páginas viven en `src/app` siguiendo la convención de directorios de App Router; la lógica de cada pantalla está desacoplada en `src/views`.

| Área | Rutas |
| ---- | ----- |
| Públicas / autenticación | `/`, `/login`, `/register`, `/forgot-password` |
| Sitio | `/catalogo`, `/empresas`, `/empresas/[id]`, `/oportunidades`, `/oportunidades/[id]`, `/perfil` |
| Dashboard de empresa | `/dashboard`, `/dashboard/productos`, `/dashboard/mensajes`, `/dashboard/usuarios`, `/dashboard/oportunidades`, `/dashboard/favoritos`, `/dashboard/notificaciones`, `/dashboard/perfil`, `/dashboard/seguridad` |
| Superadministración | `/superadmin`, `/superadmin/usuarios`, `/superadmin/empresas`, `/superadmin/categorias`, `/superadmin/estadisticas`, `/superadmin/cuestionario`, `/superadmin/exportar` |

- El dashboard comparte layout (`src/app/dashboard/layout.tsx`) y componentes (`DashboardLayout`, `DashboardSidebar`, `Navbar`).
- `/superadmin` tiene su propio layout (`src/app/superadmin/layout.tsx`) que **verifica `user.role === 'superadmin'`** y redirige a `/empresas` en caso contrario; reutiliza `DashboardLayout` y añade `SuperadminSidebar`.
- Se emplea TailwindCSS (config en `tailwind.config.ts`) para estilos utilitarios y Flowbite React para componentes UI adicionales.

### 6.2 Capa API (Next.js API Routes)
Los archivos en `src/app/api/**/route.ts` funcionan como endpoints serverless. Grupos principales:

- Gestión de usuarios y empresas en Sanity (`create-sanity-user`, `invite-user`, `user-company`, `users`, `visible-users`).
- Catálogo de productos/servicios (`products`, `services`, `catalog/fresh`).
- Oportunidades/licitaciones (`opportunities`, `opportunities/[id]`, `opportunities/[id]/apply`).
- Favoritos de empresas (`favorites`).
- Mensajería (`send-message`, `messages`, `messages/mark-as-read`, `messages/unread-count`, `messages/bulk-delete`).
- Cuestionario de experiencia (`survey`).
- Verificaciones previas al registro y recuperación (`check-email`, `check-email-exists`, `check-company-document`, `check-user-sanity`).
- Superadministración (`superadmin/*`), **todos protegidos por rol**.
- Webhooks de Sanity (`sanity-company-activated`, `sanity-webhooks/delete-user`).
- Subida de assets (`upload-image`, `upload-file`).

### 6.3 Integración con Sanity
- Tres clientes configurados en `src/lib/sanity.client.ts`:
  - `sanityClient`: solo lectura, usa CDN.
  - `getAuthenticatedClient()`: lectura/escritura con token (sin CDN).
  - `getFreshClient()`: solo lectura sin CDN para datos frescos.
- Las consultas reutilizables están centralizadas en `src/lib/sanity.queries.ts`.
- Los tipos TypeScript de los documentos viven en `src/types`.
- La carpeta `schemas/` de este repo **no es el Studio**: contiene únicamente los schemas que deben copiarse al proyecto de Sanity Studio (`message.ts`, `opportunity.ts`, `platformSurveyResponse.ts`). Ver `schemas/README.md`. Los schemas de `company`, `user`, `product`, `service` y `category` viven solo en el Studio.

### 6.4 Autenticación, roles y autorización
- El contexto `AuthContext` (`src/context/AuthContext.tsx`) complementa el usuario de Firebase con datos de Sanity (empresa, nombre, foto, rol).
- Tras iniciar sesión se persiste un token de Firebase en cookie (`token`), que habilita el middleware protector.

```5:25:src/middleware.ts
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

> El `matcher` excluye `api`, por lo que **el middleware no protege las API Routes**: solo controla la navegación de páginas.

**Roles disponibles** (campo `role` del documento `user`):

| Rol | Alcance |
| --- | ------- |
| `admin` | Administra su empresa desde `/dashboard` (productos, usuarios, oportunidades). |
| `user` | Usuario estándar asociado a una empresa. |
| `member` | Usuario invitado sin cuenta de Firebase propia; existe solo en Sanity. |
| `superadmin` | Acceso total al panel `/superadmin` y a sus endpoints. |

**Autorización en endpoints.** El helper `isSuperadmin(userId)` de `src/lib/superadmin.ts` resuelve el `firebaseUid` recibido en el header `x-user-id` contra Sanity y comprueba `role === 'superadmin'`. Todos los endpoints bajo `/api/superadmin/*` lo invocan y devuelven `403` si falla. **Los demás endpoints no verifican rol** y confían en el UID que envía el cliente (ver §17).

## 7. Estructura de carpetas relevante
| Ruta | Descripción |
| ---- | ----------- |
| `src/app/` | Páginas y layouts (App Router) y API Routes. |
| `src/components/` | Componentes reutilizables (formularios, layout, notificaciones, accesibilidad). |
| `src/components/dashboard/` | Layout, navbar y widgets del área privada. |
| `src/components/superadmin/` | Sidebar y select con búsqueda del panel de superadmin. |
| `src/views/` | Componentes de página desacoplados de rutas específicas (`Catalogo/`, `Dashboard/`, `Empresas/`, `Oportunidades/`, `Superadmin/`). |
| `src/lib/` | Integraciones (Sanity, Firebase, Firebase Admin, Nodemailer), helpers de autenticación y de rol. |
| `src/context/` | Contextos React (`AuthContext`). |
| `src/hooks/` | Hooks reutilizables (`useCatalogSync`). |
| `src/utils/` | Utilidades (imágenes de Sanity, CIIU, códigos de país, departamentos/ciudades). |
| `src/data/` | Datasets estáticos para formularios (`ciiu.ts`, `cities.ts`, `latinAmericaCountries.ts`, `mexicoStates.ts`). |
| `src/types/` | Definiciones TypeScript compartidas entre frontend y API. |
| `schemas/` | Schemas de Sanity pendientes de copiar al Studio. |
| `public/` | Assets estáticos. |
| `docs/` | Documentación técnica (este archivo). |

## 8. Modelos de datos en Sanity
| Documento | Campos clave | Notas |
| ---------- | ------------ | ----- |
| `company` | Identificación, contacto, `active`, `companySize`, referencias multimedia | `active` habilita visibilidad en el catálogo; `companySize == "grande"` habilita publicar oportunidades. |
| `user` | Datos personales, `firebaseUid`, `role`, `publicProfile`, `notifyEmailMessages`, `favorites[]`, referencia a `company` | Los invitados (`member`) no tienen `firebaseUid`. `favorites` es un arreglo de referencias a `company`. |
| `product` | Nombre, descripción, precio, `status`, categorías, referencias de empresa y usuarios (`createdBy`, `updatedBy`) | `status` controla visibilidad en el catálogo. |
| `service` | Similar a `product`, con duración/modalidad. | |
| `message` | `subject`, `content`, remitente/destinatario y empresas, flags `read`/`deleted`. | |
| `category` | Nombre, tipos (`product`, `service`), imagen. | |
| `opportunity` | `title`, `company`, `cover`, `startDate`, `maxApplicationDate`, `description`, `requirements`, `contractValue`, `status` (`draft`/`open`/`closed`), `applications[]` | Solo empresas `grande` publican; cualquier empresa se postula. Valida que no haya postulaciones duplicadas ni fecha máxima anterior a la de inicio. |
| `platformSurveyResponse` | `user`, `firebaseUid`, `experienceRating` (1-5), `helpedGetClients`, `helpedGetProjects` (`si`/`no`/`en-parte`), `recommendationScore` (0-10), `additionalComments`, `submittedAt` | Alimenta el panel `/superadmin/cuestionario`. |

## 9. Flujos funcionales principales

### 9.1 Registro de empresa y usuario administrador
1. El formulario de registro crea el usuario en Firebase (`registerUser` en `lib/auth.ts`).
2. Se invoca `POST /api/create-sanity-user` para crear la empresa (publicada pero `active: false`) y su usuario administrativo en Sanity.
3. El estado `active` se gestiona desde Sanity o desde `/superadmin/empresas`; al cambiar a `true`, el webhook `sanity-company-activated` envía correos de notificación.

### 9.2 Invitación de usuarios adicionales
1. Los administradores usan el módulo `/dashboard/usuarios`.
2. `POST /api/invite-user` crea la cuenta en Firebase con contraseña sugerida y genera un usuario en Sanity vinculado a la misma empresa.
3. Los usuarios `member` no tienen cuenta de Firebase: existen solo como documento de Sanity y son visibles según la regla de `visible-users`.

### 9.3 Gestión de catálogo
- Desde el dashboard, `POST /api/products` y `POST /api/services` crean registros con referencias al usuario autenticado y su empresa; las actualizaciones usan `PUT` (establecen `updatedBy`).
- `useCatalogSync` consulta `/api/catalog/fresh` periódicamente (cada 60 s en `/catalogo`) para asegurar datos actualizados sin depender del CDN, y emite el evento `catalog-updated`.
- La vista pública `/catalogo` filtra en cliente sobre el conjunto ya descargado (búsqueda, categoría, tipo y empresa) y **pagina el render con scroll infinito** en bloques de 12 tarjetas mediante `IntersectionObserver`, con botón "Cargar más" como respaldo accesible. Título y descripción se truncan (55 y 120 caracteres) cortando en palabra completa, con enlace "Ver más" hacia la ficha de la empresa.

### 9.4 Oportunidades (licitaciones)
- `GET /api/opportunities` lista las oportunidades; `POST` crea una nueva (solo empresas de tamaño `grande`).
- `GET|PATCH /api/opportunities/[id]` consulta y actualiza una oportunidad de la empresa publicadora.
- `POST /api/opportunities/[id]/apply` postula la empresa del usuario, evitando duplicados.
- El seguimiento de postulaciones se hace desde `/dashboard/oportunidades`.

### 9.5 Mensajería entre empresas
- `POST /api/send-message` crea mensajes en Sanity, evitando envíos hacia la misma empresa, y puede notificar por correo (`sendMessageEmail`) según `notifyEmailMessages`.
- `GET /api/messages?companyId=...` recupera bandejas de entrada; `senderId` filtra los enviados.
- `PATCH /api/messages/mark-as-read`, `PATCH /api/messages/bulk-delete` y `GET /api/messages/unread-count` completan la UX.
- `GET /api/visible-users` expone quiénes pueden recibir mensajes persona a persona: `publicProfile == true` **o** (`role == "member"` y la empresa no es `grande`).

### 9.6 Favoritos
- `GET /api/favorites` devuelve las empresas marcadas por el usuario; `PATCH` alterna una empresa en el arreglo `favorites` del documento `user`.
- Se consultan desde `/dashboard/favoritos`.

### 9.7 Cuestionario de experiencia
1. `SurveyModal` se monta globalmente en `src/app/layout.tsx` y se muestra a usuarios autenticados, respetando cookies de control: 30 días si ya respondieron (`survey_completed_at`) y 48 horas si lo omitieron (`survey_skipped_at`).
2. `POST /api/survey` valida los rangos y crea un `platformSurveyResponse` ligado al usuario.
3. El superadmin consulta los resultados agregados en `/superadmin/cuestionario` y puede exportarlos a CSV (§16).

### 9.8 Superadministración
- `/superadmin` muestra métricas generales (`GET /api/superadmin/stats`).
- `/superadmin/usuarios` y `/superadmin/empresas` permiten listar con búsqueda y paginación, crear, editar y eliminar; la eliminación de usuarios también borra la cuenta en Firebase vía Admin SDK.
- `/superadmin/categorias` administra el catálogo de categorías.
- `/superadmin/cuestionario` muestra los resultados de la encuesta.
- `/superadmin/exportar` descarga CSV de usuarios, empresas, categorías y cuestionario.

### 9.9 Gestión de perfil
- `GET /api/profile/get?userId=<firebaseUid>` trae datos combinados de usuario+empresa.
- `POST /api/profile/update` acepta parches parciales para usuario y empresa, aplicados mediante `client.patch`.

## 10. Endpoints HTTP

### 10.1 Públicos y de registro
| Método | Ruta | Descripción | Auth / Notas |
| ------ | ---- | ----------- | ------------- |
| `POST` | `/api/check-email` | Verifica existencia de email en Firebase y Sanity. | Sin autenticación. |
| `POST` | `/api/check-email-exists` | Verifica si el email puede restablecer contraseña (requiere `firebaseUid`). | Sin autenticación. |
| `POST` | `/api/check-company-document` | Comprueba duplicidad de NIT/tipo de empresa. | Sin autenticación. |
| `POST` | `/api/check-user-sanity` | Valida si el usuario existe, si su empresa está activa y si es superadmin. | Sin autenticación. |
| `GET` | `/api/companies` | Lista empresas activas (nombre + logo). | Requiere `SANITY_API_TOKEN`. |
| `POST` | `/api/create-sanity-user` | Crea empresa y usuario administrador (`active: false`). | Requiere token de Sanity. |
| `GET` | `/api/catalog/fresh` | Catálogo completo sin CDN. | Público. |
| `GET` | `/api/visible-users` | Usuarios que pueden recibir mensajes persona a persona. | Público. |

### 10.2 Usuarios, perfil y contenidos
| Método | Ruta | Descripción | Auth / Notas |
| ------ | ---- | ----------- | ------------- |
| `POST` | `/api/invite-user` | Crea usuario en Firebase/Sanity ligado a la empresa del invitante. | Header `x-user-id`. |
| `GET` `PUT` | `/api/users` | Lista y actualiza usuarios de la empresa del UID recibido. | Header `x-user-id`. |
| `GET` | `/api/user-company` | Empresa asociada a un `_id` de usuario de Sanity. | Sin control adicional. |
| `GET` | `/api/profile/get` | Perfil consolidado por `firebaseUid`. | `userId` en query. |
| `POST` | `/api/profile/update` | Actualiza datos de usuario/empresa. | `userId` en body. |
| `POST` `PUT` `DELETE` | `/api/products` | CRUD de productos de la empresa del usuario. | `userId` en body. |
| `POST` `PUT` `DELETE` | `/api/services` | CRUD de servicios. | `userId` en body. |
| `GET` `PATCH` | `/api/favorites` | Lista y alterna empresas favoritas. | Header `x-user-id`. |
| `POST` | `/api/upload-image` | Sube imágenes a Sanity (JSON base64 o FormData). | Requiere token con permisos de asset. |
| `POST` | `/api/upload-file` | Sube archivos genéricos a Sanity (JSON base64 o FormData). | Requiere token con permisos de asset. |

### 10.3 Oportunidades
| Método | Ruta | Descripción | Auth / Notas |
| ------ | ---- | ----------- | ------------- |
| `GET` `POST` | `/api/opportunities` | Lista y crea oportunidades. | Header `x-user-id`; publicar exige empresa `grande`. |
| `GET` `PATCH` | `/api/opportunities/[id]` | Consulta y actualiza una oportunidad. | Header `x-user-id`. |
| `POST` | `/api/opportunities/[id]/apply` | Postula la empresa del usuario. | Header `x-user-id`; evita duplicados. |

### 10.4 Mensajería y encuesta
| Método | Ruta | Descripción | Auth / Notas |
| ------ | ---- | ----------- | ------------- |
| `POST` | `/api/send-message` | Envía mensaje entre empresas o personas. | `senderId` en body. |
| `GET` | `/api/messages` | Lista mensajes recibidos o enviados. | Query `companyId` o `senderId`. |
| `PATCH` | `/api/messages/mark-as-read` | Marca mensaje como leído. | `messageId` en body. |
| `PATCH` | `/api/messages/bulk-delete` | Borra una bandeja completa o mensajes puntuales. | `userId` en body; valida pertenencia. |
| `GET` | `/api/messages/unread-count` | Cuenta mensajes no leídos. | `companyId` en query. |
| `POST` | `/api/survey` | Registra una respuesta al cuestionario. | Header `x-user-id`; valida rangos. |

### 10.5 Superadministración — todos exigen header `x-user-id` de un usuario con `role: superadmin` (`403` en caso contrario)
| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| `GET` | `/api/superadmin/stats` | Conteos globales (usuarios, empresas, productos, servicios, categorías). |
| `GET` `POST` | `/api/superadmin/users` | Lista paginada con búsqueda/filtro por rol; crea usuarios. |
| `PATCH` `DELETE` | `/api/superadmin/users/[id]` | Edita o elimina un usuario (también en Firebase Auth). |
| `GET` `POST` | `/api/superadmin/companies` | Lista paginada y creación de empresas. |
| `GET` `PATCH` | `/api/superadmin/companies/[id]` | Detalle y edición de una empresa. |
| `POST` | `/api/superadmin/companies/bulk` | Operaciones masivas sobre empresas: `activate`, `deactivate` o `delete` (transacción de Sanity). |
| `GET` `POST` | `/api/superadmin/categories` | Lista y creación de categorías. |
| `PATCH` `DELETE` | `/api/superadmin/categories/[id]` | Edición y borrado de categorías. |
| `GET` | `/api/superadmin/survey` | Agregados del cuestionario + página de respuestas. |
| `GET` | `/api/superadmin/export` | Exportación CSV (`?type=users\|companies\|categories\|survey`). |

### 10.6 Webhooks
| Método | Ruta | Descripción | Auth / Notas |
| ------ | ---- | ----------- | ------------- |
| `POST` | `/api/sanity-company-activated` | Envía correos al activar una empresa. | Protegido vía secreto. |
| `POST` | `/api/sanity-webhooks/delete-user` | Elimina el usuario en Firebase al borrar el documento. | Verificación estricta de firma (`SANITY_WEBHOOK_SECRET`). |

## 11. Componentes clave del frontend
- **Vistas**: `CatalogoView`, `EmpresasView`, `EmpresaView`, `Oportunidades/*`, `Dashboard/*View.tsx`, `Superadmin/*View.tsx` encapsulan la lógica de cada pantalla separada de la ruta Next.js.
- **Formularios**: `LoginForm`, `RegisterForm`, `ProductServiceForm`, `SecurityForm`.
- **Layout**: `DashboardLayout`, `DashboardSidebar`, `Navbar` (dashboard) y `SuperadminSidebar` (panel de superadmin).
- **Accesibilidad**: `AccessibilityBar` (ver §13), montado globalmente en `src/app/layout.tsx`.
- **Encuesta**: `SurveyModal`, también global, con control de frecuencia por cookies.
- **Otros**: `CompanyCard`, `SearchableSelect` (select con búsqueda para listas largas), `CatalogUpdateNotification`, `MessageNotification`, `MessageSummary`.
- `InternationalPhoneInput` tiene un espacio extra en el nombre del archivo (`InternationalPhoneInput .tsx`); renombrarlo obliga a actualizar los imports.

## 12. Hooks y utilidades
- `useCatalogSync`: programa peticiones recurrentes a `/api/catalog/fresh` y dispara eventos `catalog-updated`.
- `src/utils/sanityImage.ts`: construye URLs de assets, verifica imágenes válidas y ofrece fallback.
- `src/lib/superadmin.ts`: `isSuperadmin(firebaseUid)` — única verificación de rol del backend.
- `src/utils/ciiuOptions.ts`, `src/utils/countryCodes.ts`, `src/utils/departamentosCiudades.ts` y `src/data/*`: listas de apoyo para formularios.

## 13. Accesibilidad
`AccessibilityBar` (`src/components/AccessibilityBar.tsx`) se monta en el layout raíz y ofrece un panel lateral con preferencias persistidas en `localStorage` (clave `ci-accessibility`):

| Opción | Efecto |
| ------ | ------ |
| Tamaño de texto | Aplica `a11y-font-lg` / `a11y-font-xl` al elemento `<html>` (estilos en `src/app/globals.css`). |
| Alto contraste | Clase `a11y-high-contrast`. |
| Escala de grises | Clase `a11y-grayscale`. |
| Lector de pantalla | Lee en voz alta el elemento bajo el cursor o con el foco usando la Web Speech API. |

Detalles del lector: prioriza `aria-label` → `alt` → `title` → texto visible, corta a 300 caracteres, omite contenido con `aria-hidden` y el valor de campos de contraseña, y evita repetir el mismo texto. Si el navegador no soporta `speechSynthesis`, el control aparece deshabilitado con la explicación. Es una ayuda integrada a la página, no un reemplazo de NVDA/VoiceOver.

El layout raíz incluye además un enlace "Ir al contenido principal" visible solo con foco, apuntando a `#main-content`.

## 14. Gestión de imágenes y archivos
- `/api/upload-image` acepta FormData (dashboard) y JSON base64 (registro), y sube directamente a Sanity Assets.
- `/api/upload-file` cubre el mismo patrón para archivos no-imagen.
- Actualmente no se comprimen imágenes (el método `compressImage` devuelve el buffer sin cambios); se recomienda integrar `sharp` en producción.

## 15. Correo transaccional
- `src/lib/sendActivationEmail.ts` usa Nodemailer con credenciales SMTP configurables. Verifica la conexión antes de enviar y aísla errores por destinatario.
- `src/lib/sendMessageEmail.ts` notifica mensajes nuevos a quienes tengan `notifyEmailMessages` activo.
- El webhook `sanity-company-activated` invoca el helper de activación para notificar a todos los usuarios de la empresa.

## 16. Exportación de datos (CSV)
`GET /api/superadmin/export?type=…` genera CSV para `users`, `companies`, `categories` y `survey`. Consideraciones implementadas en el helper compartido:

- **Neutralización de fórmulas**: los valores que empiezan por `=`, `+`, `-` o `@` se prefijan con `'` para que Excel/Sheets no los ejecuten. Es relevante porque el CSV incluye texto escrito por usuarios (comentarios de la encuesta, nombres).
- **Escapado RFC 4180**: se entrecomillan los valores con comillas, comas, saltos de línea o retornos de carro, duplicando las comillas internas.
- **BOM UTF-8** al inicio del archivo para que Excel muestre correctamente tildes y eñes.
- El nombre del archivo viaja en `Content-Disposition` y el cliente lo respeta (`usuarios-YYYY-MM-DD.csv`, `cuestionario-YYYY-MM-DD.csv`, etc.).

El CSV del cuestionario incluye datos del usuario y su empresa, las cuatro respuestas, la **categoría NPS derivada** (Promotor / Pasivo / Detractor) y la fecha de envío.

## 17. Consideraciones de seguridad y pendientes detectados
- **Protección de API Routes**: salvo `/api/superadmin/*`, los endpoints dependen de UIDs (`x-user-id`, `senderId`, `userId`) enviados desde el cliente, sin validar el token de Firebase en el servidor. Un cliente puede suplantar a otro usuario enviando su UID. Conviene verificar el ID token con el Admin SDK antes de operaciones sensibles.
- **Alcance de la verificación de rol**: `isSuperadmin` consulta Sanity por `firebaseUid`, pero ese UID llega en un header no verificado. La protección impide que un usuario común acceda **si no conoce el UID de un superadmin**; no es una barrera criptográfica. Debe combinarse con verificación de token.
- **El middleware no cubre `/api`**: su `matcher` excluye explícitamente `api`, por lo que no aporta protección a los endpoints.
- **Roles en frontend**: `/superadmin` valida rol en el layout (cliente). La defensa real debe estar en el servidor.
- **Datos personales en exportaciones**: los CSV incluyen nombres, correos y comentarios. Restringir su distribución y considerar registro de auditoría de descargas.
- **Webhook de activación**: revisar la consistencia entre `name` y `nameCompany` al construir los correos para evitar valores `undefined`.
- **Variables Firebase Admin**: alinear los nombres de `env.example` con los que consume el código (§5).
- **Internacionalización**: toda la UI está en español; no hay soporte multi-idioma.
- **Catálogo en cliente**: `/catalogo` descarga el catálogo completo y filtra/pagina en el navegador. Con miles de ítems habrá que paginar en GROQ.
- **Sin pruebas automatizadas**: no hay suite de tests en el repositorio.

## 18. Próximos pasos sugeridos
- Implementar verificación del ID token de Firebase en las API Routes (Admin SDK), empezando por `/api/superadmin/*` y por los endpoints que escriben datos.
- Incorporar pruebas automatizadas al menos para los flujos críticos (registro, CRUD de catálogo, mensajería, autorización de superadmin).
- Paginar el catálogo del lado del servidor cuando el volumen lo exija.
- Añadir compresión real de imágenes en `/api/upload-image`.
- Registrar auditoría de las acciones de superadmin (creación/edición/borrado y exportaciones).
- Mantener este documento actualizado cuando cambien los flujos o se agreguen nuevos endpoints.
