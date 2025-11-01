# Ejemplos de Paginación - FlexoApp

## Tipos de Paginación Implementados

### 1. Paginación Tradicional (OFFSET/FETCH)
**Uso recomendado**: Volúmenes pequeños a medianos (<10,000 registros)
**Ventajas**: Permite saltar a cualquier página, fácil navegación
**Desventajas**: Menos eficiente en grandes volúmenes

### 2. Paginación Basada en Cursor
**Uso recomendado**: Grandes volúmenes (>10,000 registros)
**Ventajas**: Muy eficiente, consistente con datos cambiantes
**Desventajas**: Solo navegación secuencial (siguiente/anterior)

## Ejemplos de Uso

### 1. Paginación Tradicional

#### Obtener primera página de usuarios
```http
GET /api/usuario?page=1&pageSize=10
```

#### Buscar usuarios con filtros
```http
GET /api/usuario?page=1&pageSize=20&searchTerm=juan&rol=Operador&activo=true&sortBy=nombre&sortDescending=false
```

#### Respuesta típica:
```json
{
  "items": [
    {
      "codigoUsuario": "admin",
      "nombre": "Administrador",
      "apellidos": "Sistema",
      "nombreCompleto": "Administrador Sistema",
      "correo": "admin@flexospring.com",
      "rol": "Administrador",
      "telefono": "1234567890",
      "permisos": "FULL_ACCESS",
      "imagenPerfil": null,
      "activo": true,
      "fechaCreacion": "2024-11-01T10:00:00Z",
      "fechaUpdate": "2024-11-01T10:00:00Z"
    }
  ],
  "totalCount": 150,
  "page": 1,
  "pageSize": 10,
  "totalPages": 15,
  "hasNextPage": true,
  "hasPreviousPage": false
}
```

### 2. Paginación Basada en Cursor

#### Primera página (sin cursor)
```http
GET /api/usuario/cursor?pageSize=10&sortBy=codigoUsuario&sortDescending=false
```

#### Página siguiente (usando cursor)
```http
GET /api/usuario/cursor?pageSize=10&lastId=user123&sortBy=codigoUsuario&sortDescending=false
```

#### Respuesta típica:
```json
{
  "items": [
    {
      "codigoUsuario": "admin",
      "nombre": "Administrador",
      // ... otros campos
    }
  ],
  "hasNextPage": true,
  "hasPreviousPage": false,
  "nextCursor": "user123",
  "previousCursor": null,
  "pageSize": 10
}
```

### 3. Búsqueda Avanzada

```http
POST /api/usuario/search
Content-Type: application/json

{
  "codigoUsuario": "admin",
  "nombre": "Juan",
  "apellidos": "Pérez",
  "correo": "@flexospring.com",
  "rol": "Operador",
  "activo": true,
  "fechaCreacionDesde": "2024-01-01T00:00:00Z",
  "fechaCreacionHasta": "2024-12-31T23:59:59Z",
  "page": 1,
  "pageSize": 20,
  "sortBy": "fechaCreacion",
  "sortDescending": true
}
```

### 4. Obtener Estadísticas

```http
GET /api/usuario/stats
```

Respuesta:
```json
{
  "totalUsuarios": 1500,
  "usuariosActivos": 1350,
  "usuariosInactivos": 150,
  "porcentajeActivos": 90.0
}
```

### 5. Usuarios por Rol

```http
GET /api/usuario/by-role/Administrador?page=1&pageSize=5
```

## Consideraciones de Rendimiento

### Para Volúmenes Pequeños (<1,000 registros)
- Usar paginación tradicional
- OFFSET/FETCH es suficientemente rápido
- Permite navegación libre entre páginas

### Para Volúmenes Medianos (1,000 - 10,000 registros)
- Paginación tradicional aún viable
- Considerar índices en campos de ordenamiento
- Monitorear rendimiento de consultas

### Para Volúmenes Grandes (>10,000 registros)
- **Usar paginación basada en cursor**
- Mucho más eficiente
- Evita problemas de consistencia
- Ideal para feeds en tiempo real

## Índices Recomendados

```sql
-- Índice para búsquedas por código de usuario
CREATE INDEX IX_Usuario_CodigoUsuario ON usuario(CodigoUsuario);

-- Índice compuesto para filtros comunes
CREATE INDEX IX_Usuario_Rol_Activo_FechaCreacion 
ON usuario(Rol, Activo, FechaCreacion DESC);

-- Índice para búsquedas de texto
CREATE INDEX IX_Usuario_Nombre_Apellidos 
ON usuario(Nombre, Apellidos);

-- Índice para ordenamiento por fecha
CREATE INDEX IX_Usuario_FechaCreacion 
ON usuario(FechaCreacion DESC);
```

## Mejores Prácticas

### 1. Límites de Página
- Máximo 100 elementos por página
- Por defecto 10 elementos
- Validar parámetros de entrada

### 2. Caché
- Cachear consultas frecuentes
- Usar Redis para resultados de búsqueda
- Invalidar caché al modificar datos

### 3. Filtros
- Siempre aplicar filtros antes de paginación
- Usar índices apropiados
- Validar parámetros de filtro

### 4. Ordenamiento
- Siempre incluir campo único en ordenamiento
- Por defecto ordenar por fecha de creación
- Permitir ordenamiento por múltiples campos

### 5. Monitoreo
- Registrar consultas lentas (>1 segundo)
- Monitorear uso de memoria
- Alertas por consultas problemáticas

## Ejemplos de Implementación Frontend

### JavaScript/TypeScript
```typescript
// Paginación tradicional
async function getUsuarios(page: number, pageSize: number, filters?: any) {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
    ...filters
  });
  
  const response = await fetch(`/api/usuario?${params}`);
  return await response.json();
}

// Paginación por cursor
async function getUsuariosCursor(lastId?: string, pageSize: number = 10) {
  const params = new URLSearchParams({
    pageSize: pageSize.toString(),
    ...(lastId && { lastId })
  });
  
  const response = await fetch(`/api/usuario/cursor?${params}`);
  return await response.json();
}
```

### Componente Angular
```typescript
export class UsuarioListComponent {
  usuarios: UsuarioDto[] = [];
  totalCount = 0;
  currentPage = 1;
  pageSize = 10;
  
  async loadUsuarios() {
    const result = await this.usuarioService.getUsuarios(
      this.currentPage, 
      this.pageSize
    );
    
    this.usuarios = result.items;
    this.totalCount = result.totalCount;
  }
  
  nextPage() {
    if (this.currentPage * this.pageSize < this.totalCount) {
      this.currentPage++;
      this.loadUsuarios();
    }
  }
  
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadUsuarios();
    }
  }
}
```