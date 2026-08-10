# Panel Superadmin

> Última actualización: 10 de agosto de 2026.

Guía operativa del panel `/superadmin`. El detalle técnico de los endpoints está en la [documentación técnica](TECHNICAL_DOCUMENTATION.md#105-superadministración--todos-exigen-header-x-user-id-de-un-usuario-con-role-superadmin-403-en-caso-contrario).

## Crear un usuario Superadmin

1. **Crear el usuario en Firebase Auth** (o usar uno existente) con el email y contraseña que se usarán para el login.
2. **Crear o actualizar el documento en Sanity Studio**
   - Tipo: `user`
   - Campos requeridos: `firstName`, `lastName`, `email`, `firebaseUid` (el UID del usuario de Firebase)
   - **Rol**: asignar `superadmin` en el campo `role`
   - `company` puede quedar vacío (si el esquema lo permite) o referenciar cualquier empresa
3. **Login**: se usa la misma página `/login` que el resto de usuarios. Tras iniciar sesión, la app redirige a `/superadmin`.

El layout `/superadmin` verifica `user.role === 'superadmin'` y redirige a `/empresas` a quien no lo tenga. Además, todos los endpoints `/api/superadmin/*` validan el rol en el servidor con el helper `isSuperadmin` y responden `403` si no corresponde.

## Secciones del panel

| Sección | Ruta | Qué permite |
| ------- | ---- | ----------- |
| Inicio | `/superadmin` | Métricas generales de la plataforma. |
| Usuarios | `/superadmin/usuarios` | Listado paginado con búsqueda y filtro por rol; crear, editar y eliminar usuarios. Al eliminar, también se borra la cuenta en Firebase Auth. |
| Empresas | `/superadmin/empresas` | Listado paginado con búsqueda; crear y editar empresas; activar/desactivar su visibilidad en el catálogo. Admite **acciones masivas** sobre varias empresas a la vez: activar, desactivar o eliminar. |
| Categorías | `/superadmin/categorias` | Crear, editar y eliminar categorías de productos y servicios. |
| Estadísticas | `/superadmin/estadisticas` | Conteos globales: usuarios, empresas, productos, servicios y categorías. |
| Cuestionario | `/superadmin/cuestionario` | Resultados del cuestionario de experiencia: respuestas recibidas, experiencia promedio (1-5), **NPS** (promotores − detractores, de −100 a 100), cuántas respuestas traen comentarios, y el listado de respuestas. Incluye su propio botón de exportar a CSV. |
| Exportar datos | `/superadmin/exportar` | Descarga de CSV: usuarios, empresas, categorías y cuestionario. |

## Sobre las exportaciones

Los CSV se generan en `/api/superadmin/export?type=users|companies|categories|survey`. Traen BOM UTF-8 (para que Excel muestre bien tildes y eñes), escapado RFC 4180 y neutralización de fórmulas: los valores que empiezan por `=`, `+`, `-` o `@` se prefijan con `'` para que Excel o Sheets no los ejecuten. El nombre del archivo incluye la fecha (`usuarios-YYYY-MM-DD.csv`).

El CSV del cuestionario añade los datos del usuario y su empresa, las cuatro respuestas, la categoría NPS derivada (Promotor / Pasivo / Detractor) y la fecha de envío.

> Estos archivos contienen datos personales (nombres, correos y comentarios escritos por los usuarios). Restringir su distribución.
