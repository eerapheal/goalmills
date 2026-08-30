# GOALMILLS SCALE & REVENUE PROGRAM — PHASE 4 ARCHITECTURE
## Audience Analytics & Content Performance Engine

```text
                               ┌────────────────────────┐
                               │  GoalMills Multi-Tenant│
                               │    Audience Engine     │
                               └───────────┬────────────┘
                                           │
             ┌─────────────────────────────┼─────────────────────────────┐
             ▼                             ▼                             ▼
   ┌───────────────────┐         ┌───────────────────┐         ┌───────────────────┐
   │    apps/web       │         │   apps/mobiles    │         │    apps/admin     │
   ├───────────────────┤         ├───────────────────┤         ├───────────────────┤
   │ • useEngagement() │         │ • Screen Views    │         │ • Analytics Suite │
   │ • Scroll 25/50/75%│         │ • Article Reads   │         │ • Content Leader  │
   │ • Beacon Dispatch │         │ • Video telemetry │         │ • Audience Matrix │
   │ • navigator.send  │         │ • Affinity Pulse  │         │ • Realtime Pulse  │
   └─────────┬─────────┘         └─────────┬─────────┘         └─────────┬─────────┘
             │                             │                             │
             └─────────────────────────────┼─────────────────────────────┘
                                           │
                                           ▼
                               ┌────────────────────────┐
                               │  High-Throughput Track │
                               │  /api/analytics/track  │
                               └───────────┬────────────┘
                                           │
                      ┌────────────────────┴────────────────────┐
                      ▼                                         ▼
            ┌───────────────────┐                     ┌───────────────────┐
            │   Upstash Redis   │                     │  MongoDB Storage  │
            ├───────────────────┤                     ├───────────────────┤
            │ • Realtime 5m/30m │                     │ • AnalyticsEvents │
            │ • Event Buffer    │                     │ • ContentMetrics  │
            │ • Active Readers  │                     │ • AudienceProfiles│
            │ • Deduplication   │                     │ • Daily Summaries │
            └───────────────────┘                     └───────────────────┘
```

---

### 1. Data Models & Entity Relationships

1. **`AnalyticsEvent`**:
   - `tenantId`: Tenant identifier.
   - `tenantSlug`: Tenant slug string (default: `'goalmills'`).
   - `eventType`: `'page_view' | 'article_read' | 'scroll_depth' | 'video_play' | 'share' | 'search' | 'sponsorship_click' | 'newsletter_click'`.
   - `entityType`: `'article' | 'category' | 'video' | 'newsletter' | 'sponsorship' | 'page'`.
   - `entityId`: Associated identifier (e.g., article ID or slug).
   - `sessionHash`: Daily salted SHA-256 hash representing an anonymous reader session.
   - `metadata`: `{ sportSlug?: string; categorySlug?: string; authorId?: string; scrollPercentage?: number; durationMs?: number; referrer?: string; device?: 'desktop' | 'mobile' | 'tablet'; country?: string }`.
   - `timestamp`: UTC ISO timestamp.

2. **`ContentMetricSummary`**:
   - Compound index on `{ tenantSlug: 1, articleId: 1, date: -1 }`.
   - Aggregates:
     - `pageViews`: Total views.
     - `uniqueReaders`: Count of distinct sessions.
     - `avgReadDurationMs`: Active reading time.
     - `scrollMilestones`: `{ p25: number; p50: number; p75: number; p100: number }`.
     - `shares`: Total social shares count.
     - `videoPlays`: Inline video playback count.

3. **`AudienceAffinity`**:
   - Aggregates readership affinity by sport category, league, team, and author for editorial recommendations and sponsorship targeting.

---

### 2. Privacy & Compliance Architecture

- **Zero Third-Party Trackers**: 100% self-hosted first-party telemetry.
- **Salted Anonymized Sessions**: Session identifiers are generated dynamically using `SHA-256(IP + UserAgent + DailySalt)` which naturally rotates every 24 hours. No persistent cross-site cookies or fingerprinting stored.
- **Data Minimization & Auto-Pruning**: Raw events auto-expire after 90 days via MongoDB TTL index, retaining lightweight aggregated metric summaries indefinitely.
- **Asynchronous Beacon Delivery**: Uses `navigator.sendBeacon` to ensure telemetry dispatch never blocks UI thread or delays navigation.
