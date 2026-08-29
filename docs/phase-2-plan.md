# GoalMills — Phase 2 Architecture & Implementation Plan
## Redis, Live Sports Data Engine & Provider Resilience

**Version:** 2.0.0  
**Status:** DRAFT & READY FOR APPROVAL  
**Phase Target:** Production-Grade Sports Data Ingestion, Multi-Tier Caching, Provider Circuit Breaking, Event Streaming & Telemetry  

---

## 1. Executive Overview

GoalMills Phase 2 upgrades the sports intelligence platform with:
1. **Centralized Redis Connection Manager & Multi-Tier Cache Engine**:
   - `rediss://` TLS and standard `redis://` connection pooling with automatic in-memory fallback.
   - Cache-aside strategy with dynamic TTLs (15s live scores, 60s fixtures, 300s standings, 24h metadata).
   - Single-flight request deduplication (stampede protection) for concurrent requests.
2. **Provider Resilience & Circuit Breaker**:
   - Outbound rate spacing (250ms gap protection).
   - Exponential backoff retry with jitter (max 3 retries, excluding 401/403/422).
   - Circuit breaker (trips after consecutive failures, serving cached or graceful degradation).
3. **Multi-Sport Normalization Engine**:
   - Football (first half, half-time, extra time, penalties, standings).
   - Cricket (innings, overs, wickets, runs, bat/bowl stats).
   - Basketball (quarters, periods, clock, fouls, overtime).
   - Data freshness indicators (`lastUpdatedAt`, `receivedAt`, `isStale`).
4. **Realtime Event Streaming (SSE / SocketBroadcaster)**:
   - Live score updates and match status changes streamed via `/api/realtime/stream`.
   - Event deduplication and subscriber filtering.
5. **Sponsorship Telemetry Protection**:
   - Public impression & click tracking protected against bot flooding, duplicate events, and DB write abuse.
6. **Observability & Diagnostics**:
   - Live Redis latency, cache hit/miss ratio, provider telemetry integrated into `/admin/system`.

---

## 2. Cache Key Architecture & TTL Strategy

| Key Pattern | Description | TTL | Invalidation Trigger |
| :--- | :--- | :--- | :--- |
| `gm:sport:football:live` | Active live football matches | 15s | Live score update / Poll |
| `gm:sport:football:fixtures:{date}` | Scheduled matches for date | 60s | Cron / On-demand |
| `gm:sport:football:match:{id}` | Detailed match data & stats | 15s | Event stream |
| `gm:sport:football:standings:{leagueId}` | League table standings | 300s | Match completion |
| `gm:sport:cricket:live` | Live cricket matches & scores | 15s | Ball/Over event |
| `gm:sport:basketball:live` | Live basketball scores & quarters | 15s | Quarter change |
| `gm:sponsorships:{placement}:{sport}` | Active commercial placements | 60s | Admin campaign edit |
| `gm:news:trending` | Trending editorial stories | 180s | New publication |

---

## 3. Provider Abstraction & Fallback Pipeline

```text
       Client Request
             │
             ▼
   [ Cache-Aside Check ]
   ├── HIT  ──► Return Cached Normalized Payload (Source: 'redis' | 'memory')
   └── MISS ──► Acquire In-Flight Single-Flight Promise
                     │
                     ▼
             [ Rate-Limit Spacer (250ms gap) ]
                     │
                     ▼
             [ Circuit Breaker Check ]
             ├── OPEN   ──► Return Stale Cache / Graceful Fallback
             └── CLOSED ──► Upstream Fetch (Primary Provider)
                                 │
                                 ├── SUCCESS ──► Normalize ──► Validate ──► Cache ──► Broadcast
                                 └── FAIL    ──► Backoff Retry (x3)
                                                   └── STILL FAILS ──► Trip Breaker ──► Fallback
```

---

## 4. Verification Plan

1. **Automated Unit Tests**:
   - Redis connection resilience, single-flight deduplication, circuit breaker tripping.
   - Sports normalization for football, cricket, basketball.
   - Sponsorship telemetry rate limiting & anti-abuse checks.
2. **Integration Tests**:
   - Live stream SSE connection and event broadcast.
   - Provider proxy fallbacks on simulated 500/429 errors.
3. **Build & Typecheck**:
   - `pnpm --filter web typecheck` (0 errors)
   - `pnpm --filter admin typecheck` (0 errors)
   - `pnpm --filter web test` (All passing)
   - `pnpm --filter admin test` (All passing)
   - `go test ./...` in `services/mailer` (All passing)
