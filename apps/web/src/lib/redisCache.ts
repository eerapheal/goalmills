/**
 * High-Performance Redis & In-Memory Fallback Cache Engine
 * Provides sub-millisecond caching for news, video highlights, and SEO endpoints.
 */
import Redis from 'ioredis';

// In-Memory Fallback Store (for local dev or when Redis is offline)
interface MemoryCacheEntry {
  value: any;
  expiresAt: number;
}
const memoryCache = new Map<string, MemoryCacheEntry>();

let redisClient: Redis | null = null;
let isRedisConnected = false;

// Initialize Redis if configured in environment
const redisUrl = process.env.REDIS_URL;
const redisHost = process.env.REDIS_HOST;

if (redisUrl || redisHost) {
  try {
    redisClient = redisUrl
      ? new Redis(redisUrl, {
          maxRetriesPerRequest: 2,
          enableReadyCheck: true,
          lazyConnect: true,
          connectTimeout: 5000,
        })
      : new Redis({
          host: redisHost || '127.0.0.1',
          port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
          password: process.env.REDIS_PASSWORD || undefined,
          maxRetriesPerRequest: 2,
          lazyConnect: true,
          connectTimeout: 5000,
        });

    redisClient.on('connect', () => {
      isRedisConnected = true;
      console.log('⚡ Redis Cache Engine: Connected successfully');
    });

    redisClient.on('error', (err) => {
      isRedisConnected = false;
      // Soft log to avoid crashing on transient connection drops
      console.warn(
        '⚠️ Redis Cache: Connection unavailable, falling back to in-memory cache.',
        err.message
      );
    });

    // Initiate connection asynchronously
    redisClient.connect().catch(() => {
      isRedisConnected = false;
    });
  } catch (err) {
    console.warn('⚠️ Redis initialization bypassed, using resilient memory cache.');
    isRedisConnected = false;
  }
}

/**
 * Retrieve cached data by key
 */
export async function cacheGet<T = any>(key: string): Promise<T | null> {
  // 1. Try Redis if connected
  if (redisClient && isRedisConnected) {
    try {
      const data = await redisClient.get(key);
      if (data) {
        return JSON.parse(data) as T;
      }
    } catch (err) {
      console.warn(`Redis get failed for key "${key}", checking memory fallback`);
    }
  }

  // 2. Fallback to Memory Cache
  const memEntry = memoryCache.get(key);
  if (memEntry) {
    if (Date.now() < memEntry.expiresAt) {
      return memEntry.value as T;
    }
    memoryCache.delete(key);
  }

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

  // 1. Set in Redis
  if (redisClient && isRedisConnected) {
    try {
      await redisClient.set(key, serialized, 'EX', ttlSeconds);
    } catch (err) {
      console.warn(`Redis set failed for key "${key}"`);
    }
  }

  // 2. Set in Memory Cache
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Delete a specific cache key
 */
export async function cacheDel(key: string): Promise<void> {
  if (redisClient && isRedisConnected) {
    try {
      await redisClient.del(key);
    } catch (err) {
      console.warn(`Redis del failed for key "${key}"`);
    }
  }
  memoryCache.delete(key);
}

/**
 * Invalidate all cache keys matching a pattern (e.g. "cache:news:*", "cache:videos:*")
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
