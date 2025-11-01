using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

namespace FlexoAuthBackend.Services
{
    public interface ICacheService
    {
        Task<T?> GetAsync<T>(string key) where T : class;
        Task SetAsync<T>(string key, T value, TimeSpan? expiration = null) where T : class;
        Task RemoveAsync(string key);
        Task RemoveByPatternAsync(string pattern);
    }

    public class CacheService : ICacheService
    {
        private readonly IMemoryCache _memoryCache;
        private readonly IDistributedCache? _distributedCache;
        private readonly ILogger<CacheService> _logger;
        private readonly JsonSerializerOptions _jsonOptions;

        public CacheService(
            IMemoryCache memoryCache, 
            ILogger<CacheService> logger,
            IDistributedCache? distributedCache = null)
        {
            _memoryCache = memoryCache;
            _distributedCache = distributedCache;
            _logger = logger;
            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = false
            };
        }

        public async Task<T?> GetAsync<T>(string key) where T : class
        {
            try
            {
                // Intentar primero con caché en memoria (más rápido)
                if (_memoryCache.TryGetValue(key, out T? cachedValue))
                {
                    _logger.LogDebug("Cache hit (memory): {Key}", key);
                    return cachedValue;
                }

                // Si no está en memoria, intentar con caché distribuido
                if (_distributedCache != null)
                {
                    var distributedValue = await _distributedCache.GetStringAsync(key);
                    if (!string.IsNullOrEmpty(distributedValue))
                    {
                        var deserializedValue = JsonSerializer.Deserialize<T>(distributedValue, _jsonOptions);
                        
                        // Guardar en memoria para próximas consultas
                        _memoryCache.Set(key, deserializedValue, TimeSpan.FromMinutes(5));
                        
                        _logger.LogDebug("Cache hit (distributed): {Key}", key);
                        return deserializedValue;
                    }
                }

                _logger.LogDebug("Cache miss: {Key}", key);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cache value for key: {Key}", key);
                return null;
            }
        }

        public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null) where T : class
        {
            try
            {
                var defaultExpiration = expiration ?? TimeSpan.FromMinutes(30);

                // Guardar en memoria
                _memoryCache.Set(key, value, defaultExpiration);

                // Guardar en caché distribuido si está disponible
                if (_distributedCache != null)
                {
                    var serializedValue = JsonSerializer.Serialize(value, _jsonOptions);
                    var options = new DistributedCacheEntryOptions
                    {
                        AbsoluteExpirationRelativeToNow = defaultExpiration
                    };
                    
                    await _distributedCache.SetStringAsync(key, serializedValue, options);
                }

                _logger.LogDebug("Cache set: {Key} (expires in {Expiration})", key, defaultExpiration);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting cache value for key: {Key}", key);
            }
        }

        public async Task RemoveAsync(string key)
        {
            try
            {
                _memoryCache.Remove(key);
                
                if (_distributedCache != null)
                {
                    await _distributedCache.RemoveAsync(key);
                }

                _logger.LogDebug("Cache removed: {Key}", key);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing cache value for key: {Key}", key);
            }
        }

        public async Task RemoveByPatternAsync(string pattern)
        {
            try
            {
                // Para caché en memoria, necesitaríamos implementar un mecanismo de tracking de keys
                // Por simplicidad, aquí solo limpiamos todo el caché en memoria
                if (_memoryCache is MemoryCache mc)
                {
                    mc.Clear();
                }

                // Para caché distribuido, esto dependería de la implementación (Redis, etc.)
                // Redis soporta patrones con KEYS o SCAN
                
                _logger.LogDebug("Cache cleared by pattern: {Pattern}", pattern);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing cache by pattern: {Pattern}", pattern);
            }
        }
    }

    // Servicio específico para caché de usuarios
    public class UsuarioCacheService
    {
        private readonly ICacheService _cacheService;
        private const string USER_CACHE_PREFIX = "user:";
        private const string STATS_CACHE_KEY = "user:stats";
        private const string ROLES_CACHE_KEY = "user:roles";

        public UsuarioCacheService(ICacheService cacheService)
        {
            _cacheService = cacheService;
        }

        public async Task<T?> GetUsuarioAsync<T>(string codigoUsuario) where T : class
        {
            return await _cacheService.GetAsync<T>($"{USER_CACHE_PREFIX}{codigoUsuario}");
        }

        public async Task SetUsuarioAsync<T>(string codigoUsuario, T usuario, TimeSpan? expiration = null) where T : class
        {
            await _cacheService.SetAsync($"{USER_CACHE_PREFIX}{codigoUsuario}", usuario, expiration ?? TimeSpan.FromMinutes(15));
        }

        public async Task RemoveUsuarioAsync(string codigoUsuario)
        {
            await _cacheService.RemoveAsync($"{USER_CACHE_PREFIX}{codigoUsuario}");
        }

        public async Task<T?> GetStatsAsync<T>() where T : class
        {
            return await _cacheService.GetAsync<T>(STATS_CACHE_KEY);
        }

        public async Task SetStatsAsync<T>(T stats) where T : class
        {
            await _cacheService.SetAsync(STATS_CACHE_KEY, stats, TimeSpan.FromMinutes(10));
        }

        public async Task InvalidateStatsAsync()
        {
            await _cacheService.RemoveAsync(STATS_CACHE_KEY);
        }

        public async Task<List<string>?> GetRolesAsync()
        {
            return await _cacheService.GetAsync<List<string>>(ROLES_CACHE_KEY);
        }

        public async Task SetRolesAsync(List<string> roles)
        {
            await _cacheService.SetAsync(ROLES_CACHE_KEY, roles, TimeSpan.FromHours(1));
        }

        // Invalidar caché cuando se modifica un usuario
        public async Task InvalidateUsuarioAsync(string codigoUsuario)
        {
            await RemoveUsuarioAsync(codigoUsuario);
            await InvalidateStatsAsync(); // Las estadísticas también cambian
        }

        // Invalidar todo el caché de usuarios
        public async Task InvalidateAllAsync()
        {
            await _cacheService.RemoveByPatternAsync(USER_CACHE_PREFIX + "*");
            await InvalidateStatsAsync();
        }
    }
}