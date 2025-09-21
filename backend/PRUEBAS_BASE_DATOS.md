# 🧪 Pruebas de Base de Datos - Flexo Spring

## 📋 Pasos para Probar la Base de Datos

### 1. Preparar el Entorno

**Requisitos:**
- MySQL Server ejecutándose
- .NET 8 SDK instalado
- Puerto 3306 disponible para MySQL

### 2. Crear la Base de Datos

```bash
# Opción A: Usar el script automático
backend/test-database.bat

# Opción B: Manual
mysql -u root -p < backend/database/create_database.sql
```

### 3. Iniciar el Backend

```bash
# Navegar al directorio del backend
cd backend/FlexoSpringAPI

# Restaurar dependencias
dotnet restore

# Ejecutar la aplicación
dotnet run
```

### 4. Probar la Conexión

**Opción A: Usar la página de pruebas**
1. Abrir `backend/test-api.html` en el navegador
2. La página probará automáticamente la conexión
3. Usar los botones para probar cada funcionalidad

**Opción B: Usar Swagger**
1. Ir a `https://localhost:7000/swagger`
2. Probar los endpoints disponibles

**Opción C: Usar curl/Postman**
```bash
# Probar conexión
curl -k https://localhost:7000/api/user/test-connection

# Contar usuarios
curl -k https://localhost:7000/api/user/count
```

### 5. Crear el Primer Usuario

**Usando la página de pruebas:**
1. Completar el formulario "Crear Usuario"
2. Hacer clic en "Crear Usuario"

**Usando curl:**
```bash
curl -k -X POST https://localhost:7000/api/user/create \
  -H "Content-Type: application/json" \
  -d '{
    "codigoUsuario": "admin",
    "contrasena": "admin123",
    "nombre": "Administrador",
    "email": "admin@flexospring.com"
  }'
```

### 6. Probar el Login

**Usando la página de pruebas:**
1. Ingresar las credenciales en "Probar Login"
2. Hacer clic en "Probar Login"

**Usando curl:**
```bash
curl -k -X POST https://localhost:7000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "codigoUsuario": "admin",
    "contrasena": "admin123"
  }'
```

## 🔍 Verificaciones de la Base de Datos

### Verificar que la tabla existe:
```sql
USE flexoBD2;
SHOW TABLES;
DESCRIBE usuarios;
```

### Ver usuarios creados:
```sql
SELECT id, codigo_usuario, nombre, email, activo, fecha_creacion FROM usuarios;
```

### Verificar conexión desde MySQL:
```sql
SELECT 'Conexión exitosa a flexoBD2' as mensaje;
```

## 🚨 Solución de Problemas

### Error: "Can't connect to MySQL server"
- Verificar que MySQL esté ejecutándose
- Comprobar el puerto (3306)
- Verificar credenciales en `appsettings.json`

### Error: "Database 'flexoBD2' doesn't exist"
- Ejecutar el script `create_database.sql`
- Verificar permisos del usuario MySQL

### Error: "SSL connection error"
- Agregar `SslMode=None` a la cadena de conexión
- O configurar certificados SSL

### Error: "Access denied for user"
- Verificar usuario y contraseña en `appsettings.json`
- Asegurar que el usuario tenga permisos en la base de datos

## 📊 Resultados Esperados

### Conexión exitosa:
```json
{
  "message": "Conexión exitosa",
  "database": "flexoBD2",
  "tableExists": true,
  "timestamp": "2024-01-XX..."
}
```

### Usuario creado:
```json
{
  "message": "Usuario creado exitosamente",
  "user": {
    "id": 1,
    "codigoUsuario": "admin",
    "nombre": "Administrador",
    "email": "admin@flexospring.com",
    "activo": true
  }
}
```

### Login exitoso:
```json
{
  "success": true,
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "codigoUsuario": "admin",
    "nombre": "Administrador",
    "email": "admin@flexospring.com"
  }
}
```

## 🎯 Próximos Pasos

1. ✅ Verificar conexión a base de datos
2. ✅ Crear primer usuario
3. ✅ Probar login
4. 🔄 Ejecutar Angular con `ng serve`
5. 🔄 Probar login desde la interfaz web