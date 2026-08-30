# GOALMILLS SCALE & REVENUE PROGRAM — PHASE 7 ARCHITECTURE
## Distributed Real-Time Event & Stream Ingestion Pipeline (Multi-Platform)

```text
  ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
  │    Web Client   │      │  Mobile Client  │      │ Live Sports Feed│
  │   (apps/web)    │      │ (apps/mobiles)  │      │   & Mailer API  │
  └────────┬────────┘      └────────┬────────┘      └────────┬────────┘
           │                        │                        │
           │ (HTTPS / POST)         │ (Offline Buffer/Flush) │ (Worker Sync)
           ▼                        ▼                        ▼
  ┌───────────────────────────────────────────────────────────────────┐
  │                 Event Producer Layer (Non-Blocking)               │
  │                  POST /api/events/track (Fast Path)               │
  └─────────────────────────────────┬─────────────────────────────────┘
                                    │
                                    ▼
  ┌───────────────────────────────────────────────────────────────────┐
  │                Redis Streams Broker (Partitioned)                 │
  │              `stream:sports:events:{tenantSlug}`                  │
  └──────────────────┬─────────────────────────────┬──────────────────┘
                     │                             │
                     ▼                             ▼
  ┌───────────────────────────────────┐   ┌───────────────────────────┐
  │ Real-Time Live Match Moment Fanout│   │ Micro-Batch Stream Worker │
  │ GET /api/events/live-stream (SSE) │   │ (Idempotent Rollups & DLQ)│
  └──────────┬────────────────────────┘   └─────────────┬─────────────┘
             │                                          │
    ┌────────┴────────┐                       ┌─────────┴─────────┐
    ▼                 ▼                       ▼                   ▼
┌───────┐         ┌────────┐              ┌───────┐           ┌───────┐
│ Web   │         │ Mobile │              │MongoDB│           │Phase 8│
│ Client│         │ Client │              │Metrics│           │Warehse│
└───────┘         └────────┘              └───────┘           └───────┘
```

---

### 1. Ingestion Isolation & Throughput SLA

1. **Sub-10ms Fast Path**:
   - `POST /api/events/track` parses the payload, validates tenant context, and calls `SportsEventProducer.produceEvent()`.
   - The producer executes `XADD stream:sports:events:{tenantSlug} * ...` in Redis and immediately returns `202 Accepted`.
   - Primary MongoDB transactional operations (article saves, user auth) remain completely insulated from high-volume telemetry spikes.

2. **Multi-Platform Support**:
   - **Web**: Batched browser telemetry via `navigator.sendBeacon` and `fetch('/api/events/track')`.
   - **Mobile (`apps/mobiles`)**: `goalmillsApi.trackSportsTelemetry()` buffers events locally and flushes to the stream endpoint.
   - **Sports Feed Workers**: Emit match event moments (goals, red cards, wickets, overtime periods) to the stream.

---

### 2. Stream Worker & Micro-Batching

1. **Redis Consumer Groups (`XREADGROUP`)**:
   - Multiple worker instances read concurrently from the tenant stream partition with automated message acknowledgment (`XACK`).
2. **Atomic Idempotency Guard**:
   - Each event envelope contains a unique `idempotencyKey`.
   - Before processing, the worker verifies `SETNX stream:idempotency:{key}` with a 24-hour TTL. Duplicate events are silently acknowledged and skipped.
3. **Micro-Batch Time-Series Aggregations**:
   - Worker accumulates pageviews, read completions, ad clicks, and video play progress in-memory or Redis hashes, then flushes consolidated metric increments (`$inc`) into MongoDB `ContentMetricSummary` and `Sponsorship` models in batch transactions every 15 seconds.

---

### 3. Fault Tolerance & Dead-Letter Queue (DLQ)

1. **Exponential Retry & Backoff**:
   - Failed events undergo up to 3 automatic retry attempts with exponential jitter (`500ms`, `1500ms`, `4500ms`).
2. **DLQ Persistence**:
   - If retries are exhausted, the event is saved to the `dead_letter_events` MongoDB collection with error diagnostic stacks.
3. **Admin Studio Management (`/admin/events`)**:
   - Operators can inspect dead-letter payloads, filter by error type, and trigger bulk re-drive into the active stream (`POST /api/admin/events/dlq/replay`).

---

### 4. Integration with Sports Warehouse (Phase 8)

When a match event of type `'fulltime'` or match completion is ingested through the event pipeline, the worker notifies the **Phase 8 Sports Warehouse**, triggering durable analytical persistence into `HistoricalMatch` without adding latency to live user-facing scoring feeds.
