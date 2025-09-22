# FlexoApp Backend - C# .NET Core

Este es el backend para la aplicación FlexoApp desarrollado en C# con .NET Core y Entity Framework.

## Configuración del Proyecto

### 1. Crear el proyecto .NET Core

```bash
dotnet new webapi -n FlexoApp.API
cd FlexoApp.API
```

### 2. Instalar paquetes NuGet necesarios

```bash
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Microsoft.AspNetCore.Cors
dotnet add package Swashbuckle.AspNetCore
```

### 3. Configurar la base de datos

1. Ejecutar el script `Database/CreateTables.sql` en SQL Server Management Studio
2. Actualizar la cadena de conexión en `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=FlexoApp;Trusted_Connection=true;TrustServerCertificate=true;"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

### 4. Configurar DbContext

Crear `Data/ApplicationDbContext.cs`:

```csharp
using Microsoft.EntityFrameworkCore;
using FlexoApp.Models;

namespace FlexoApp.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<WorkOrder> WorkOrders { get; set; }
        public DbSet<Machine> Machines { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuraciones adicionales si es necesario
            modelBuilder.Entity<WorkOrder>()
                .HasOne(w => w.MachineNavigation)
                .WithMany(m => m.WorkOrders)
                .HasForeignKey(w => w.Maquina)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
```

### 5. Configurar Program.cs

```csharp
using Microsoft.EntityFrameworkCore;
using FlexoApp.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configurar Entity Framework
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configurar CORS para permitir conexiones desde Angular
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:4200")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAngularApp");
app.UseAuthorization();
app.MapControllers();

app.Run();
```

### 6. Ejecutar el proyecto

```bash
dotnet run
```

El API estará disponible en:
- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:5001`
- Swagger UI: `https://localhost:5001/swagger`

## Endpoints Disponibles

### WorkOrders (Programas de Producción)

- `GET /api/workorders` - Obtener todos los programas
- `GET /api/workorders/{id}` - Obtener programa por ID
- `GET /api/workorders/machine/{machineNumber}` - Obtener programas por máquina
- `POST /api/workorders` - Crear nuevo programa
- `PUT /api/workorders/{id}` - Actualizar programa
- `DELETE /api/workorders/{id}` - Eliminar programa

### Machines

- `GET /api/machines` - Obtener todas las máquinas
- `GET /api/machines/{numero}` - Obtener máquina por número
- `PUT /api/machines/{numero}` - Actualizar máquina

## Estructura de Datos

### WorkOrder (Programa de Producción)

```json
{
  "id": 1,
  "articulo": "F203456",
  "otSap": "296571",
  "cliente": "Productos Vicky",
  "referencia": "Kythos Mixtos Natural",
  "td": "R",
  "colores": 8,
  "kilosSustrato": 250,
  "kilos": 1200,
  "estado": "listo",
  "motivoSuspension": null,
  "maquina": 11,
  "sustrato": "BOPP Sell Transp",
  "coloresDetalle": "[{\"nombre\":\"Amarillo\",\"hex\":\"#FFFF00\",\"tipo\":\"primario\"}]",
  "fechaCreacion": "2024-01-01T00:00:00Z",
  "fechaActualizacion": "2024-01-01T00:00:00Z",
  "usuarioActualizacion": "admin"
}
```

### Machine

```json
{
  "numero": 11,
  "nombre": "Máquina #11",
  "estado": "activa",
  "eficiencia": 94.2,
  "horasOperacion": 156,
  "fechaActualizacion": "2024-01-01T00:00:00Z"
}
```

## Características Implementadas

- ✅ CRUD completo para programas de producción
- ✅ Gestión de máquinas
- ✅ Validaciones de datos
- ✅ Timestamps automáticos
- ✅ Relaciones entre tablas
- ✅ CORS configurado para Angular
- ✅ Swagger para documentación
- ✅ Índices para optimización
- ✅ Triggers para auditoría

## Próximas Mejoras

- [ ] SignalR para actualizaciones en tiempo real
- [ ] Autenticación y autorización
- [ ] Logging avanzado
- [ ] Caché con Redis
- [ ] Pruebas unitarias
- [ ] Docker containerization