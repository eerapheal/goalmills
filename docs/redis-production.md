# GoalMills — Production Redis Architecture & Configuration Guide

**Version:** 2.0.0  
**Status:** PRODUCTION ACTIVE  

---

## 1. Overview

GoalMills uses a multi-tier caching engine combining centralized Redis (via `ioredis`) and an in-memory LRU fallback. It provides sub-millisecond response times for sports intelligence, live match scores, editorial feeds, and telemetry data.

```text
       Client Request
             │
             ▼
      [ cacheGet(key) ]
             │
      ┌──────┴──────┐
   Redis Online?    Redis Offline?
      │             │
      ▼             ▼
   [ Redis Cache ] [ Memory Cache Fallback ]
      │ (hit)       │ (hit)
      └──► Return ◄─┘
             │ (miss)
             ▼
     [ singleFlight() ]
             │
             ▼
     [ Upstream Provider ]
             │
             ▼
     [ cacheSet(key, ttl) ]
```

---

## 2. Environment Configuration

In production, GoalMills supports TLS-secured Redis connection strings:

```env
# Production Redis TLS URI
REDIS_URL=rediss://default:SecurePassword@goalmills-redis.internal:6380

# Alternative / Local Development Fallback
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
```

### Connection Resilience
- **Connect Timeout:** 5000ms
- **Max Retries Per Request:** 2
- **Exponential Retry Strategy:** Cap at 2000ms
- **TLS Handshake Support:** Auto-negotiated on `rediss://` prefixes.

---

## 3. Cache Key Strategy

All keys follow the standardized GoalMills namespace `gm:`:

| Key Pattern | Description | TTL | Fallback Behavior |
| :--- | :--- | :--- | :--- |
| `gm:sport:football:live` | Active live football scores | 15s | Serve stale if circuit trips |
| `gm:sport:football:fixtures:{date}` | Scheduled matches for date | 60s | Serve cached with revalidate |
| `gm:sport:football:standings:{id}` | League table standings | 300s | Multi-provider normalized |
| `gm:sport:cricket:live` | Live cricket scorecards | 15s | Cricbuzz/AllSports format |
| `gm:sport:basketball:live` | Live basketball quarters | 15s | Overtime & period points |
| `gm:sponsorships:{placement}:{sport}` | Active ad placements | 60s | Cached partner banner |
| `rate:track:{ip}` | Anti-bot telemetry rate limit | 60s | Max 20 events/min |
| `dedup:imp:{id}:{ip}` | Impression deduplication | 10s | Drop duplicate views |

---

## 4. Cache Stampede Prevention (`singleFlight`)

To prevent multiple simultaneous requests from overwhelming the upstream sports provider when a key expires, `singleFlight(key, fetchFn)` coalesces concurrent executions into a single shared promise:

```ts
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
```

---

## 5. Live Observability & Diagnostics

Access real-time telemetry from `/admin/system` or via `getRedisHealth()`:

```json
{
  "status": "HEALTHY",
  "mode": "redis",
  "latencyMs": 4,
  "memoryEntries": 124,
  "inFlightRequests": 0,
  "metrics": {
    "hits": 14502,
    "misses": 834,
    "hitRatio": "94.6%",
    "singleFlightSaves": 3120,
    "errors": 0
  }
}
```
