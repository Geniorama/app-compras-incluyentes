# Panel Superadmin

## Crear usuario Superadmin

Para crear un usuario con rol Superadmin:

1. **Crear el usuario en Firebase Auth** (o usar uno existente)
   - Email y contraseña que usarás para el login

2. **Crear/actualizar el documento en Sanity Studio**
   - Tipo: `user`
   - Campos requeridos: `firstName`, `lastName`, `email`, `firebaseUid` (del usuario de Firebase)
   - **Rol**: asignar `superadmin` en el campo `role`
   - El campo `company` puede ser opcional para superadmin (si el esquema lo permite) o referenciar cualquier empresa

3. **Login**
   - Usa la misma página de login (`/login`) que el resto de usuarios
   - Tras iniciar sesión serás redirigido automáticamente a `/superadmin`

## Funcionalidades del Panel

- **Usuarios**: ver listado de todos los usuarios
- **Empresas**: gestionar empresas y aprobar/desactivar para el catálogo
- **Categorías**: crear, editar y eliminar categorías de productos/servicios
- **Estadísticas**: métricas globales (usuarios, empresas, productos, etc.)
- **Exportar**: descargar datos en CSV (usuarios, empresas, categorías)
