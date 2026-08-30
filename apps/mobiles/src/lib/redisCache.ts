/**
 * GoalMills Mobile Upstash Redis REST Cache Client
 * Enables sub-millisecond query caching, reduced battery/network overhead,
 * and offline fallback for Expo / React Native mobile applications.
 */

const UPSTASH_REST_URL =
  process.env.EXPO_PUBLIC_UPSTASH_REDIS_REST_URL ||
  'https://close-arachnid-183720.upstash.io';

const UPSTASH_REST_TOKEN =
  process.env.EXPO_PUBLIC_UPSTASH_REDIS_REST_TOKEN ||
  'gQAAAAAAAs2oAAIgcDJkOWY0MzJjMGE5Zjc0YjVmOTcwMWM3MzdjNTk2YWY4YQ';

// Local in-memory mobile fallback cache
const localMemoryCache = new Map<string, { value: any; expiresAt: number }>();

async function upstashCommand(command: string, ...args: any[]): Promise<any> {
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
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.result;
  } catch (err) {
    return null;
  }
}

export const mobileCache = {
  /**
   * Get cached entry from Upstash Redis or local memory
   */
  async get<T = any>(key: string): Promise<T | null> {
    // 1. Try local memory first
    const local = localMemoryCache.get(key);
    if (local && Date.now() < local.expiresAt) {
      return local.value as T;
    }

    // 2. Query Upstash REST
    try {
      const data = await upstashCommand('GET', key);
      if (data) {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        localMemoryCache.set(key, { value: parsed, expiresAt: Date.now() + 30000 });
        return parsed as T;
      }
    } catch {}

    return null;
  },

  /**
   * Set cached entry in Upstash Redis and local memory
   */
  async set<T = any>(key: string, value: T, ttlSeconds = 60): Promise<void> {
    localMemoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });

    try {
      const serialized = JSON.stringify(value);
      await upstashCommand('SET', key, serialized, 'EX', ttlSeconds);
    } catch {}
  },

  /**
   * Remove cached entry
   */
  async delete(key: string): Promise<void> {
    localMemoryCache.delete(key);
    try {
      await upstashCommand('DEL', key);
    } catch {}
  },
};
