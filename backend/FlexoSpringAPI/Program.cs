using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using FlexoSpringAPI.Data;
using FlexoSpringAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database configuration
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<FlexoDbContext>(options =>
    options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 21))));

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"];
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtKey ?? "")),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        };
    });

// Services
builder.Services.AddScoped<IAuthService, AuthService>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
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
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Ensure database is created and seeded
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<FlexoDbContext>();
    try
    {
        // Create database if it doesn't exist
        context.Database.EnsureCreated();
        
        // Check if admin user exists, if not create it
        if (!context.Users.Any(u => u.CodigoUsuario == "admin"))
        {
            var adminUser = new FlexoSpringAPI.Models.User
            {
                CodigoUsuario = "admin",
                Contrasena = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Nombre = "Administrador",
                Apellido = "Sistema",
                Rol = "admin",
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };
            
            context.Users.Add(adminUser);
            context.SaveChanges();
            
            Console.WriteLine("✅ Usuario admin creado exitosamente");
        }
        else
        {
            Console.WriteLine("✅ Usuario admin ya existe");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Error al configurar base de datos: {ex.Message}");
    }
}

app.Run();