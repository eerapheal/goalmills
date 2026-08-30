# GOALMILLS SCALE & REVENUE PROGRAM — PHASE 4 PLAN
## Audience Analytics & Content Performance Engine

### 1. Executive Summary
Phase 4 introduces a first-party, privacy-conscious **Audience Analytics & Content Performance Engine** across GoalMills' multi-tenant sports publishing platform. It delivers real-time and aggregate insights into reader engagement (scroll depth, read duration, topic affinity, video views, and newsletter attribution) with zero reliance on invasive third-party trackers.

---

### 2. Core Pillars & Architecture Scope

```text
┌────────────────────────────────────────────────────────────────────────┐
│               GOALMILLS PHASE 4: AUDIENCE ANALYTICS ENGINE             │
├────────────────────────────────────────────────────────────────────────┤
│ 1. PRIVACY-FIRST INGESTION: Cookie-less hashed sessions, beacon API   │
│ 2. MULTI-TENANT ISOLATION: Scoped metrics per tenant & network level   │
│ 3. CONTENT PERFORMANCE: Scroll depth (25/50/75/100%), active read time │
│ 4. AUDIENCE AFFINITY: Sport, league, team & author interest graphs     │
│ 5. REAL-TIME TELEMETRY: Active readers (5m/30m) & trending articles    │
│ 6. ADMIN ANALYTICS HUB: Interactive dashboards & exportable reports    │
│ 7. CROSS-PLATFORM SDK: Web beacon tracker & React Native mobile client │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 3. Key Milestones & Deliverables

#### Milestone 1: Shared Data Models & Types (`@goalmills/types`)
- **`AnalyticsEvent`**: Ingested raw telemetry record with `tenantId`, `tenantSlug`, `eventType`, `entityType`, `entityId`, `device`, `country`, `referrer`, `durationMs`, `scrollDepth`, `sessionHash`.
- **`ContentMetricSummary`**: Daily & hourly aggregated metrics per article/category/tenant for sub-second query performance.
- **`AudienceAffinity`**: Topic & sport affinity scoring model (football, cricket, basketball, specific teams).
- **`AnalyticsOverview` & `RealtimeAnalytics`**: High-level KPI payload definitions.

#### Milestone 2: High-Throughput Ingestion & Redis Buffering Pipeline
- `POST /api/analytics/track`: Ultra-fast beacon ingestion supporting `navigator.sendBeacon` and JSON payload batches.
- Redis buffering and deduplication queue for high-concurrency traffic bursts during live match events.
- Background aggregation worker / cron to roll raw events into daily and hourly summary documents.

#### Milestone 3: Multi-Tenant Admin Analytics Control Plane (`apps/admin`)
- Dedicated `/admin/analytics` dashboard suite:
  - **Overview KPIs**: Total pageviews, unique sessions, average read completion rate, engagement duration.
  - **Content Leaderboard**: Top articles sorted by views, scroll completion, shares, and conversion.
  - **Audience & Affinity Breakdown**: Top sports, leagues, teams, referring channels, and device types.
  - **Real-Time Active Wire**: Live active readers count and trending articles in 5-minute rolling windows.
  - **Date Range Filters**: Today, 7 Days, 30 Days, 90 Days, and Custom ranges with tenant filtering.
- Admin APIs:
  - `GET /api/admin/analytics/overview`
  - `GET /api/admin/analytics/articles`
  - `GET /api/admin/analytics/audience`
  - `GET /api/admin/analytics/realtime`

#### Milestone 4: Client Instrumentation (Web & Mobile)
- **Web (`apps/web`)**:
  - `<AnalyticsTracker />` component with automatic route change tracking.
  - `useArticleEngagement()` hook tracking active reading time (excluding idle tabs) and scroll milestones (25%, 50%, 75%, 100%).
  - Beacon dispatch on `visibilitychange` and `beforeunload`.
- **Mobile (`apps/mobiles`)**:
  - `trackAnalyticsEvent()` utility integration for screen views, article reads, and video highlights.

#### Milestone 5: Verification, Benchmarks & Reporting
- Comprehensive unit and integration test suites for ingestion, aggregation, and query endpoints.
- Typecheck verification across `packages/types`, `apps/web`, `apps/admin`, and `apps/mobiles`.
- `docs/scale-phase-4-report.md` finalization.
