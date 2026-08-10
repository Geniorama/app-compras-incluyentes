# Compras Incluyentes

Plataforma web que conecta empresas incluyentes mediante un catálogo de productos y servicios, un tablero de oportunidades (licitaciones) y mensajería entre empresas. Incluye un dashboard para cada empresa y un panel de superadministración.

Construida con **Next.js 15 (App Router)** y **React 19**, con **Sanity CMS** como base de datos de negocio y **Firebase Authentication** para el manejo de cuentas.

## Requisitos

- Node.js 18.18 o superior (mínimo que exige Next.js 15; recomendado 20 LTS)
- npm
- Un proyecto de Sanity con su token de escritura
- Un proyecto de Firebase (Auth habilitado) y una cuenta de servicio para el Admin SDK

## Puesta en marcha

```bash
npm install
cp env.example .env.local   # completar los valores
npm run dev
```

La aplicación queda disponible en [http://localhost:3000](http://localhost:3000).

## Variables de entorno

Copiar `env.example` a `.env.local` y completar. Las obligatorias son:

| Variable | Descripción |
| -------- | ----------- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | ID del proyecto de Sanity. |
| `NEXT_PUBLIC_SANITY_DATASET` | Dataset (p. ej. `production`). |
| `SANITY_API_TOKEN` | Token de Sanity con permisos de escritura y de assets. |
| `SANITY_WEBHOOK_SECRET` | Secreto compartido para validar los webhooks entrantes de Sanity. |
| `NEXT_PUBLIC_FIREBASE_*` | Configuración web de Firebase (API key, auth domain, project id, storage bucket, sender id, app id). |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Email de la cuenta de servicio de Firebase Admin. |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Llave privada de esa cuenta (con los `\n` escapados). |

> ⚠️ `env.example` todavía nombra estas dos últimas como `FIREBASE_CLIENT_EMAIL` y `FIREBASE_PRIVATE_KEY`, pero `src/lib/firebase-admin.ts` las lee con el prefijo `FIREBASE_ADMIN_`. Si el Admin SDK no inicializa, revisar esto primero.

Opcionales: `NEXT_PUBLIC_SANITY_API_VERSION`, `NEXT_PUBLIC_APP_URL` (enlaces de los correos) y las de SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`) para el correo transaccional. El detalle completo está en la [documentación técnica](docs/TECHNICAL_DOCUMENTATION.md#5-configuración-de-entorno).

## Scripts

| Script | Descripción |
| ------ | ----------- |
| `npm run dev` | Servidor de desarrollo. |
| `npm run build` | Build de producción. |
| `npm run start` | Sirve la build de producción. |
| `npm run lint` | ESLint con la configuración de Next.js. |
| `npm run restore-firebase-users` | Script de mantenimiento (`scripts/restore-firebase-users.ts`) que recrea en Firebase Auth los usuarios que existen en Sanity. Requiere las credenciales del Admin SDK. |

## Estructura

```
src/app/         Páginas, layouts y API Routes (App Router)
src/views/       Lógica de cada pantalla, desacoplada de las rutas
src/components/  Componentes reutilizables (formularios, layout, accesibilidad)
src/lib/         Integraciones: Sanity, Firebase, Firebase Admin, Nodemailer
src/hooks/       Hooks reutilizables
src/utils/       Utilidades e imágenes de Sanity
src/data/        Datasets estáticos para formularios (CIIU, ciudades, países)
schemas/         Schemas de Sanity que deben copiarse al Studio
docs/            Documentación técnica y funcional
```

## Despliegue

El sitio se despliega en **Netlify**. La configuración de build vive en `netlify.toml` y las variables de entorno se cargan desde el panel de Netlify. Ver la sección de despliegue de la [documentación técnica](docs/TECHNICAL_DOCUMENTATION.md#19-despliegue).

## Documentación

- [Documentación técnica](docs/TECHNICAL_DOCUMENTATION.md) — arquitectura, endpoints, modelos de datos y flujos.
- [Panel de superadministración](docs/SUPERADMIN.md) — cómo crear un superadmin y qué permite el panel.
- [`schemas/README.md`](schemas/README.md) — qué schemas hay que copiar al Sanity Studio.
- [`docs/historial/`](docs/historial/) — bitácoras de cambios pasados; son registro histórico, no la fuente de verdad del estado actual.
