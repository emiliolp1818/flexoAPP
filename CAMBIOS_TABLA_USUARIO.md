# Cambios en la Tabla Usuario - FlexoApp

## Resumen de Modificaciones

Se ha actualizado completamente la estructura de la tabla `usuario` en la base de datos `flexoBD` para incluir más campos y mejorar la gestión de usuarios.

## Nueva Estructura de la Tabla

### Campos Principales
| Campo | Tipo | Longitud | Obligatorio | Descripción |
|-------|------|----------|-------------|-------------|
| CodigoUsuario | nvarchar | 20 | ✅ | Llave primaria, código único del usuario |
| Nombre | nvarchar | 20 | ✅ | Nombre del usuario |
| Apellidos | nvarchar | 20 | ✅ | Apellidos del usuario |
| Correo | nvarchar | 50 | ❌ | Correo electrónico (opcional) |
| Rol | nvarchar | 20 | ✅ | Rol del usuario en el sistema |
| Telefono | nvarchar | 15 | ❌ | Número de teléfono (opcional) |
| Contrasena | nvarchar | 255 | ✅ | Contraseña encriptada con BCrypt |
| Permisos | nvarchar | 50 | ✅ | Nivel de permisos del usuario |
| ImagenPerfil | nvarchar | 255 | ❌ | URL o path de la imagen de perfil |
| Activo | bit | - | ✅ | Estado del usuario (activo/inactivo) |
| FechaCreacion | datetime2 | - | ✅ | Fecha de creación automática |
| FechaUpdate | datetime2 | - | ✅ | Fecha de última actualización |

## Cambios en el Código

### 1. Modelo Usuario.cs
- ✅ Actualizado con todos los nuevos campos
- ✅ Propiedades calculadas para compatibilidad
- ✅ Validaciones con Data Annotations

### 2. AuthService.cs
- ✅ Actualizado para usar CodigoUsuario como identificador
- ✅ JWT incluye más información del usuario (rol, permisos, nombre completo)
- ✅ Actualización automática de FechaUpdate en login

### 3. LoginResponse.cs
- ✅ Incluye toda la información del usuario autenticado
- ✅ Campos adicionales: rol, permisos, nombre completo, imagen de perfil

### 4. Nuevos DTOs
- ✅ UsuarioDto para transferencia de datos
- ✅ CrearUsuarioRequest para crear nuevos usuarios
- ✅ ActualizarUsuarioRequest para modificar usuarios
- ✅ CambiarContrasenaRequest para cambio de contraseñas

## Scripts de Base de Datos

### InitializeDatabase.sql
- ✅ Crea la nueva estructura de la tabla
- ✅ Inserta usuarios de prueba (admin y operador)
- ✅ Configuración de índices únicos

### MigrateUsuarioTable.sql
- ✅ Migra datos de la estructura anterior a la nueva
- ✅ Respaldo automático de la tabla anterior
- ✅ Mapeo de campos compatibles

## Usuarios de Prueba

### Administrador
- **Código:** admin
- **Nombre:** Administrador Sistema
- **Rol:** Administrador
- **Permisos:** FULL_ACCESS
- **Contraseña:** admin123

### Operador
- **Código:** operador
- **Nombre:** Juan Pérez
- **Rol:** Operador
- **Permisos:** READ_WRITE
- **Contraseña:** admin123

## Roles y Permisos Sugeridos

### Roles
- **Administrador**: Control total del sistema
- **Supervisor**: Gestión de operaciones y usuarios
- **Operador**: Operación normal del sistema
- **Consultor**: Solo lectura

### Permisos
- **FULL_ACCESS**: Acceso completo
- **READ_WRITE**: Lectura y escritura
- **READ_ONLY**: Solo lectura
- **OPERATOR**: Operaciones básicas

## Compatibilidad

El sistema mantiene compatibilidad con el frontend existente mediante:
- Propiedades calculadas en el modelo Usuario
- Mapeo automático de campos antiguos a nuevos
- JWT con información extendida pero compatible

## Próximos Pasos

1. **Ejecutar script de base de datos** para crear/migrar la tabla
2. **Probar autenticación** con los usuarios de prueba
3. **Implementar gestión de usuarios** (CRUD completo)
4. **Agregar validación de permisos** en endpoints
5. **Implementar cambio de contraseñas** y perfil de usuario

## Archivos Modificados

- `backend/Models/Usuario.cs` - Modelo principal actualizado
- `backend/Models/LoginResponse.cs` - Respuesta extendida
- `backend/Models/UsuarioDto.cs` - Nuevos DTOs
- `backend/Services/AuthService.cs` - Lógica de autenticación
- `backend/Data/FlexoDbContext.cs` - Configuración de EF Core
- `backend/Scripts/InitializeDatabase.sql` - Script de inicialización
- `backend/Scripts/MigrateUsuarioTable.sql` - Script de migración