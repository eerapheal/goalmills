/**
 * GoalMills Production Redis & Multi-Tier Resilient Cache Engine
 * Provides sub-millisecond caching, single-flight request coalescing,
 * in-memory fallback, health diagnostics, and observability metrics.
 */
import Redis from 'ioredis';

// --- Telemetry & Metrics ---
interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  deletions: number;
  errors: number;
  singleFlightSaves: number;
  totalLatencyMs: number;
  latencySamples: number;
}

const metrics: CacheMetrics = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletions: 0,
  errors: 0,
  singleFlightSaves: 0,
  totalLatencyMs: 0,
  latencySamples: 0,
};

// --- In-Memory Fallback Store ---
interface MemoryCacheEntry {
  value: any;
  expiresAt: number;
}
const memoryCache = new Map<string, MemoryCacheEntry>();
const MAX_MEMORY_ENTRIES = 5000;

function pruneMemoryCacheIfNeeded() {
  if (memoryCache.size > MAX_MEMORY_ENTRIES) {
    const now = Date.now();
    for (const [key, entry] of memoryCache.entries()) {
      if (now > entry.expiresAt) {
        memoryCache.delete(key);
      }
    }
    // If still over limit, drop oldest 10%
    if (memoryCache.size > MAX_MEMORY_ENTRIES) {
      const keysToDelete = Array.from(memoryCache.keys()).slice(0, Math.floor(MAX_MEMORY_ENTRIES * 0.1));
      for (const k of keysToDelete) {
        memoryCache.delete(k);
      }
    }
  }
}

// --- Single-Flight Request Deduplication ---
const inFlightRequests = new Map<string, Promise<any>>();

/**
 * Coalesces concurrent calls for the same key into a single execution.
 * Prevents cache stampede when an item expires under high traffic.
 */
export async function singleFlight<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
  const existing = inFlightRequests.get(key);
  if (existing) {
    metrics.singleFlightSaves++;
    return existing as Promise<T>;
  }

  const promise = (async () => {
    try {
      return await fetchFn();
    } finally {
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, promise);
  return promise;
}

// --- Redis Client Initialization ---
let redisClient: Redis | null = null;
let isRedisConnected = false;
let lastConnectionAttempt = 0;
let lastKnownLatencyMs = 0;

function initRedisClient(): Redis | null {
  const redisUrl = process.env.REDIS_URL;
  const redisHost = process.env.REDIS_HOST;

  if (!redisUrl && !redisHost) {
    return null;
  }

  try {
    const options: any = {
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
      lazyConnect: true,
      connectTimeout: 5000,
      retryStrategy(times: number) {
        // Exponential backoff capped at 2000ms
        return Math.min(times * 100, 2000);
      },
    };

    if (redisUrl?.startsWith('rediss://')) {
      options.tls = { rejectUnauthorized: false };
    }

    const client = redisUrl
      ? new Redis(redisUrl, options)
      : new Redis({
          host: redisHost || '127.0.0.1',
          port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
          password: process.env.REDIS_PASSWORD || undefined,
          ...options,
        });

    client.on('connect', () => {
      isRedisConnected = true;
      console.log('⚡ Redis Cache Engine: Connected successfully');
    });

    client.on('ready', () => {
      isRedisConnected = true;
    });

    client.on('error', (err) => {
      isRedisConnected = false;
      metrics.errors++;
      console.warn('⚠️ Redis Cache: Connection error, operating in memory-fallback mode:', err.message);
    });

    client.on('close', () => {
      isRedisConnected = false;
    });

    client.connect().catch((err) => {
      isRedisConnected = false;
      metrics.errors++;
    });

    return client;
  } catch (err: any) {
    console.warn('⚠️ Redis initialization bypassed, fallback to memory cache:', err.message);
    isRedisConnected = false;
    return null;
  }
}

// Singleton across hot-reloads
const globalRedis = globalThis as unknown as {
  __goalmillsRedisClient?: Redis | null;
  __goalmillsRedisConnected?: boolean;
};

if (!globalRedis.__goalmillsRedisClient) {
  globalRedis.__goalmillsRedisClient = initRedisClient();
}
redisClient = globalRedis.__goalmillsRedisClient;

/**
 * Retrieve cached data by key with automatic failover to in-memory store
 */
export async function cacheGet<T = any>(key: string): Promise<T | null> {
  const start = Date.now();

  // 1. Try Redis
  if (redisClient && isRedisConnected) {
    try {
      const data = await redisClient.get(key);
      const elapsed = Date.now() - start;
      metrics.totalLatencyMs += elapsed;
      metrics.latencySamples++;
      lastKnownLatencyMs = elapsed;

      if (data) {
        metrics.hits++;
        return JSON.parse(data) as T;
      }
    } catch (err) {
      metrics.errors++;
      console.warn(`Redis get failed for key "${key}", checking memory fallback`);
    }
  }

  // 2. Fallback to Memory Cache
  const memEntry = memoryCache.get(key);
  if (memEntry) {
    if (Date.now() < memEntry.expiresAt) {
      metrics.hits++;
      return memEntry.value as T;
    }
    memoryCache.delete(key);
  }

  metrics.misses++;
  return null;
}

/**
 * Store data in cache with TTL in seconds (default: 300s / 5 minutes)
 */
export async function cacheSet<T = any>(
  key: string,
  value: T,
  ttlSeconds: number = 300
): Promise<void> {
  const serialized = JSON.stringify(value);
  metrics.sets++;

  // 1. Set in Redis
  if (redisClient && isRedisConnected) {
    try {
      await redisClient.set(key, serialized, 'EX', ttlSeconds);
    } catch (err) {
      metrics.errors++;
      console.warn(`Redis set failed for key "${key}"`);
    }
  }

  // 2. Set in Memory Cache
  pruneMemoryCacheIfNeeded();
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Delete a specific cache key
 */
export async function cacheDel(key: string): Promise<void> {
  metrics.deletions++;
  if (redisClient && isRedisConnected) {
    try {
      await redisClient.del(key);
    } catch (err) {
      metrics.errors++;
      console.warn(`Redis del failed for key "${key}"`);
    }
  }
  memoryCache.delete(key);
}

/**
 * Invalidate all cache keys matching a pattern (e.g. "gm:sport:football:*")
 */
export async function cacheInvalidatePattern(pattern: string): Promise<void> {
  // 1. Invalidate in Redis
  if (redisClient && isRedisConnected) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch (err) {
      metrics.errors++;
      console.warn(`Redis pattern invalidation failed for "${pattern}"`);
    }
  }

  // 2. Invalidate in Memory
  const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
  for (const key of memoryCache.keys()) {
    if (regex.test(key)) {
      memoryCache.delete(key);
    }
  }
}

/**
 * Health check reporting status, latency, memory entries, and hit ratio
 */
export async function getRedisHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unavailable';
  mode: 'redis' | 'in-memory';
  latencyMs: number;
  memoryEntries: number;
  inFlightRequests: number;
  metrics: {
    hits: number;
    misses: number;
    hitRatio: string;
    singleFlightSaves: number;
    errors: number;
  };
}> {
  let status: 'healthy' | 'degraded' | 'unavailable' = 'unavailable';
  let mode: 'redis' | 'in-memory' = 'in-memory';
  let latency = lastKnownLatencyMs;

  if (redisClient && isRedisConnected) {
    try {
      const start = Date.now();
      await redisClient.ping();
      latency = Date.now() - start;
      lastKnownLatencyMs = latency;
      status = latency < 100 ? 'healthy' : 'degraded';
      mode = 'redis';
    } catch {
      status = 'degraded';
      mode = 'in-memory';
    }
  } else if (memoryCache.size > 0) {
    status = 'degraded';
    mode = 'in-memory';
  }

  const totalLookups = metrics.hits + metrics.misses;
  const hitRatio = totalLookups > 0 ? ((metrics.hits / totalLookups) * 100).toFixed(1) + '%' : '100%';

  return {
    status,
    mode,
    latencyMs: latency,
    memoryEntries: memoryCache.size,
    inFlightRequests: inFlightRequests.size,
    metrics: {
      hits: metrics.hits,
      misses: metrics.misses,
      hitRatio,
      singleFlightSaves: metrics.singleFlightSaves,
      errors: metrics.errors,
    },
  };
}

/**
 * Generates SEO-optimized HTTP Cache Headers for CDN Edges & Browsers
 */
export function getSeoCacheHeaders(
  sMaxAge: number = 60,
  staleWhileRevalidate: number = 300
): Record<string, string> {
  return {
    'Cache-Control': `public, s-maxage=${sMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
    'CDN-Cache-Control': `public, s-maxage=${sMaxAge}`,
    Vary: 'Accept-Encoding',
  };
}
