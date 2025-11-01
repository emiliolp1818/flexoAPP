using Microsoft.AspNetCore.ResponseCompression;
using System.IO.Compression;

namespace FlexoAuthBackend.Configuration
{
    public static class ScalabilityConfiguration
    {
        public static void ConfigureScalability(this IServiceCollection services, IConfiguration configuration)
        {
            // Configurar compresión de respuestas
            services.AddResponseCompression(options =>
            {
                options.EnableForHttps = true;
                options.Providers.Add<BrotliCompressionProvider>();
                options.Providers.Add<GzipCompressionProvider>();
                options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(new[]
                {
                    "application/json",
                    "text/json",
                    "application/javascript",
                    "text/css",
                    "text/html"
                });
            });

            services.Configure<BrotliCompressionProviderOptions>(options =>
            {
                options.Level = CompressionLevel.Optimal;
            });

            services.Configure<GzipCompressionProviderOptions>(options =>
            {
                options.Level = CompressionLevel.SmallestSize;
            });

            // Configurar rate limiting
            services.AddRateLimiter(options =>
            {
                options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: context.User?.Identity?.Name ?? context.Request.Headers.Host.ToString(),
                        factory: partition => new FixedWindowRateLimiterOptions
                        {
                            AutoReplenishment = true,
                            PermitLimit = configuration.GetValue<int>("RateLimit:PermitLimit", 100),
                            Window = TimeSpan.FromMinutes(configuration.GetValue<int>("RateLimit:WindowMinutes", 1))
                        }));

                options.OnRejected = async (context, token) =>
                {
                    context.HttpContext.Response.StatusCode = 429;
                    await context.HttpContext.Response.WriteAsync("Too many requests. Please try again later.", token);
                };
            });

            // Configurar output caching
            services.AddOutputCache(options =>
            {
                options.AddBasePolicy(builder => 
                    builder.Expire(TimeSpan.FromMinutes(10)));
                
                options.AddPolicy("UserStats", builder =>
                    builder.Expire(TimeSpan.FromMinutes(5))
                           .SetVaryByQuery("rol", "activo"));
                
                options.AddPolicy("UserList", builder =>
                    builder.Expire(TimeSpan.FromMinutes(2))
                           .SetVaryByQuery("page", "pageSize", "searchTerm"));
            });

            // Configurar connection pooling
            services.Configure<KestrelServerOptions>(options =>
            {
                options.Limits.MaxConcurrentConnections = configuration.GetValue<int>("Kestrel:MaxConnections", 1000);
                options.Limits.MaxConcurrentUpgradedConnections = configuration.GetValue<int>("Kestrel:MaxUpgradedConnections", 100);
                options.Limits.MaxRequestBodySize = configuration.GetValue<long>("Kestrel:MaxRequestBodySize", 30_000_000); // 30MB
                options.Limits.KeepAliveTimeout = TimeSpan.FromMinutes(2);
                options.Limits.RequestHeadersTimeout = TimeSpan.FromSeconds(30);
            });

            // Configurar thread pool
            ThreadPool.SetMinThreads(
                workerThreads: configuration.GetValue<int>("ThreadPool:MinWorkerThreads", Environment.ProcessorCount * 4),
                completionPortThreads: configuration.GetValue<int>("ThreadPool:MinCompletionPortThreads", Environment.ProcessorCount * 4));

            ThreadPool.SetMaxThreads(
                workerThreads: configuration.GetValue<int>("ThreadPool:MaxWorkerThreads", Environment.ProcessorCount * 100),
                completionPortThreads: configuration.GetValue<int>("ThreadPool:MaxCompletionPortThreads", Environment.ProcessorCount * 100));
        }

        public static void ConfigureLoadBalancing(this IServiceCollection services, IConfiguration configuration)
        {
            var loadBalancingEnabled = configuration.GetValue<bool>("LoadBalancing:Enabled");
            
            if (loadBalancingEnabled)
            {
                services.Configure<LoadBalancingOptions>(configuration.GetSection("LoadBalancing"));
                services.AddSingleton<ILoadBalancingService, LoadBalancingService>();
                
                // Configurar session affinity si es necesario
                services.AddDistributedMemoryCache();
                services.AddSession(options =>
                {
                    options.IdleTimeout = TimeSpan.FromMinutes(30);
                    options.Cookie.HttpOnly = true;
                    options.Cookie.IsEssential = true;
                    options.Cookie.SameSite = SameSiteMode.Strict;
                });
            }
        }

        public static void UseScalability(this WebApplication app)
        {
            // Usar compresión
            app.UseResponseCompression();
            
            // Usar rate limiting
            app.UseRateLimiter();
            
            // Usar output caching
            app.UseOutputCache();
            
            // Configurar headers de seguridad y rendimiento
            app.Use(async (context, next) =>
            {
                // Headers de seguridad
                context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
                context.Response.Headers.Add("X-Frame-Options", "DENY");
                context.Response.Headers.Add("X-XSS-Protection", "1; mode=block");
                
                // Headers de rendimiento
                context.Response.Headers.Add("Cache-Control", "public, max-age=300"); // 5 minutos por defecto
                
                await next();
            });
        }
    }

    // Configuración de load balancing
    public class LoadBalancingOptions
    {
        public bool Enabled { get; set; }
        public string Strategy { get; set; } = "RoundRobin"; // RoundRobin, LeastConnections, WeightedRoundRobin
        public ServerNode[] Servers { get; set; } = Array.Empty<ServerNode>();
        public HealthCheckOptions HealthCheck { get; set; } = new();
    }

    public class ServerNode
    {
        public string Id { get; set; } = string.Empty;
        public string Host { get; set; } = string.Empty;
        public int Port { get; set; }
        public int Weight { get; set; } = 1;
        public bool IsActive { get; set; } = true;
        public DateTime LastHealthCheck { get; set; }
        public bool IsHealthy { get; set; } = true;
    }

    public class HealthCheckOptions
    {
        public TimeSpan Interval { get; set; } = TimeSpan.FromSeconds(30);
        public TimeSpan Timeout { get; set; } = TimeSpan.FromSeconds(5);
        public string HealthCheckPath { get; set; } = "/health";
        public int UnhealthyThreshold { get; set; } = 3;
        public int HealthyThreshold { get; set; } = 2;
    }

    // Servicio de load balancing
    public interface ILoadBalancingService
    {
        ServerNode? GetNextServer();
        void MarkServerUnhealthy(string serverId);
        void MarkServerHealthy(string serverId);
        Task<bool> CheckServerHealthAsync(ServerNode server);
        IEnumerable<ServerNode> GetHealthyServers();
    }

    public class LoadBalancingService : ILoadBalancingService
    {
        private readonly LoadBalancingOptions _options;
        private readonly ILogger<LoadBalancingService> _logger;
        private readonly HttpClient _httpClient;
        private int _currentIndex = 0;
        private readonly object _lock = new object();

        public LoadBalancingService(
            IOptions<LoadBalancingOptions> options, 
            ILogger<LoadBalancingService> logger,
            HttpClient httpClient)
        {
            _options = options.Value;
            _logger = logger;
            _httpClient = httpClient;
            
            // Iniciar health checks
            _ = Task.Run(StartHealthChecks);
        }

        public ServerNode? GetNextServer()
        {
            var healthyServers = GetHealthyServers().ToArray();
            
            if (!healthyServers.Any())
            {
                _logger.LogWarning("No healthy servers available");
                return null;
            }

            return _options.Strategy.ToLower() switch
            {
                "roundrobin" => GetRoundRobinServer(healthyServers),
                "leastconnections" => GetLeastConnectionsServer(healthyServers),
                "weightedroundrobin" => GetWeightedRoundRobinServer(healthyServers),
                _ => GetRoundRobinServer(healthyServers)
            };
        }

        private ServerNode GetRoundRobinServer(ServerNode[] servers)
        {
            lock (_lock)
            {
                var server = servers[_currentIndex % servers.Length];
                _currentIndex++;
                return server;
            }
        }

        private ServerNode GetLeastConnectionsServer(ServerNode[] servers)
        {
            // Implementación simplificada - en producción necesitarías rastrear conexiones activas
            return servers.OrderBy(s => s.Id.GetHashCode()).First();
        }

        private ServerNode GetWeightedRoundRobinServer(ServerNode[] servers)
        {
            var totalWeight = servers.Sum(s => s.Weight);
            var random = new Random().Next(totalWeight);
            
            var currentWeight = 0;
            foreach (var server in servers)
            {
                currentWeight += server.Weight;
                if (random < currentWeight)
                {
                    return server;
                }
            }
            
            return servers.First();
        }

        public void MarkServerUnhealthy(string serverId)
        {
            var server = _options.Servers.FirstOrDefault(s => s.Id == serverId);
            if (server != null)
            {
                server.IsHealthy = false;
                _logger.LogWarning("Server marked as unhealthy: {ServerId}", serverId);
            }
        }

        public void MarkServerHealthy(string serverId)
        {
            var server = _options.Servers.FirstOrDefault(s => s.Id == serverId);
            if (server != null)
            {
                server.IsHealthy = true;
                _logger.LogInformation("Server marked as healthy: {ServerId}", serverId);
            }
        }

        public async Task<bool> CheckServerHealthAsync(ServerNode server)
        {
            try
            {
                var url = $"http://{server.Host}:{server.Port}{_options.HealthCheck.HealthCheckPath}";
                using var cts = new CancellationTokenSource(_options.HealthCheck.Timeout);
                
                var response = await _httpClient.GetAsync(url, cts.Token);
                server.LastHealthCheck = DateTime.UtcNow;
                
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogDebug(ex, "Health check failed for server {ServerId}", server.Id);
                return false;
            }
        }

        public IEnumerable<ServerNode> GetHealthyServers()
        {
            return _options.Servers.Where(s => s.IsActive && s.IsHealthy);
        }

        private async Task StartHealthChecks()
        {
            while (true)
            {
                try
                {
                    var healthCheckTasks = _options.Servers
                        .Where(s => s.IsActive)
                        .Select(async server =>
                        {
                            var isHealthy = await CheckServerHealthAsync(server);
                            
                            if (isHealthy && !server.IsHealthy)
                            {
                                MarkServerHealthy(server.Id);
                            }
                            else if (!isHealthy && server.IsHealthy)
                            {
                                MarkServerUnhealthy(server.Id);
                            }
                        });

                    await Task.WhenAll(healthCheckTasks);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error during health checks");
                }

                await Task.Delay(_options.HealthCheck.Interval);
            }
        }
    }
}