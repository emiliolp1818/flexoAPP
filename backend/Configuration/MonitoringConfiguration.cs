using Microsoft.ApplicationInsights.Extensibility;
using Serilog;
using Serilog.Events;
using Serilog.Sinks.MSSqlServer;
using StackExchange.Profiling;
using System.Collections.ObjectModel;
using System.Data;

namespace FlexoAuthBackend.Configuration
{
    public static class MonitoringConfiguration
    {
        public static void ConfigureApplicationInsights(this IServiceCollection services, IConfiguration configuration)
        {
            var instrumentationKey = configuration["ApplicationInsights:InstrumentationKey"];
            
            if (!string.IsNullOrEmpty(instrumentationKey))
            {
                services.AddApplicationInsightsTelemetry(options =>
                {
                    options.InstrumentationKey = instrumentationKey;
                    options.EnableAdaptiveSampling = true;
                    options.EnableQuickPulseMetricStream = true;
                    options.EnableAuthenticationTrackingJavaScript = true;
                    options.EnableDependencyTrackingTelemetryModule = true;
                    options.EnablePerformanceCounterCollectionModule = true;
                });

                // Configurar filtros de telemetría
                services.AddSingleton<ITelemetryInitializer, CustomTelemetryInitializer>();
                
                // Configurar sampling
                services.Configure<TelemetryConfiguration>(telemetryConfig =>
                {
                    var builder = telemetryConfig.DefaultTelemetrySink.TelemetryProcessorChainBuilder;
                    builder.UseAdaptiveSampling(maxTelemetryItemsPerSecond: 5);
                    builder.Build();
                });
            }
        }

        public static void ConfigureSerilog(this IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
        {
            var connectionString = configuration.GetConnectionString("FlexoBD");
            
            var loggerConfig = new LoggerConfiguration()
                .MinimumLevel.Information()
                .MinimumLevel.Override("Microsoft", LogLevel.Warning)
                .MinimumLevel.Override("Microsoft.EntityFrameworkCore.Database.Command", LogLevel.Information) // SQL queries
                .Enrich.FromLogContext()
                .Enrich.WithProperty("Application", "FlexoAuthBackend")
                .Enrich.WithProperty("Environment", environment.EnvironmentName);

            // Console logging
            loggerConfig.WriteTo.Console(
                outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}");

            // File logging
            loggerConfig.WriteTo.File(
                path: "logs/flexoauth-.log",
                rollingInterval: RollingInterval.Day,
                retainedFileCountLimit: 30,
                fileSizeLimitBytes: 100_000_000, // 100MB
                rollOnFileSizeLimit: true,
                outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}");

            // Database logging para errores críticos
            if (!string.IsNullOrEmpty(connectionString))
            {
                var columnOptions = new ColumnOptions
                {
                    AdditionalColumns = new Collection<SqlColumn>
                    {
                        new SqlColumn("UserName", SqlDbType.NVarChar) { DataLength = 64 },
                        new SqlColumn("RequestId", SqlDbType.NVarChar) { DataLength = 64 },
                        new SqlColumn("RequestPath", SqlDbType.NVarChar) { DataLength = 256 },
                        new SqlColumn("SourceContext", SqlDbType.NVarChar) { DataLength = 256 }
                    }
                };

                loggerConfig.WriteTo.MSSqlServer(
                    connectionString: connectionString,
                    sinkOptions: new MSSqlServerSinkOptions
                    {
                        TableName = "Logs",
                        SchemaName = "dbo",
                        AutoCreateSqlTable = true,
                        BatchPostingLimit = 50,
                        Period = TimeSpan.FromSeconds(5)
                    },
                    restrictedToMinimumLevel: LogEventLevel.Warning,
                    columnOptions: columnOptions);
            }

            // Seq logging si está configurado
            var seqUrl = configuration["Serilog:SeqUrl"];
            if (!string.IsNullOrEmpty(seqUrl))
            {
                loggerConfig.WriteTo.Seq(seqUrl);
            }

            // Application Insights si está configurado
            var instrumentationKey = configuration["ApplicationInsights:InstrumentationKey"];
            if (!string.IsNullOrEmpty(instrumentationKey))
            {
                loggerConfig.WriteTo.ApplicationInsights(instrumentationKey, TelemetryConverter.Traces);
            }

            Log.Logger = loggerConfig.CreateLogger();
            
            services.AddSingleton(Log.Logger);
            services.AddLogging(builder => builder.AddSerilog());
        }

        public static void ConfigureMiniProfiler(this IServiceCollection services, IConfiguration configuration)
        {
            var enableProfiler = configuration.GetValue<bool>("MiniProfiler:Enabled", false);
            
            if (enableProfiler)
            {
                services.AddMiniProfiler(options =>
                {
                    options.RouteBasePath = "/profiler";
                    options.PopupRenderPosition = RenderPosition.Left;
                    options.PopupShowTimeWithChildren = true;
                    options.PopupShowTrivial = false;
                    options.PopupMaxTracesToShow = 10;
                    
                    // Configurar storage
                    options.Storage = new MemoryCacheStorage(TimeSpan.FromMinutes(60));
                    
                    // Configurar qué perfilar
                    options.TrackConnectionOpenClose = true;
                    options.EnableDebugMode = configuration.GetValue<bool>("MiniProfiler:EnableDebugMode", false);
                    
                    // Filtros de seguridad
                    options.ResultsAuthorize = request => 
                    {
                        // Solo en desarrollo o para usuarios autorizados
                        return request.HttpContext.User.IsInRole("Admin") || 
                               configuration.GetValue<bool>("MiniProfiler:AllowAnonymous", false);
                    };
                    
                    options.ResultsListAuthorize = options.ResultsAuthorize;
                    
                    // Ignorar rutas específicas
                    options.IgnoredPaths.Add("/health");
                    options.IgnoredPaths.Add("/metrics");
                    options.IgnoredPaths.Add("/swagger");
                }).AddEntityFramework();
            }
        }

        public static void ConfigureHealthChecks(this IServiceCollection services, IConfiguration configuration)
        {
            var healthChecksBuilder = services.AddHealthChecks();

            // Health check para base de datos
            var connectionString = configuration.GetConnectionString("FlexoBD");
            if (!string.IsNullOrEmpty(connectionString))
            {
                healthChecksBuilder.AddSqlServer(
                    connectionString,
                    name: "sqlserver",
                    tags: new[] { "database", "sql" });
            }

            // Health check para Redis
            var redisConnectionString = configuration.GetConnectionString("Redis");
            if (!string.IsNullOrEmpty(redisConnectionString))
            {
                healthChecksBuilder.AddRedis(
                    redisConnectionString,
                    name: "redis",
                    tags: new[] { "cache", "redis" });
            }

            // Health check personalizado para memoria
            healthChecksBuilder.AddCheck<MemoryHealthCheck>("memory", tags: new[] { "memory" });
            
            // Health check para disco
            healthChecksBuilder.AddDiskStorageHealthCheck(
                options => options.AddDrive("C:\\", 1024), // 1GB mínimo libre
                name: "disk",
                tags: new[] { "disk" });

            // Configurar UI de health checks
            services.AddHealthChecksUI(options =>
            {
                options.SetEvaluationTimeInSeconds(30);
                options.MaximumHistoryEntriesPerEndpoint(50);
                options.AddHealthCheckEndpoint("FlexoAuth API", "/health");
            }).AddInMemoryStorage();
        }

        public static void UseMonitoring(this WebApplication app, IConfiguration configuration)
        {
            // Usar MiniProfiler si está habilitado
            if (configuration.GetValue<bool>("MiniProfiler:Enabled", false))
            {
                app.UseMiniProfiler();
            }

            // Configurar health checks
            app.MapHealthChecks("/health", new HealthCheckOptions
            {
                ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse,
                ResultStatusCodes =
                {
                    [HealthStatus.Healthy] = StatusCodes.Status200OK,
                    [HealthStatus.Degraded] = StatusCodes.Status200OK,
                    [HealthStatus.Unhealthy] = StatusCodes.Status503ServiceUnavailable
                }
            });

            app.MapHealthChecks("/health/ready", new HealthCheckOptions
            {
                Predicate = check => check.Tags.Contains("ready"),
                ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
            });

            app.MapHealthChecks("/health/live", new HealthCheckOptions
            {
                Predicate = _ => false,
                ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
            });

            // UI de health checks
            app.MapHealthChecksUI(options =>
            {
                options.UIPath = "/health-ui";
                options.ApiPath = "/health-ui-api";
            });

            // Middleware de logging de requests
            app.UseMiddleware<RequestLoggingMiddleware>();
        }
    }

    // Inicializador personalizado de telemetría
    public class CustomTelemetryInitializer : ITelemetryInitializer
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CustomTelemetryInitializer(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public void Initialize(ITelemetry telemetry)
        {
            var context = _httpContextAccessor.HttpContext;
            if (context != null)
            {
                telemetry.Context.User.Id = context.User?.Identity?.Name;
                telemetry.Context.Session.Id = context.Session?.Id;
                
                if (context.Request.Headers.TryGetValue("User-Agent", out var userAgent))
                {
                    telemetry.Context.User.UserAgent = userAgent.FirstOrDefault();
                }
            }
        }
    }

    // Health check personalizado para memoria
    public class MemoryHealthCheck : IHealthCheck
    {
        public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
        {
            var allocatedBytes = GC.GetTotalMemory(false);
            var workingSet = Environment.WorkingSet;
            
            var data = new Dictionary<string, object>
            {
                ["AllocatedBytes"] = allocatedBytes,
                ["WorkingSetBytes"] = workingSet,
                ["Gen0Collections"] = GC.CollectionCount(0),
                ["Gen1Collections"] = GC.CollectionCount(1),
                ["Gen2Collections"] = GC.CollectionCount(2)
            };

            // Considerar unhealthy si usa más de 1GB
            var status = workingSet > 1_000_000_000 ? HealthStatus.Degraded : HealthStatus.Healthy;
            
            return Task.FromResult(new HealthCheckResult(
                status,
                description: $"Working set: {workingSet / 1024 / 1024} MB",
                data: data));
        }
    }

    // Middleware para logging de requests
    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RequestLoggingMiddleware> _logger;

        public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            
            try
            {
                await _next(context);
            }
            finally
            {
                stopwatch.Stop();
                
                var statusCode = context.Response.StatusCode;
                var method = context.Request.Method;
                var path = context.Request.Path;
                var elapsed = stopwatch.ElapsedMilliseconds;
                
                var logLevel = statusCode >= 500 ? LogLevel.Error :
                              statusCode >= 400 ? LogLevel.Warning :
                              elapsed > 1000 ? LogLevel.Warning : LogLevel.Information;

                _logger.Log(logLevel, 
                    "HTTP {Method} {Path} responded {StatusCode} in {Elapsed}ms",
                    method, path, statusCode, elapsed);
            }
        }
    }
}