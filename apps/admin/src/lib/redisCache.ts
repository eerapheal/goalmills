/**
 * GoalMills Production Redis & Multi-Tier Resilient Cache Engine (Admin Suite)
 * Fully integrated with Upstash Redis (REST & TLS) and In-Memory Fallback.
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
    if (memoryCache.size > MAX_MEMORY_ENTRIES) {
      const keysToDelete = Array.from(memoryCache.keys()).slice(
        0,
        Math.floor(MAX_MEMORY_ENTRIES * 0.1)
      );
      for (const k of keysToDelete) {
        memoryCache.delete(k);
      }
    }
  }
}

// --- Single-Flight Request Deduplication ---
const inFlightRequests = new Map<string, Promise<any>>();

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

// --- Upstash REST Protocol Handler ---
const UPSTASH_REST_URL =
  process.env.UPSTASH_REDIS_REST_URL || 'https://close-arachnid-183720.upstash.io';
const UPSTASH_REST_TOKEN =
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  'gQAAAAAAAs2oAAIgcDJkOWY0MzJjMGE5Zjc0YjVmOTcwMWM3MzdjNTk2YWY4YQ';

async function upstashRestPost(command: string, ...args: any[]): Promise<any> {
  if (process.env.NODE_ENV === 'test' || process.env.VITEST) return null;
  if (!UPSTASH_REST_URL || !UPSTASH_REST_TOKEN) return null;
  try {
    const cleanUrl = UPSTASH_REST_URL.replace(/\/$/, '');
    const res = await fetch(cleanUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${UPSTASH_REST_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([command, ...args]),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.result;
  } catch {
    return null;
  }
}

// --- Redis Client Initialization (ioredis TLS) ---
let redisClient: Redis | null = null;
let isRedisConnected = false;
let lastKnownLatencyMs = 0;

function initRedisClient(): Redis | null {
  const redisUrl =
    process.env.REDIS_URL ||
    'rediss://default:gQAAAAAAAs2oAAIgcDJkOWY0MzJjMGE5Zjc0YjVmOTcwMWM3MzdjNTk2YWY4YQ@close-arachnid-183720.upstash.io:6379';

  try {
    const options: any = {
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
      lazyConnect: true,
      connectTimeout: 5000,
      retryStrategy(times: number) {
        return Math.min(times * 100, 2000);
      },
    };

    if (redisUrl?.startsWith('rediss://')) {
      options.tls = { rejectUnauthorized: false };
    }

    const client = new Redis(redisUrl, options);

    client.on('connect', () => {
      isRedisConnected = true;
    });

    client.on('ready', () => {
      isRedisConnected = true;
    });

    client.on('error', () => {
      isRedisConnected = false;
      metrics.errors++;
    });

    client.on('close', () => {
      isRedisConnected = false;
    });

    client.connect().catch(() => {
      isRedisConnected = false;
      metrics.errors++;
    });

    return client;
  } catch {
    isRedisConnected = false;
    return null;
  }
}

const globalRedis = globalThis as unknown as {
  __goalmillsAdminRedisClient?: Redis | null;
};

if (!globalRedis.__goalmillsAdminRedisClient) {
  globalRedis.__goalmillsAdminRedisClient = initRedisClient();
}
redisClient = globalRedis.__goalmillsAdminRedisClient;

export async function cacheGet<T = any>(key: string): Promise<T | null> {
  const start = Date.now();

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
    } catch {
      metrics.errors++;
    }
  }

  if (UPSTASH_REST_URL && UPSTASH_REST_TOKEN) {
    try {
      const data = await upstashRestPost('GET', key);
      if (data) {
        const elapsed = Date.now() - start;
        metrics.totalLatencyMs += elapsed;
        metrics.latencySamples++;
        lastKnownLatencyMs = elapsed;
        metrics.hits++;
        return (typeof data === 'string' ? JSON.parse(data) : data) as T;
      }
    } catch {
      metrics.errors++;
    }
  }

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

export async function cacheSet<T = any>(key: string, value: T, ttlSeconds = 60): Promise<void> {
  metrics.sets++;
  const serialized = JSON.stringify(value);

  pruneMemoryCacheIfNeeded();
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });

  if (redisClient && isRedisConnected) {
    try {
      await redisClient.setex(key, ttlSeconds, serialized);
    } catch {
      metrics.errors++;
    }
  }

  if (UPSTASH_REST_URL && UPSTASH_REST_TOKEN) {
    try {
      await upstashRestPost('SET', key, serialized, 'EX', ttlSeconds);
    } catch {
      metrics.errors++;
    }
  }
}

export async function cacheDelete(key: string): Promise<void> {
  metrics.deletions++;
  memoryCache.delete(key);

  if (redisClient && isRedisConnected) {
    try {
      await redisClient.del(key);
    } catch {
      metrics.errors++;
    }
  }

  if (UPSTASH_REST_URL && UPSTASH_REST_TOKEN) {
    try {
      await upstashRestPost('DEL', key);
    } catch {
      metrics.errors++;
    }
  }
}

export async function cacheFlushAll(): Promise<void> {
  memoryCache.clear();

  if (redisClient && isRedisConnected) {
    try {
      await redisClient.flushall();
    } catch {
      metrics.errors++;
    }
  }

  if (UPSTASH_REST_URL && UPSTASH_REST_TOKEN) {
    try {
      await upstashRestPost('FLUSHALL');
    } catch {
      metrics.errors++;
    }
  }
}

export async function getCacheDiagnostics(): Promise<{
  status: 'connected' | 'rest_connected' | 'memory_fallback';
  mode: 'redis_tls' | 'upstash_rest' | 'in_memory';
  redisConnected: boolean;
  upstashRestActive: boolean;
  latencyMs: number;
  memoryEntries: number;
  memoryEntriesCount: number;
  inFlightRequests: number;
  metrics: CacheMetrics;
  hitRatioPercent: number;
}> {
  let livePingMs = lastKnownLatencyMs;
  let upstashRestActive = false;

  if (redisClient && isRedisConnected) {
    try {
      const pingStart = Date.now();
      await redisClient.ping();
      livePingMs = Date.now() - pingStart;
      lastKnownLatencyMs = livePingMs;
    } catch {
      isRedisConnected = false;
    }
  }

  if (UPSTASH_REST_URL && UPSTASH_REST_TOKEN) {
    try {
      const pingRes = await upstashRestPost('PING');
      if (pingRes === 'PONG') {
        upstashRestActive = true;
      }
    } catch {
      upstashRestActive = false;
    }
  }

  const totalLookups = metrics.hits + metrics.misses;
  const hitRatioPercent =
    totalLookups > 0 ? parseFloat(((metrics.hits / totalLookups) * 100).toFixed(2)) : 100;

  const mode = isRedisConnected ? 'redis_tls' : upstashRestActive ? 'upstash_rest' : 'in_memory';
  const status = isRedisConnected
    ? 'connected'
    : upstashRestActive
      ? 'rest_connected'
      : 'memory_fallback';

  return {
    status,
    mode,
    redisConnected: isRedisConnected,
    upstashRestActive,
    latencyMs: livePingMs,
    memoryEntries: memoryCache.size,
    memoryEntriesCount: memoryCache.size,
    inFlightRequests: inFlightRequests.size,
    metrics: { ...metrics },
    hitRatioPercent,
  };
}

export const cacheDel = cacheDelete;

/**
 * Invalidate cached keys matching a wildcard pattern (e.g., 'gm:sport:football:*')
 */
export async function cacheInvalidatePattern(pattern: string): Promise<void> {
  if (pattern === '*' || pattern === '') {
    memoryCache.clear();
  } else {
    const regexPattern = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
    for (const key of memoryCache.keys()) {
      if (regexPattern.test(key)) {
        memoryCache.delete(key);
      }
    }
  }

  if (redisClient && isRedisConnected) {
    try {
      if (pattern === '*' || pattern === '') {
        await redisClient.flushall();
      } else {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(...keys);
        }
      }
    } catch {
      metrics.errors++;
    }
  }

  if (UPSTASH_REST_URL && UPSTASH_REST_TOKEN) {
    try {
      if (pattern === '*' || pattern === '') {
        await upstashRestPost('FLUSHALL');
      } else {
        const keys = await upstashRestPost('KEYS', pattern);
        if (Array.isArray(keys) && keys.length > 0) {
          await upstashRestPost('DEL', ...keys);
        }
      }
    } catch {
      metrics.errors++;
    }
  }
}

export const getRedisHealth = getCacheDiagnostics;

export function getSeoCacheHeaders(
  sMaxAgeSeconds = 60,
  staleWhileRevalidateSeconds = 300
): Record<string, string> {
  return {
    'Cache-Control': `public, s-maxage=${sMaxAgeSeconds}, stale-while-revalidate=${staleWhileRevalidateSeconds}`,
    'CDN-Cache-Control': `public, s-maxage=${sMaxAgeSeconds}`,
    'Vercel-CDN-Cache-Control': `public, s-maxage=${sMaxAgeSeconds}`,
  };
}


