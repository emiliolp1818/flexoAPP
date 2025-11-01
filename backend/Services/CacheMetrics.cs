using System.Collections.Concurrent;

namespace FlexoAuthBackend.Services
{
    public interface ICacheMetrics
    {
        void RecordHit(string key);
        void RecordMiss(string key);
        void RecordSet(string key, long sizeBytes);
        void RecordRemove(string key);
        CacheStatistics GetStatistics();
        void Reset();
    }

    public class CacheMetrics : ICacheMetrics
    {
        private readonly ConcurrentDictionary<string, CacheKeyMetrics> _keyMetrics = new();
        private long _totalHits = 0;
        private long _totalMisses = 0;
        private long _totalSets = 0;
        private long _totalRemoves = 0;
        private long _totalSizeBytes = 0;
        private readonly object _lock = new object();

        public void RecordHit(string key)
        {
            Interlocked.Increment(ref _totalHits);
            _keyMetrics.AddOrUpdate(key, 
                new CacheKeyMetrics { Hits = 1 },
                (k, existing) => { existing.Hits++; return existing; });
        }

        public void RecordMiss(string key)
        {
            Interlocked.Increment(ref _totalMisses);
            _keyMetrics.AddOrUpdate(key,
                new CacheKeyMetrics { Misses = 1 },
                (k, existing) => { existing.Misses++; return existing; });
        }

        public void RecordSet(string key, long sizeBytes)
        {
            Interlocked.Increment(ref _totalSets);
            Interlocked.Add(ref _totalSizeBytes, sizeBytes);
            
            _keyMetrics.AddOrUpdate(key,
                new CacheKeyMetrics { Sets = 1, SizeBytes = sizeBytes },
                (k, existing) => 
                { 
                    existing.Sets++; 
                    existing.SizeBytes = sizeBytes; 
                    return existing; 
                });
        }

        public void RecordRemove(string key)
        {
            Interlocked.Increment(ref _totalRemoves);
            
            if (_keyMetrics.TryGetValue(key, out var metrics))
            {
                Interlocked.Add(ref _totalSizeBytes, -metrics.SizeBytes);
                _keyMetrics.TryRemove(key, out _);
            }
        }

        public CacheStatistics GetStatistics()
        {
            var totalRequests = _totalHits + _totalMisses;
            var hitRate = totalRequests > 0 ? (_totalHits * 100.0) / totalRequests : 0;

            return new CacheStatistics
            {
                TotalHits = _totalHits,
                TotalMisses = _totalMisses,
                TotalSets = _totalSets,
                TotalRemoves = _totalRemoves,
                TotalRequests = totalRequests,
                HitRate = hitRate,
                TotalSizeBytes = _totalSizeBytes,
                KeyCount = _keyMetrics.Count,
                TopKeys = GetTopKeys()
            };
        }

        public void Reset()
        {
            lock (_lock)
            {
                _keyMetrics.Clear();
                _totalHits = 0;
                _totalMisses = 0;
                _totalSets = 0;
                _totalRemoves = 0;
                _totalSizeBytes = 0;
            }
        }

        private List<CacheKeyStatistics> GetTopKeys()
        {
            return _keyMetrics
                .Select(kvp => new CacheKeyStatistics
                {
                    Key = kvp.Key,
                    Hits = kvp.Value.Hits,
                    Misses = kvp.Value.Misses,
                    Sets = kvp.Value.Sets,
                    SizeBytes = kvp.Value.SizeBytes,
                    HitRate = kvp.Value.Hits + kvp.Value.Misses > 0 
                        ? (kvp.Value.Hits * 100.0) / (kvp.Value.Hits + kvp.Value.Misses) 
                        : 0
                })
                .OrderByDescending(k => k.Hits + k.Misses)
                .Take(10)
                .ToList();
        }
    }

    public class CacheKeyMetrics
    {
        public long Hits { get; set; }
        public long Misses { get; set; }
        public long Sets { get; set; }
        public long SizeBytes { get; set; }
    }

    public class CacheStatistics
    {
        public long TotalHits { get; set; }
        public long TotalMisses { get; set; }
        public long TotalSets { get; set; }
        public long TotalRemoves { get; set; }
        public long TotalRequests { get; set; }
        public double HitRate { get; set; }
        public long TotalSizeBytes { get; set; }
        public int KeyCount { get; set; }
        public List<CacheKeyStatistics> TopKeys { get; set; } = new();
    }

    public class CacheKeyStatistics
    {
        public string Key { get; set; } = string.Empty;
        public long Hits { get; set; }
        public long Misses { get; set; }
        public long Sets { get; set; }
        public long SizeBytes { get; set; }
        public double HitRate { get; set; }
    }
}