/**
 * GoalMills Cache Client Interface & Telemetry Types
 * Corresponds to Blueprint Section 6.1
 */

export interface CacheClient {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  invalidatePattern(pattern: string): Promise<number>;
  isHealthy(): boolean;
  getTelemetry(): CacheTelemetry;
}

export interface CacheTelemetry {
  mode: 'redis_tls' | 'upstash_rest' | 'in_memory';
  redisConnected: boolean;
  hits: number;
  misses: number;
  hitRatio: number;
  memoryKeyCount: number;
  lastError?: string;
}

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}
