# GoalMills Platform — Production Operations Runbook

## 1. System Overview & Architecture Topology

The GoalMills platform operates as a modular, decoupled TypeScript and Go monorepo governed by clear domain boundaries and centralized infrastructure services:

```text
                                 ┌─────────────────────────┐
                                 │   GoalMills Monorepo    │
                                 └────────────┬────────────┘
                                              │
             ┌────────────────────────────────┼────────────────────────────────┐
             ▼                                ▼                                ▼
   ┌───────────────────┐            ┌───────────────────┐            ┌───────────────────┐
   │    Core Domain    │            │  Infrastructure   │            │   Applications    │
   │      Modules      │            │     Packages      │            │   & Microservices │
   ├───────────────────┤            ├───────────────────┤            ├───────────────────┤
   │ @core-sports      │            │ @infra-database   │            │ apps/web (Next.js)│
   │ @core-content     │            │ @infra-redis      │            │ apps/admin(Next.js│
   │ @core-commercial  │            │ @infra-events     │            │ services/mailer   │
   │ @core-audience    │            │ @infra-logging    │            │   (Go 1.22 daemon)│
   │ @core-identity    │            │ @contracts        │            │ services/social   │
   │ @core-analytics   │            │ @types            │            │   (Node daemon)   │
   │ @core-warehouse   │            │ @ui               │            │                   │
   └───────────────────┘            └───────────────────┘            └───────────────────┘
```

---

## 2. Environment Variables & Secrets Matrix

| Environment Variable | Subsystem | Required | Description / Default |
| :--- | :--- | :--- | :--- |
| `MONGODB_URI` | Database | Yes | Primary MongoDB connection URI (e.g. Atlas cluster with replica sets). |
| `MONGODB_URI_FALLBACK` | Database | Optional | Secondary MongoDB URI for multi-region failover. |
| `REDIS_URL` | Redis | Yes | Primary Redis TLS connection URI (`rediss://...`). |
| `UPSTASH_REDIS_REST_URL` | Redis | Optional | REST endpoint for edge-worker Redis operations. |
| `UPSTASH_REDIS_REST_TOKEN` | Redis | Optional | Bearer token for Upstash REST protocol. |
| `MAILER_SERVICE_URL` | Mailer | Yes | HTTP endpoint of Go mailer daemon (`http://localhost:8080` or service mesh URL). |
| `MAILER_WEBHOOK_SECRET` | Mailer / Audience | Yes | HMAC-SHA256 shared secret for webhook signature verification. |
| `ALLSPORTS_API_KEY` | Sports | Yes | AllSportsAPI production access key for multi-sport livescores. |
| `NEXTAUTH_SECRET` | Identity | Yes | Cryptographic secret for signing session JWTs. |
| `NEXTAUTH_URL` | Identity | Yes | Canonical public URL of the application. |
| `CLOUDINARY_URL` | Content | Yes | Media asset storage and optimization pipeline. |

---

## 3. Observability, Health Checks & Telemetry

### 3.1 Health Endpoints
- **Web App Health:** `GET /api/health` — Verifies application responsiveness, version tag, and database connectivity.
- **Cache Telemetry:** `GET /api/cache/diagnostics` — Returns live status (`connected`, `rest_connected`, or `memory_fallback`), hit ratio %, latency (ms), and in-flight request count.
- **Go Mailer Health:** `GET /health` on mailer port (8080) — Reports worker queue depth and SMTP circuit status.

### 3.2 Telemetry Interpretation
- **Cache Hit Ratio:** Target > 85% in steady state. If hit ratio falls below 60%, inspect TTL settings or check if wildcard invalidation (`cacheInvalidatePattern`) is being triggered excessively.
- **Circuit Breaker Status:**
  - `CLOSED`: Normal operation; upstream provider responding within latency limits.
  - `OPEN`: Tripped after 3 consecutive failures. Upstream fetches fast-fail in < 0.1ms; serving stale cache or graceful UI degradation.
  - `HALF_OPEN`: Testing upstream availability after 15s reset cooldown.

---

## 4. Upstream Rate Limiting & Failover Protocol

### 4.1 Upstream Rate-Limit Protection
- **Inter-Fetch Gap:** Strictly enforced `>= 250ms` between consecutive outbound requests via `ProviderCircuitBreaker` in `@goalmills/core-sports`.
- **Single-Flight Coalescing:** Under traffic spikes, `cacheAside()` deduplicates concurrent callers for expired keys into a single in-flight promise, preventing cache stampedes to MongoDB or upstream APIs.

### 4.2 Cache Failover Chain
```text
1. ioredis TLS Connection (Primary, sub-millisecond)
      │ (on connection error or timeout)
      ▼
2. Upstash REST Protocol (Secondary, edge-safe HTTP)
      │ (on network failure or 5xx)
      ▼
3. In-Memory LRU Bounded Cache (Tertiary, zero-dependency process-memory fallback)
```

---

## 5. Zero-Downtime Deployment & Rollback Protocol

### 5.1 Deployment Procedure
1. **Pre-flight Validation:**
   ```bash
   pnpm -r typecheck
   pnpm test
   ```
2. **Database Schema Verification:**
   - Canonical models in `@goalmills/infrastructure-database` use additive schema definitions. No breaking field removals without a one-release deprecation cycle.
3. **Application Build & Deploy:**
   - Deploy `apps/web` and `apps/admin` via Vercel or containerized runners with blue/green traffic shifting.
4. **Daemon Deployment:**
   - Deploy `services/mailer` and `services/social-engine` as independent container instances.

### 5.2 Rollback Procedure
If critical errors or SLA violations are observed post-deployment:
1. Revert edge traffic router to previous blue/green deployment target.
2. In case of persistent cache corruption, invoke administrative cache purge:
   ```bash
   # Via authenticated admin endpoint or Redis CLI:
   redis-cli -u $REDIS_URL FLUSHDB
   ```
3. Canonical model shims in `apps/web/src/models` and `apps/admin/src/models` preserve 100% backward compatibility, allowing legacy or rollback codebases to point to the unified database without schema incompatibilities.
