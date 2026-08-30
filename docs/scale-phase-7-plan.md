# GOALMILLS SCALE & REVENUE PROGRAM — PHASE 7 PLAN
## Distributed Real-Time Event & Stream Ingestion Pipeline

### 1. Executive Summary
Phase 7 elevates GoalMills' backend data infrastructure to an enterprise-grade, decoupled **Distributed Real-Time Event & Stream Ingestion Pipeline**. It isolates high-velocity telemetry (ad impressions, click attribution, reader scroll depth, live match telemetry, and recommendation feedback) from primary MongoDB transactional paths by buffering events through high-throughput Redis Streams / message queues, processing them asynchronously with resilient consumer workers, enforcing strict idempotency, and providing a Dead-Letter Queue (DLQ) management hub in the Admin portal.

---

### 2. Architecture & Scope

```text
┌────────────────────────────────────────────────────────────────────────┐
│             GOALMILLS PHASE 7: DISTRIBUTED EVENT PIPELINE              │
├────────────────────────────────────────────────────────────────────────┤
│ 1. ULTRA-FAST INGESTION: Asynchronous non-blocking buffer producers    │
│ 2. STREAM BROKER: Redis Streams (XADD/XREADGROUP) partitioned buffer   │
│ 3. IDEMPOTENT WORKERS: Atomic deduplication & distributed processing   │
│ 4. RESILIENCE & DLQ: Exponential retry, backoff & dead-letter console  │
│ 5. MICRO-BATCH AGGREGATION: Pre-aggregated time-series rollups         │
│ 6. ADMIN PIPELINE CONTROL: Live throughput, consumer lag & DLQ replay  │
│ 7. CROSS-PLATFORM DISPATCH: Real-time live match push & alert fanout   │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 3. Key Milestones & Deliverables

#### Milestone 1: Shared Event Stream Types & Interfaces (`@goalmills/types`)
- **`StreamEventEnvelope`**: Generic event wrapper with `eventId`, `tenantId`, `eventType`, `timestamp`, `producer`, `idempotencyKey`, `payload`, `retryCount`, `traceId`.
- **`StreamConsumerGroup`**: Consumer group state, acknowledged offsets, lag metrics, and worker node heartbeat.
- **`DeadLetterEvent`**: Failed event record with `originalEvent`, `errorReason`, `stackTrace`, `failedAt`, `attempts`, `status` (`'pending' | 'resolved' | 'discarded' | 'replayed'`).
- **`PipelineThroughputStats`**: Real-time throughput metrics (events/sec, latency p95/p99, error rate, queue backlog).

#### Milestone 2: Asynchronous Event Producer Layer (`apps/web`, `apps/admin`)
- Non-blocking `EventProducer` service writing directly to Redis Streams (`XADD`) with batching and memory-efficient fallback.
- Migration of `/api/analytics/track`, `/api/sponsorships/[id]/track`, and `/api/recommendations/feedback` to produce stream events rather than performing immediate heavy DB aggregations.

#### Milestone 3: Distributed Stream Worker Engine (`services/event-worker` & Node runtime)
- Scalable worker pool using Redis Consumer Groups (`XREADGROUP`, `XACK`).
- Atomic idempotency verification using Redis SETNX / TTL keys to eliminate duplicate processing.
- Micro-batch aggregation worker rolling up metrics into MongoDB `ContentMetricSummary` and `Sponsorship` impression counters every 10–30 seconds.

#### Milestone 4: Dead-Letter Queue (DLQ) & Self-Healing Fault Tolerance
- Automatic retry engine with jittered exponential backoff for transient database or network failures.
- Unrecoverable events routed to `dlq:events` stream and MongoDB `DeadLetterEvent` collection.
- Automated alert triggers on DLQ size thresholds.

#### Milestone 5: Admin Event Pipeline & DLQ Studio (`apps/admin`)
- Dedicated `/admin/events` management console:
  - **Live Stream Wire**: Real-time events/sec throughput graphs and active consumers.
  - **Consumer Group Health**: Lag monitoring, pending entries list (`XPENDING`), and partition balance.
  - **DLQ Inspector & Re-Drive**: Inspect payload failures, single or bulk event retry, and purge controls.
  - **Pipeline Health Diagnostics**: End-to-end latency benchmarks and worker node health checks.
- Admin APIs:
  - `GET /api/admin/events/stats`: Real-time stream metrics and consumer lag.
  - `GET /api/admin/events/dlq`: Paginated list of failed dead-letter events.
  - `POST /api/admin/events/dlq/replay`: Re-inject failed events back into the active stream.
  - `DELETE /api/admin/events/dlq`: Purge discarded dead-letter entries.

#### Milestone 6: Live Sports Fanout & Real-Time Event Dispatcher
- Real-time match telemetry stream (goals, cards, wickets, score updates) broadcasting via SSE/WebSocket gateways.
- High-efficiency fanout to mobile push notifications and live web dashboards.

#### Milestone 7: Verification, Load Testing & Architectural Documentation
- High-concurrency synthetic load testing (> 5,000 events/sec burst ingestion).
- Automated unit and integration test suites for producers, consumer groups, idempotency, and DLQ re-drive.
- Architectural document `docs/scale-phase-7-architecture.md` and report `docs/scale-phase-7-report.md`.
