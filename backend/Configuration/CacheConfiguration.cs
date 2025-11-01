using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;
using StackExchange.Redis;
using System.Text.Json;

namespace FlexoAuthBackend.Configuration
{
    public static class CacheConfiguration
    {
        public static void ConfigureCache(this IServiceCollection services, IConfiguration configuration)
        {
            var cacheType = configuration.GetValue<string>("Cache:Type", "Memory");
            var defaultExpiration = configuration.GetValue<int>("Cache:DefaultExpirationMinutes", 30);

            switch (cacheType.ToLower())
            {
                case "redis":
                    ConfigureRedisCache(services, configuration);
                    break;
                case "sqlserver":
                    ConfigureSqlServerCache(services, configuration);
                    break;
                default:
                    ConfigureMemoryCache(services, configuration);
                    break;
            }

            // Registrar servicios de caché personalizados
            services.AddSingleton<ICacheService, CacheService>();
            services.Configure<CacheOptions>(configuration.GetSection("Cache"));
        }

        private static void ConfigureMemoryCache(IServiceCollection services, IConfiguration configuration)
        {
            services.AddMemoryCache(options =>
            {
                options.SizeLimit = configuration.GetValue<long>("Cache:Memory:SizeLimit", 100_000_000); // 100MB
                options.CompactionPercentage = configuration.GetValue<double>("Cache:Memory:CompactionPercentage", 0.25);
                options.ExpirationScanFrequency = TimeSpan.FromMinutes(
                    configuration.GetValue<int>("Cache:Memory:ExpirationScanFrequencyMinutes", 5));
            });
        }

        private static void ConfigureRedisCache(IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("Redis");
            
            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException("Redis connection string is required when using Redis cache");
            }

            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = connectionString;
                options.InstanceName = configuration.GetValue<string>("Cache:Redis:InstanceName", "FlexoAuth");
                
                // Configuraciones de conexión
                options.ConfigurationOptions = new ConfigurationOptions
                {
                    EndPoints = { connectionString },
                    AbortOnConnectFail = false,
                    ConnectTimeout = configuration.GetValue<int>("Cache:Redis:ConnectTimeoutMs", 5000),
                    SyncTimeout = configuration.GetValue<int>("Cache:Redis:SyncTimeoutMs", 5000),
                    AsyncTimeout = configuration.GetValue<int>("Cache:Redis:AsyncTimeoutMs", 5000),
                    ConnectRetry = configuration.GetValue<int>("Cache:Redis:ConnectRetry", 3),
                    ReconnectRetryPolicy = new ExponentialRetry(1000),
                    KeepAlive = 60,
                    DefaultDatabase = configuration.GetValue<int>("Cache:Redis:Database", 0)
                };
            });

            // Registrar IConnectionMultiplexer para uso directo
            services.AddSingleton<IConnectionMultiplexer>(provider =>
            {
                var configOptions = ConfigurationOptions.Parse(connectionString);
                return ConnectionMultiplexer.Connect(configOptions);
            });
        }

        private static void ConfigureSqlServerCache(IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("FlexoBD");
            
            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException("SQL Server connection string is required when using SQL Server cache");
            }

            services.AddDistributedSqlServerCache(options =>
            {
                options.ConnectionString = connectionString;
                options.SchemaName = configuration.GetValue<string>("Cache:SqlServer:SchemaName", "dbo");
                options.TableName = configuration.GetValue<string>("Cache:SqlServer:TableName", "CacheEntries");
                options.DefaultSlidingExpiration = TimeSpan.FromMinutes(
                    configuration.GetValue<int>("Cache:DefaultExpirationMinutes", 30));
                options.ExpiredItemsDeletionInterval = TimeSpan.FromMinutes(
                    configuration.GetValue<int>("Cache:SqlServer:ExpiredItemsDeletionIntervalMinutes", 30));
            });
        }
    }

    // Opciones de configuración de caché
    public class CacheOptions
    {
        public string Type { get; set; } = "Memory";
        public int DefaultExpirationMinutes { get; set; } = 30;
        public int ShortExpirationMinutes { get; set; } = 5;
        public int LongExpirationMinutes { get; set; } = 120;
        public bool EnableCompression { get; set; } = true;
        public int CompressionThreshold { get; set; } = 1024; // 1KB
        public string KeyPrefix { get; set; } = "FlexoAuth:";
        
        public MemoryCacheOptions Memory { get; set; } = new();
        public RedisCacheOptions Redis { get; set; } = new();
        public SqlServerCacheOptions SqlServer { get; set; } = new();
    }

    public class MemoryCacheOptions
    {
        public long SizeLimit { get; set; } = 100_000_000; // 100MB
        public double CompactionPercentage { get; set; } = 0.25;
        public int ExpirationScanFrequencyMinutes { get; set; } = 5;
    }

    public class RedisCacheOptions
    {
        public string InstanceName { get; set; } = "FlexoAuth";
        public int Database { get; set; } = 0;
        public int ConnectTimeoutMs { get; set; } = 5000;
        public int SyncTimeoutMs { get; set; } = 5000;
        public int AsyncTimeoutMs { get; set; } = 5000;
        public int ConnectRetry { get; set; } = 3;
    }

    public class SqlServerCacheOptions
    {
        public string SchemaName { get; set; } = "dbo";
        public string TableName { get; set; } = "CacheEntries";
        public int ExpiredItemsDeletionIntervalMinutes { get; set; } = 30;
    }

    // Servicio de caché personalizado
    public interface ICacheService
    {
        Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default);
        Task SetAsync<T>(string key, T value, TimeSpan? expiration = null, CancellationToken cancellationToken = default);
        Task SetAsync<T>(string key, T value, CacheEntryOptions options, CancellationToken cancellationToken = default);
        Task RemoveAsync(string key, CancellationToken cancellationToken = default);
        Task RemoveByPatternAsync(string pattern, CancellationToken cancellationToken = default);
        Task<T> GetOrSetAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiration = null, CancellationToken cancellationToken = default);
        Task RefreshAsync(string key, CancellationToken cancellationToken = default);
        Task<bool> ExistsAsync(string key, CancellationToken cancellationToken = default);
        Task<long> IncrementAsync(string key, long value = 1, TimeSpan? expiration = null, CancellationToken cancellationToken = default);
        Task<double> IncrementAsync(string key, double value, TimeSpan? expiration = null, CancellationToken cancellationToken = default);
    }

    public class CacheService : ICacheService
    {
        private readonly IDistributedCache _distributedCache;
        private readonly IMemoryCache _memoryCache;
        private readonly IConnectionMultiplexer? _redis;
        private readonly CacheOptions _options;
        private readonly ILogger<CacheService> _logger;
        private readonly JsonSerializerOptions _jsonOptions;

        public CacheService(
            IDistributedCache distributedCache,
            IMemoryCache memoryCache,
            IOptions<CacheOptions> options,
            ILogger<CacheService> logger,
            IConnectionMultiplexer? redis = null)
        {
            _distributedCache = distributedCache;
            _memoryCache = memoryCache;
            _redis = redis;
            _options = options.Value;
            _logger = logger;
            
            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = false
            };
        }

        public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
        {
            try
            {
                var fullKey = GetFullKey(key);
                
                // Intentar primero con caché local (L1)
                if (_memoryCache.TryGetValue(fullKey, out T? cachedValue))
                {
                    return cachedValue;
                }

                // Intentar con caché distribuido (L2)
                var bytes = await _distributedCache.GetAsync(fullKey, cancellationToken);
                if (bytes == null) return default;

                var json = System.Text.Encoding.UTF8.GetString(bytes);
                var value = JsonSerializer.Deserialize<T>(json, _jsonOptions);

                // Guardar en caché local para próximas consultas
                _memoryCache.Set(fullKey, value, TimeSpan.FromMinutes(_options.ShortExpirationMinutes));

                return value;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cache value for key: {Key}", key);
                return default;
            }
        }

        public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null, CancellationToken cancellationToken = default)
        {
            var options = new CacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = expiration ?? TimeSpan.FromMinutes(_options.DefaultExpirationMinutes)
            };

            await SetAsync(key, value, options, cancellationToken);
        }

        public async Task SetAsync<T>(string key, T value, CacheEntryOptions options, CancellationToken cancellationToken = default)
        {
            try
            {
                var fullKey = GetFullKey(key);
                var json = JsonSerializer.Serialize(value, _jsonOptions);
                var bytes = System.Text.Encoding.UTF8.GetBytes(json);

                // Comprimir si es necesario
                if (_options.EnableCompression && bytes.Length > _options.CompressionThreshold)
                {
                    bytes = await CompressAsync(bytes);
                }

                var distributedOptions = new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = options.AbsoluteExpirationRelativeToNow,
                    SlidingExpiration = options.SlidingExpiration
                };

                // Guardar en caché distribuido
                await _distributedCache.SetAsync(fullKey, bytes, distributedOptions, cancellationToken);

                // Guardar en caché local
                var memoryOptions = new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = options.AbsoluteExpirationRelativeToNow,
                    SlidingExpiration = options.SlidingExpiration,
                    Priority = CacheItemPriority.Normal,
                    Size = bytes.Length
                };

                _memoryCache.Set(fullKey, value, memoryOptions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting cache value for key: {Key}", key);
            }
        }

        public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
        {
            try
            {
                var fullKey = GetFullKey(key);
                
                // Remover de caché local
                _memoryCache.Remove(fullKey);
                
                // Remover de caché distribuido
                await _distributedCache.RemoveAsync(fullKey, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing cache value for key: {Key}", key);
            }
        }

        public async Task RemoveByPatternAsync(string pattern, CancellationToken cancellationToken = default)
        {
            try
            {
                if (_redis != null)
                {
                    var database = _redis.GetDatabase();
                    var server = _redis.GetServer(_redis.GetEndPoints().First());
                    
                    var fullPattern = GetFullKey(pattern);
                    var keys = server.Keys(pattern: fullPattern);
                    
                    foreach (var key in keys)
                    {
                        await database.KeyDeleteAsync(key);
                        _memoryCache.Remove(key.ToString());
                    }
                }
                else
                {
                    _logger.LogWarning("Pattern removal not supported with current cache provider");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing cache values by pattern: {Pattern}", pattern);
            }
        }

        public async Task<T> GetOrSetAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiration = null, CancellationToken cancellationToken = default)
        {
            var value = await GetAsync<T>(key, cancellationToken);
            
            if (value != null) return value;

            value = await factory();
            
            if (value != null)
            {
                await SetAsync(key, value, expiration, cancellationToken);
            }

            return value;
        }

        public async Task RefreshAsync(string key, CancellationToken cancellationToken = default)
        {
            try
            {
                var fullKey = GetFullKey(key);
                await _distributedCache.RefreshAsync(fullKey, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing cache value for key: {Key}", key);
            }
        }

        public async Task<bool> ExistsAsync(string key, CancellationToken cancellationToken = default)
        {
            try
            {
                var fullKey = GetFullKey(key);
                
                // Verificar caché local primero
                if (_memoryCache.TryGetValue(fullKey, out _))
                {
                    return true;
                }

                // Verificar caché distribuido
                var bytes = await _distributedCache.GetAsync(fullKey, cancellationToken);
                return bytes != null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking cache existence for key: {Key}", key);
                return false;
            }
        }

        public async Task<long> IncrementAsync(string key, long value = 1, TimeSpan? expiration = null, CancellationToken cancellationToken = default)
        {
            try
            {
                if (_redis != null)
                {
                    var database = _redis.GetDatabase();
                    var fullKey = GetFullKey(key);
                    
                    var result = await database.StringIncrementAsync(fullKey, value);
                    
                    if (expiration.HasValue)
                    {
                        await database.KeyExpireAsync(fullKey, expiration.Value);
                    }
                    
                    return result;
                }
                else
                {
                    // Fallback para otros proveedores
                    var currentValue = await GetAsync<long>(key, cancellationToken);
                    var newValue = currentValue + value;
                    await SetAsync(key, newValue, expiration, cancellationToken);
                    return newValue;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error incrementing cache value for key: {Key}", key);
                return 0;
            }
        }

        public async Task<double> IncrementAsync(string key, double value, TimeSpan? expiration = null, CancellationToken cancellationToken = default)
        {
            try
            {
                if (_redis != null)
                {
                    var database = _redis.GetDatabase();
                    var fullKey = GetFullKey(key);
                    
                    var result = await database.StringIncrementAsync(fullKey, value);
                    
                    if (expiration.HasValue)
                    {
                        await database.KeyExpireAsync(fullKey, expiration.Value);
                    }
                    
                    return result;
                }
                else
                {
                    // Fallback para otros proveedores
                    var currentValue = await GetAsync<double>(key, cancellationToken);
                    var newValue = currentValue + value;
                    await SetAsync(key, newValue, expiration, cancellationToken);
                    return newValue;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error incrementing cache value for key: {Key}", key);
                return 0;
            }
        }

        private string GetFullKey(string key)
        {
            return $"{_options.KeyPrefix}{key}";
        }

        private static async Task<byte[]> CompressAsync(byte[] data)
        {
            using var output = new MemoryStream();
            using (var gzip = new System.IO.Compression.GZipStream(output, System.IO.Compression.CompressionMode.Compress))
            {
                await gzip.WriteAsync(data);
            }
            return output.ToArray();
        }
    }

    // Opciones para entradas de caché
    public class CacheEntryOptions
    {
        public TimeSpan? AbsoluteExpirationRelativeToNow { get; set; }
        public TimeSpan? SlidingExpiration { get; set; }
        public CacheItemPriority Priority { get; set; } = CacheItemPriority.Normal;
    }

    // Extensiones para facilitar el uso
    public static class CacheExtensions
    {
        public static async Task<T> GetOrSetAsync<T>(this ICacheService cache, string key, Func<T> factory, TimeSpan? expiration = null)
        {
            return await cache.GetOrSetAsync(key, () => Task.FromResult(factory()), expiration);
        }

        public static string GetUserCacheKey(this ICacheService cache, string userId, string suffix)
        {
            return $"user:{userId}:{suffix}";
        }

        public static string GetListCacheKey(this ICacheService cache, string listType, int page, int pageSize, string? searchTerm = null)
        {
            var key = $"list:{listType}:page:{page}:size:{pageSize}";
            if (!string.IsNullOrEmpty(searchTerm))
            {
                key += $":search:{searchTerm.ToLowerInvariant()}";
            }
            return key;
        }
    }
}