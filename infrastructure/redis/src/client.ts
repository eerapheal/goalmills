import type { CacheClient, CacheTelemetry } from './types';
import { MemoryCacheFallback } from './memoryFallback';

export interface RedisAdapterConfig {
  redisUrl?: string;
  defaultTtlSeconds?: number;
  enableTelemetry?: boolean;
}

/**
 * Standard GoalMills Cache Client implementation with in-memory fallback.
 */
export class CentralizedCacheClient implements CacheClient {
  private memoryFallback = new MemoryCacheFallback();
  private hits = 0;
  private misses = 0;
  private isConnected = false;
  private defaultTtl: number;

  constructor(config?: RedisAdapterConfig) {
    this.defaultTtl = config?.defaultTtlSeconds ?? 60;
  }

  async get<T>(key: string): Promise<T | null> {
    const val = this.memoryFallback.get<T>(key);
    if (val !== null) {
      this.hits++;
      return val;
    }
    this.misses++;
    return null;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const ttl = ttlSeconds ?? this.defaultTtl;
    this.memoryFallback.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    this.memoryFallback.del(key);
  }

  async invalidatePattern(pattern: string): Promise<number> {
    return this.memoryFallback.invalidatePattern(pattern);
  }

  isHealthy(): boolean {
    return true;
  }

  getTelemetry(): CacheTelemetry {
    const total = this.hits + this.misses;
    const hitRatio = total > 0 ? (this.hits / total) * 100 : 0;

    return {
      mode: this.isConnected ? 'redis_tls' : 'in_memory',
      redisConnected: this.isConnected,
      hits: this.hits,
      misses: this.misses,
      hitRatio: Math.round(hitRatio * 100) / 100,
      memoryKeyCount: this.memoryFallback.size(),
    };
  }
}

let defaultInstance: CentralizedCacheClient | null = null;

export function getSharedCacheClient(): CentralizedCacheClient {
  if (!defaultInstance) {
    defaultInstance = new CentralizedCacheClient();
  }
  return defaultInstance;
}
