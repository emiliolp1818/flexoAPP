using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using FlexoAuthBackend.Data;
using FlexoAuthBackend.Services;
using FlexoAuthBackend.Configuration;
using Serilog;
using Microsoft.Extensions.Options;
using System.Diagnostics;
using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;

var builder = WebApplication.CreateBuilder(args);

// Configurar logging con Serilog
builder.Services.ConfigureSerilog(builder.Configuration, builder.Environment);

try
{
    Log.Information("Iniciando FlexoAuthBackend...");

    // Configurar servicios básicos
    builder.Services.AddControllers();
    builder.Services.AddHttpContextAccessor();

    // Configurar base de datos con optimizaciones
    builder.Services.ConfigureDatabase(builder.Configuration, builder.Environment);
    builder.Services.ConfigureSharding(builder.Configuration);

    // Configurar caché (Memory + Redis)
    builder.Services.ConfigureCache(builder.Configuration);

    // Configurar escalabilidad
    builder.Services.ConfigureScalability(builder.Configuration);
    builder.Services.ConfigureLoadBalancing(builder.Configuration);

    // Configurar monitoreo
    builder.Services.ConfigureApplicationInsights(builder.Configuration);
    builder.Services.ConfigureMiniProfiler(builder.Configuration);
    builder.Services.ConfigureHealthChecks(builder.Configuration);

    // JWT Authentication
    var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured");
    var key = Encoding.ASCII.GetBytes(jwtKey);

    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = builder.Configuration["Jwt:Issuer"],
                ValidateAudience = true,
                ValidAudience = builder.Configuration["Jwt:Audience"],
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };
        });

    // CORS optimizado
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowAngular", policy =>
        {
            if (builder.Environment.EnvironmentName == "Network" || builder.Environment.IsDevelopment())
            {
                policy.AllowAnyOrigin()
                      .AllowAnyHeader()
                      .AllowAnyMethod();
            }
            else
            {
                // En producción, configurar orígenes específicos
                var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() 
                    ?? new[] { "https://flexoapp.com", "https://www.flexoapp.com" };
                
                policy.WithOrigins(allowedOrigins)
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
            }
        });
    });

    // Business services
    builder.Services.AddScoped<AuthService>();
    builder.Services.AddScoped<UsuarioService>();

    // Configurar métricas con Prometheus
    builder.Services.AddSingleton<PrometheusMetrics>();
    builder.Services.AddSingleton<ICacheMetrics, CacheMetrics>();

    var app = builder.Build();

    // Configurar pipeline de middleware
    if (app.Environment.IsDevelopment())
    {
        app.UseDeveloperExceptionPage();
    }
    else
    {
        app.UseExceptionHandler("/Error");
        app.UseHsts();
    }

    // Configurar escalabilidad y monitoreo
    app.UseScalability();
    app.UseMonitoring(builder.Configuration);

    // Pipeline estándar
    app.UseHttpsRedirection();
    app.UseCors("AllowAngular");
    app.UseAuthentication();
    app.UseAuthorization();

    // Mapear controladores
    app.MapControllers();

    // Endpoint de métricas para Prometheus
    app.MapGet("/metrics", async (PrometheusMetrics metrics) =>
    {
        return Results.Text(await metrics.GetMetricsAsync(), "text/plain");
    });

    // Endpoint de información del sistema
    app.MapGet("/info", () =>
    {
        return Results.Ok(new
        {
            Application = "FlexoAuthBackend",
            Version = "1.0.0",
            Environment = app.Environment.EnvironmentName,
            MachineName = Environment.MachineName,
            ProcessorCount = Environment.ProcessorCount,
            WorkingSet = Environment.WorkingSet,
            GCMemory = GC.GetTotalMemory(false),
            Uptime = DateTime.UtcNow - Process.GetCurrentProcess().StartTime.ToUniversalTime()
        });
    });

    Log.Information("FlexoAuthBackend iniciado exitosamente en {Environment}", app.Environment.EnvironmentName);
    
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

// Clase para métricas de Prometheus
public class PrometheusMetrics
{
    private readonly ILogger<PrometheusMetrics> _logger;
    private readonly ICacheMetrics _cacheMetrics;

    public PrometheusMetrics(ILogger<PrometheusMetrics> logger, ICacheMetrics cacheMetrics)
    {
        _logger = logger;
        _cacheMetrics = cacheMetrics;
    }

    public async Task<string> GetMetricsAsync()
    {
        var cacheStats = _cacheMetrics.GetStatistics();
        var process = Process.GetCurrentProcess();
        
        var metrics = new StringBuilder();
        
        // Métricas de caché
        metrics.AppendLine($"# HELP cache_hits_total Total cache hits");
        metrics.AppendLine($"# TYPE cache_hits_total counter");
        metrics.AppendLine($"cache_hits_total {cacheStats.TotalHits}");
        
        metrics.AppendLine($"# HELP cache_misses_total Total cache misses");
        metrics.AppendLine($"# TYPE cache_misses_total counter");
        metrics.AppendLine($"cache_misses_total {cacheStats.TotalMisses}");
        
        metrics.AppendLine($"# HELP cache_hit_rate Cache hit rate percentage");
        metrics.AppendLine($"# TYPE cache_hit_rate gauge");
        metrics.AppendLine($"cache_hit_rate {cacheStats.HitRate:F2}");
        
        // Métricas del sistema
        metrics.AppendLine($"# HELP process_working_set_bytes Process working set in bytes");
        metrics.AppendLine($"# TYPE process_working_set_bytes gauge");
        metrics.AppendLine($"process_working_set_bytes {Environment.WorkingSet}");
        
        metrics.AppendLine($"# HELP dotnet_gc_memory_bytes GC memory in bytes");
        metrics.AppendLine($"# TYPE dotnet_gc_memory_bytes gauge");
        metrics.AppendLine($"dotnet_gc_memory_bytes {GC.GetTotalMemory(false)}");
        
        metrics.AppendLine($"# HELP process_cpu_seconds_total Total CPU seconds");
        metrics.AppendLine($"# TYPE process_cpu_seconds_total counter");
        metrics.AppendLine($"process_cpu_seconds_total {process.TotalProcessorTime.TotalSeconds:F2}");

        return metrics.ToString();
    }
}