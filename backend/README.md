# Flexo Spring API - Backend

## Requisitos previos

1. **.NET 8 SDK** - Descargar desde [https://dotnet.microsoft.com/download](https://dotnet.microsoft.com/download)
2. **MySQL Server** - Descargar desde [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)
3. **Visual Studio Code** o **Visual Studio** (opcional)

## Configuración de la base de datos

1. **Instalar MySQL** y asegurarse de que esté ejecutándose en el puerto 3306
2. **Crear la base de datos** ejecutando el script SQL:
   ```bash
   mysql -u root -p < database/create_database.sql
   ```
   
3. **Configurar la conexión** en `appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Database=flexoBD2;User=root;Password=TU_PASSWORD;Port=3306;"
     }
   }
   ```

## Instalación y ejecución

1. **Navegar al directorio del proyecto**:
   ```bash
   cd backend/FlexoSpringAPI
   ```

2. **Restaurar paquetes NuGet**:
   ```bash
   dotnet restore
   ```

3. **Ejecutar la aplicación**:
   ```bash
   dotnet run
   ```

4. **La API estará disponible en**:
   - HTTPS: `https://localhost:7000`
   - HTTP: `http://localhost:5000`
   - Swagger UI: `https://localhost:7000/swagger`

## Usuarios de prueba

La base de datos incluye dos usuarios de prueba:

| Código Usuario | Contraseña | Nombre |
|----------------|------------|---------|
| `admin` | `admin123` | Administrador |
| `emilio` | `emilio123` | Emilio |

## Endpoints disponibles

### Autenticación

- **POST** `/api/auth/login` - Iniciar sesión
  ```json
  {
    "codigoUsuario": "admin",
    "contrasena": "admin123"
  }
  ```

- **POST** `/api/auth/validate` - Validar token JWT

## Estructura del proyecto

```
FlexoSpringAPI/
├── Controllers/          # Controladores de la API
├── Data/                # Contexto de base de datos
├── Models/              # Modelos de datos
├── Services/            # Servicios de negocio
├── Program.cs           # Configuración de la aplicación
└── appsettings.json     # Configuración
```

## Tecnologías utilizadas

- **.NET 8** - Framework principal
- **Entity Framework Core** - ORM
- **MySQL** - Base de datos
- **JWT Bearer** - Autenticación
- **BCrypt** - Encriptación de contraseñas
- **Swagger** - Documentación de API

## Solución de problemas

### Error de conexión a MySQL
- Verificar que MySQL esté ejecutándose
- Comprobar la cadena de conexión en `appsettings.json`
- Asegurarse de que el usuario tenga permisos en la base de datos

### Error de certificado SSL
- En desarrollo, puedes deshabilitar SSL o confiar en el certificado de desarrollo:
  ```bash
  dotnet dev-certs https --trust
  ```

### Puerto ocupado
- Cambiar el puerto en `Properties/launchSettings.json` si es necesario