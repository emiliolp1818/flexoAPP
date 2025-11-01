using Microsoft.EntityFrameworkCore;
using FlexoAuthBackend.Data;

namespace FlexoAuthBackend.Configuration
{
    public static class DatabaseConfiguration
    {
        public static void ConfigureDatabase(this IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
        {
            var connectionString = configuration.GetConnectionString("FlexoBD");
            
            services.AddDbContext<FlexoDbContext>(options =>
            {
                options.UseSqlServer(connectionString, sqlOptions =>
                {
                    // Configuraciones para escalabilidad
                    sqlOptions.CommandTimeout(30); // Timeout de 30 segundos
                    sqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 3,
                        maxRetryDelay: TimeSpan.FromSeconds(5),
                        errorNumbersToAdd: null);
                });

                // Configuraciones de rendimiento
                if (environment.IsDevelopment())
                {
                    options.EnableSensitiveDataLogging();
                    options.EnableDetailedErrors();
                    
                    // Logging de consultas lentas en desarrollo
                    options.LogTo(Console.WriteLine, LogLevel.Information);
                    options.EnableServiceProviderCaching();
                }
                else
                {
                    // En producción, solo errores críticos
                    options.LogTo(Console.WriteLine, LogLevel.Error);
                }

                // Configuraciones globales de rendimiento
                options.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking); // Por defecto NoTracking
            });

            // Pool de conexiones para mejor rendimiento
            services.AddDbContextPool<FlexoDbContext>(options =>
            {
                options.UseSqlServer(connectionString);
            }, poolSize: 128); // Pool de 128 conexiones
        }

        // Configuración para sharding/particionamiento
        public static void ConfigureSharding(this IServiceCollection services, IConfiguration configuration)
        {
            var shardingEnabled = configuration.GetValue<bool>("Database:Sharding:Enabled");
            
            if (shardingEnabled)
            {
                var shards = configuration.GetSection("Database:Sharding:Shards").Get<ShardConfiguration[]>();
                
                services.Configure<ShardingOptions>(options =>
                {
                    options.Enabled = true;
                    options.Shards = shards ?? Array.Empty<ShardConfiguration>();
                    options.ShardingStrategy = configuration.GetValue<string>("Database:Sharding:Strategy") ?? "Hash";
                });

                services.AddSingleton<IShardingService, ShardingService>();
            }
        }
    }

    // Configuración de sharding
    public class ShardingOptions
    {
        public bool Enabled { get; set; }
        public ShardConfiguration[] Shards { get; set; } = Array.Empty<ShardConfiguration>();
        public string ShardingStrategy { get; set; } = "Hash";
    }

    public class ShardConfiguration
    {
        public string Name { get; set; } = string.Empty;
        public string ConnectionString { get; set; } = string.Empty;
        public string[] KeyRanges { get; set; } = Array.Empty<string>();
        public bool IsActive { get; set; } = true;
    }

    // Servicio de sharding
    public interface IShardingService
    {
        string GetShardForUser(string codigoUsuario);
        FlexoDbContext GetContextForShard(string shardName);
        IEnumerable<FlexoDbContext> GetAllShardContexts();
    }

    public class ShardingService : IShardingService
    {
        private readonly ShardingOptions _options;
        private readonly IServiceProvider _serviceProvider;
        private readonly Dictionary<string, FlexoDbContext> _shardContexts;

        public ShardingService(IOptions<ShardingOptions> options, IServiceProvider serviceProvider)
        {
            _options = options.Value;
            _serviceProvider = serviceProvider;
            _shardContexts = new Dictionary<string, FlexoDbContext>();
            
            InitializeShards();
        }

        private void InitializeShards()
        {
            foreach (var shard in _options.Shards.Where(s => s.IsActive))
            {
                var optionsBuilder = new DbContextOptionsBuilder<FlexoDbContext>();
                optionsBuilder.UseSqlServer(shard.ConnectionString);
                
                _shardContexts[shard.Name] = new FlexoDbContext(optionsBuilder.Options);
            }
        }

        public string GetShardForUser(string codigoUsuario)
        {
            if (!_options.Enabled || !_options.Shards.Any())
            {
                return "default";
            }

            // Estrategia de hash simple
            var hash = codigoUsuario.GetHashCode();
            var shardIndex = Math.Abs(hash) % _options.Shards.Length;
            
            return _options.Shards[shardIndex].Name;
        }

        public FlexoDbContext GetContextForShard(string shardName)
        {
            return _shardContexts.TryGetValue(shardName, out var context) 
                ? context 
                : _shardContexts.Values.First(); // Fallback al primer shard
        }

        public IEnumerable<FlexoDbContext> GetAllShardContexts()
        {
            return _shardContexts.Values;
        }
    }
}