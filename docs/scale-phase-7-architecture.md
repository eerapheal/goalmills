# GOALMILLS SCALE & REVENUE PROGRAM — PHASE 7 ARCHITECTURE
## Distributed Real-Time Event & Stream Ingestion Pipeline

```text
                                 ┌────────────────────────┐
                                 │   GoalMills Ingestion  │
                                 │      Event Producers   │
                                 └───────────┬────────────┘
                                             │
               ┌─────────────────────────────┼─────────────────────────────┐
               ▼                             ▼                             ▼
     ┌───────────────────┐         ┌───────────────────┐         ┌───────────────────┐
     │ Analytics Ingest  │         │ Sponsorship Track │         │ Live Sports Feed  │
     │ /api/analytics    │         │ /api/sponsorships │         │ /api/matches/live │
     └─────────┬─────────┘         └─────────┬─────────┘         └─────────┬─────────┘
               │                             │                             │
               └─────────────────────────────┼─────────────────────────────┘
                                             │  (Non-blocking XADD)
                                             ▼
                               ┌───────────────────────────┐
                               │  Redis Streams Broker     │
                               │  stream:events:{tenant}   │
                               └─────────────┬─────────────┘
                                             │
               ┌─────────────────────────────┴─────────────────────────────┐
               ▼                                                           ▼
     ┌───────────────────┐                                       ┌───────────────────┐
     │  Consumer Group A │                                       │  Consumer Group B │
     │  (Analytics & DLQ)│                                       │ (Live Match Alert)│
     └─────────┬─────────┘                                       └─────────┬─────────┘
               │                                                           │
        ┌──────┴──────┐                                             ┌──────┴──────┐
        ▼             ▼                                             ▼             ▼
   [Idempotency] [DB Rollup]                                   [Push Notify] [SSE Broadcast]
        │             │                                             │             │
        ▼             ▼                                             ▼             ▼
  MongoDB Metric  MongoDB DLQ                                   Mobile App     Web Client
```

---

### 1. High-Throughput Stream Ingestion Topology

1. **Non-Blocking Ingestion**: Client requests dispatch events to Redis Streams in `< 2ms` with immediate `202 Accepted` response.
2. **Partitioning Key**: Events are stream-partitioned by `tenantSlug` (`stream:events:{tenant}`) to prevent multi-tenant noisy-neighbor starvation.
3. **Consumer Groups**: Scalable worker pools consume via `XREADGROUP GROUP goalmills-workers worker-{id} COUNT 100 BLOCK 2000`.

---

### 2. Idempotency & Exactly-Once Semantics

- Every event carries an `idempotencyKey` computed as `SHA-256(tenantId + eventType + entityId + sessionHash + roundedTimestampWindow)`.
- Before processing, workers execute atomic check-and-set:
  ```typescript
  const acquired = await redis.set(`idemp:${event.idempotencyKey}`, '1', 'EX', 86400, 'NX');
  if (!acquired) {
    // Duplicate detected — acknowledge and skip
    await redis.xack(streamKey, groupName, event.id);
    return;
  }
  ```

---

### 3. Fault Tolerance & Dead-Letter Queue (DLQ) Strategy

```text
[Incoming Event] ──> [Worker Processing] ──> Success ──> [XACK & Commit]
                             │
                        Transient Error
                             │
                             ▼
                 [Retry Counter < 3 (Backoff)]
                    │                     │
               Retry Passes          Max Retries Exceeded
                    │                     │
                    ▼                     ▼
             [XACK & Commit]      [Route to DLQ Stream]
                                          │
                                          ▼
                                 [MongoDB DLQ Store]
                                          │
                                          ▼
                                 [Admin Replay Portal]
```

- **Exponential Backoff**: Retries are scheduled at `1s`, `5s`, `25s` with random jitter.
- **DLQ Store**: Persistent MongoDB collection `dead_letter_events` storing full diagnostic context and payload for auditing and re-play.

---

### 4. Micro-Batch Aggregation Model

Rather than executing individual atomic increments against MongoDB on every single pageview or impression, workers maintain in-memory counters and flush batched `$inc` operations in 10-second micro-batches:

```typescript
// Batched bulkWrite for high-volume telemetry
await ContentMetricSummary.bulkWrite(
  Object.entries(aggregatedViews).map(([articleId, count]) => ({
    updateOne: {
      filter: { articleId, date: todayDateString },
      update: { $inc: { views: count } },
      upsert: true,
    },
  }))
);
```

---

### 5. Admin Control Plane (`/admin/events`)

The Phase 7 Admin Event Studio provides complete visibility into:
1. **Real-time Throughput**: Live chart of events processed per second.
2. **Lag Telemetry**: Number of unread events across each consumer group.
3. **DLQ Dashboard**: Search, view, and replay failed events.
4. **Partition Rebalancing**: Dynamic worker reallocation across tenant streams.
