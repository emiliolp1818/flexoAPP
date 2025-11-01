using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using FlexoAuthBackend.Data;
using FlexoAuthBackend.Services;
using Serilog;
using Microsoft.OpenApi.Models;
using System.Diagnostics;

var builder = WebApplication.CreateBuilder(args);

// Configurar Serilog básico
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/flexoauth-.log", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

try
{
    Log.Information("Iniciando FlexoAuthBackend...");

    // Servicios básicos
    builder.Services.AddControllers();
    builder.Services.AddHttpContextAccessor();

    // Base de datos
    var connectionString = builder.Configuration.GetConnectionString("FlexoBD");
    builder.Services.AddDbContext<FlexoDbContext>(options =>
        options.UseSqlServer(connectionString));

    // Caché Redis
    var redisConnectionString = builder.Configuration.GetConnectionString("Redis");
    if (!string.IsNullOrEmpty(redisConnectionString))
    {
        builder.Services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = redisConnectionString;
        });
    }
    else
    {
        builder.Services.AddMemoryCache();
    }

    // JWT Authentication
    var jwtKey = builder.Configuration["Jwt:Key"] ?? "FlexoAuthSecretKey2024!@#$%^&*()_+SuperSecure";
    var key = Encoding.ASCII.GetBytes(jwtKey);

    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };
        });

    // CORS
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowAll", policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
    });

    // Business services
    builder.Services.AddScoped<AuthService>();
    builder.Services.AddScoped<UsuarioService>();

    // Health Checks básicos
    builder.Services.AddHealthChecks()
        .AddDbContextCheck<FlexoDbContext>();

    // Swagger
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "FlexoAuth API",
            Version = "v1.0",
            Description = "Sistema de autenticación empresarial"
        });

        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Description = "JWT Authorization header. Ejemplo: \"Authorization: Bearer {token}\"",
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.ApiKey,
            Scheme = "Bearer"
        });

        c.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });
    });

    // Compresión de respuestas
    builder.Services.AddResponseCompression();

    var app = builder.Build();

    // Pipeline de middleware
    if (app.Environment.IsDevelopment())
    {
        app.UseDeveloperExceptionPage();
    }

    // Swagger siempre disponible
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "FlexoAuth API v1.0");
        c.RoutePrefix = "swagger";
    });

    app.UseResponseCompression();
    app.UseHttpsRedirection();
    app.UseCors("AllowAll");
    app.UseAuthentication();
    app.UseAuthorization();

    // Health checks
    app.MapHealthChecks("/health");

    // Controladores
    app.MapControllers();

    // Endpoint de información
    app.MapGet("/info", () =>
    {
        return Results.Ok(new
        {
            Application = "FlexoAuthBackend",
            Version = "1.0.0",
            Environment = app.Environment.EnvironmentName,
            Timestamp = DateTime.UtcNow
        });
    });

    Log.Information("FlexoAuthBackend iniciado exitosamente");
    
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Error fatal al iniciar FlexoAuthBackend");
    throw;
}
finally
{
    Log.CloseAndFlush();
}