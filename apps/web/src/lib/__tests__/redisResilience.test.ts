import { describe, it, expect, beforeEach } from 'vitest';
import {
  cacheGet,
  cacheSet,
  cacheDel,
  cacheInvalidatePattern,
  singleFlight,
  getRedisHealth,
} from '../redisCache';

describe('Redis & Multi-Tier Resilient Cache Engine', () => {
  beforeEach(async () => {
    await cacheInvalidatePattern('*');
  });

  it('should store and retrieve data with TTL', async () => {
    const key = 'test:item:1';
    const value = { name: 'Arsenal vs Chelsea', sport: 'football', score: '2-1' };

    await cacheSet(key, value, 10);
    const retrieved = await cacheGet<typeof value>(key);

    expect(retrieved).not.toBeNull();
    expect(retrieved?.name).toBe('Arsenal vs Chelsea');
    expect(retrieved?.score).toBe('2-1');
  });

  it('should delete keys properly', async () => {
    const key = 'test:del:1';
    await cacheSet(key, { temp: true }, 10);
    expect(await cacheGet(key)).not.toBeNull();

    await cacheDel(key);
    expect(await cacheGet(key)).toBeNull();
  });

  it('should invalidate keys matching a pattern', async () => {
    await cacheSet('gm:sport:football:1', { match: 1 }, 10);
    await cacheSet('gm:sport:football:2', { match: 2 }, 10);
    await cacheSet('gm:sport:cricket:1', { match: 3 }, 10);

    await cacheInvalidatePattern('gm:sport:football:*');

    expect(await cacheGet('gm:sport:football:1')).toBeNull();
    expect(await cacheGet('gm:sport:football:2')).toBeNull();
    expect(await cacheGet('gm:sport:cricket:1')).not.toBeNull();
  });

  it('should coalesce concurrent calls with singleFlight (stampede protection)', async () => {
    let executionCount = 0;
    const fetchFn = async () => {
      executionCount++;
      await new Promise((resolve) => setTimeout(resolve, 50));
      return { result: 'data' };
    };

    // Run 5 simultaneous requests for the same key
    const promises = [
      singleFlight('test:stampede:key', fetchFn),
      singleFlight('test:stampede:key', fetchFn),
      singleFlight('test:stampede:key', fetchFn),
      singleFlight('test:stampede:key', fetchFn),
      singleFlight('test:stampede:key', fetchFn),
    ];

    const results = await Promise.all(promises);

    expect(results).toHaveLength(5);
    expect(results[0]).toEqual({ result: 'data' });
    // fetchFn should only have been called ONCE
    expect(executionCount).toBe(1);
  });

  it('should report health and telemetry metrics', async () => {
    const health = await getRedisHealth();
    expect(health).toHaveProperty('status');
    expect(health).toHaveProperty('mode');
    expect(health).toHaveProperty('latencyMs');
    expect(health).toHaveProperty('metrics');
    expect(typeof health.metrics.hits).toBe('number');
    expect(typeof health.metrics.misses).toBe('number');
  });
});
