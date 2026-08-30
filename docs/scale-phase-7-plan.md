# GOALMILLS SCALE & REVENUE PROGRAM — PHASE 7 PLAN
## Distributed Real-Time Event & Stream Ingestion Pipeline (All Platforms)

### 1. Executive Summary
Phase 7 establishes the **GoalMills Distributed Real-Time Event & Stream Ingestion Pipeline** across **all platforms** (`apps/web`, `apps/admin`, `apps/mobiles`, `services/mailer`, `@goalmills/types`). It decouples high-velocity sports telemetry, reader engagement, ad impressions, click tracking, and live match moments from transactional databases by buffering events into high-throughput Redis Streams (`XADD`/`XREADGROUP`), executing resilient idempotent micro-batch workers, and routing failures to a self-healing Dead-Letter Queue (DLQ) with Admin Studio replay controls.

---

### 2. Multi-Platform Architecture Topology

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

### 3. Key Milestones & Platform Scope

#### Milestone 1: Shared Event Stream Contracts (`@goalmills/types`)
- **`SportsEventType`**:
  - Sports telemetry: `'live_match_moment'`, `'goal'`, `'wicket'`, `'quarter_end'`, `'var_decision'`.
  - Monetization: `'ad_impression'`, `'ad_click'`, `'sponsor_engagement'`.
  - Engagement: `'article_read'`, `'scroll_depth_50'`, `'scroll_depth_100'`, `'video_play_milestone'`, `'search_query'`.
- **`StreamEventEnvelope<T>`**: Standardized envelope with `eventId`, `tenantSlug`, `platform` (`'web' | 'mobile_ios' | 'mobile_android' | 'admin'`), `timestamp`, `idempotencyKey`, `payload`, `retryCount`.
- **`DeadLetterEventRecord`**: Error logging, payload serialization, failure reason, and resolution state.
- **`PipelineThroughputStats`**: Real-time throughput metrics (events/sec, latency, consumer lag, DLQ size).

#### Milestone 2: Web Application Integration (`apps/web`)
- Fast non-blocking ingestion endpoint `POST /api/events/track` returning `202 Accepted` within `< 10ms`.
- Server-Sent Events (SSE) live match telemetry broker `GET /api/events/live-stream`.
- Integration into ad impression tracking, news article read trackers, and video milestone events.

#### Milestone 3: Mobile Application Full Parity (`apps/mobiles`)
- **Mobile Telemetry Emitter (`goalmillsApi.trackSportsTelemetry`)**:
  - Dispatches user engagement, sponsor viewability, and search query telemetry.
- **Offline Mobile Batch Buffer & Auto-Flush**:
  - Queues telemetry offline when connectivity is lost and automatically flushes batches upon reconnection.
- **Live Match Moment Listener**:
  - Connects to SSE / stream endpoints to trigger live ticker notifications, goal alerts, and real-time score refresh.

#### Milestone 4: Stream Ingestion & Micro-Batch Workers (`apps/web`, `apps/admin`)
- Redis Consumer Group worker pool with `XREADGROUP` and `XACK`.
- Atomic idempotency check (`SETNX stream:idempotency:{key}`) preventing duplicate metric processing.
- Micro-batch aggregation accumulating metrics and rolling up to MongoDB `ContentMetricSummary` every 15 seconds.
- Hand-off hook emitting finished fixtures into the **Phase 8 Sports Data Warehouse**.

#### Milestone 5: Self-Healing Dead-Letter Queue (DLQ) & Resilience
- Transient failure retry engine with exponential backoff and jitter (3 attempts).
- Unrecoverable events saved to MongoDB `dead_letter_events` collection.
- Admin bulk/single replay APIs (`POST /api/admin/events/dlq/replay`).

#### Milestone 6: Admin Stream & DLQ Management Studio (`apps/admin`)
- Dedicated `/admin/events` console:
  - **Live Stream Wire**: Real-time throughput graphs (events/sec) and latency monitors.
  - **Consumer Group Health**: Lag monitoring and acknowledged offsets.
  - **DLQ Management Console**: Payload inspector, replay engine, and discard actions.
  - **Sports Telemetry Simulation**: Trigger mock goal, wicket, and ad impression events.
- Integrated into `AdminNavBar.tsx` under CMS & Editorial and Quick Shortcuts.

#### Milestone 7: Automated Verification & Documentation
- Comprehensive Vitest unit tests for event production, worker processing, DLQ handling, and idempotency.
- Clean compilation across all monorepo workspaces.
- Documentation in `docs/scale-phase-7-plan.md`, `docs/scale-phase-7-architecture.md`, and `docs/scale-phase-7-report.md`.
