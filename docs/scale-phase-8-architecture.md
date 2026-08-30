# GOALMILLS SCALE & REVENUE PROGRAM — PHASE 8 ARCHITECTURE
## Sports Data Warehouse & Historical Intelligence Engine

```text
                                 ┌────────────────────────┐
                                 │ Live Sports Providers  │
                                 │ (Football,Cricket,NBA) │
                                 └───────────┬────────────┘
                                             │
                                             ▼
                                 ┌────────────────────────┐
                                 │ Sports Normalizer &    │
                                 │ Provenance Adapter     │
                                 └───────────┬────────────┘
                                             │
                    ┌────────────────────────┴────────────────────────┐
                    ▼                                                 ▼
        ┌───────────────────────┐                         ┌───────────────────────┐
        │  Fast-Path Redis &    │                         │  Phase 7 Stream Event │
        │  Live Sports API      │                         │  Pipeline (XADD)      │
        └───────────────────────┘                         └───────────┬───────────┘
                                                                      │
                                                                      ▼
                                                          ┌───────────────────────┐
                                                          │ Sports Warehouse      │
                                                          │ Ingestion Worker      │
                                                          └───────────┬───────────┘
                                                                      │
                                             ┌────────────────────────┴────────────────────────┐
                                             ▼                                                 ▼
                               ┌───────────────────────────┐                     ┌───────────────────────────┐
                               │ Historical Matches & H2H  │                     │ Standings, Teams & Stats  │
                               │ MongoDB Sports Warehouse  │                     │ Analytical Aggregations   │
                               └───────────────────────────┘                     └───────────────────────────┘
```

---

### 1. Separation of Fast-Path Live Scoring & Durable Warehouse

To protect the platform's sub-millisecond live match score delivery:
1. **Live Scoring (Fast Path)**: Upstream provider responses are normalized and cached directly in **Redis** with short TTLs (5–30s) and served to web/mobile clients.
2. **Sports Warehouse (Analytical Path)**: When a match reaches `finished` status or at scheduled intervals, an event is emitted into the **Phase 7 Event Pipeline**, where background workers persist durable, enriched match records into the **MongoDB Sports Warehouse**.

---

### 2. Data Provenance & Deduplication Topology

Every historical record carries strict provenance metadata:
```typescript
export interface DataProvenance {
  provider: 'allsportsapi' | 'cricbuzz' | 'rapidapi' | 'manual_editorial' | string;
  providerId: string;
  ingestedAt: string;
  normalizationVersion: string;
  confidenceScore: number; // 0.0 - 1.0
}
```

#### Deduplication Strategy:
- **Provider-Level Uniqueness**: Compound index on `{ 'provenance.provider': 1, 'provenance.providerId': 1 }` (unique: true).
- **Matchday Entity Resolution**: Matches between the same two teams on the same date within a competition are resolved and updated idempotently rather than duplicated:
  `{ sport: 1, competitionSlug: 1, date: 1, 'homeTeam.slug': 1, 'awayTeam.slug': 1 }`.

---

### 3. Warehouse Schema Design

#### 3.1 Historical Matches (`historical_matches`)
- `matchId`: Unique slugified match key (e.g. `ft_pl_arsenal_chelsea_20260415`).
- `sport`: `'football' | 'cricket' | 'basketball' | 'tennis'`.
- `competition`: `{ id, name, slug, country, season }`.
- `date`: ISO timestamp of match kickoff.
- `status`: `'finished' | 'aet' | 'penalties' | 'awarded' | 'abandoned'`.
- `homeTeam` / `awayTeam`: `{ id, name, shortName, slug, logo }`.
- `finalScore`: `{ home: number, away: number, formatted: string }`.
- `periodScores`: Halftime, regular time, extra time, cricket innings, basketball quarters.
- `events`: Array of `{ minute, type ('goal' | 'card' | 'wicket' | 'point'), player, assist, detail }`.
- `lineups`: Starting XI, substitutes, coaches, formations.
- `venue` & `referee`.
- `provenance`: `DataProvenance`.

#### 3.2 Historical Head-to-Head Aggregations (`HeadToHeadSummary`)
Dynamic or pre-aggregated metrics:
- Total Encounters, Home Team Wins, Away Team Wins, Draws.
- Total Goals Scored by each team, Average Goals per Encounter.
- Most frequent scoreline, Clean sheets percentage.
- Last 5 Meetings timeline with direct match links.

#### 3.3 Historical Standings & Team Trends
- Season-by-season final and current standings snapshots.
- Form graphs (e.g. `['W', 'W', 'D', 'L', 'W']`), home vs away performance splits, goal timing heatmaps (0-15m, 16-30m, 31-45m, etc.).

---

### 4. Admin Sports Warehouse Studio (`/admin/warehouse`)

The Admin Sports Warehouse Studio allows editors and system administrators to:
1. **Inspect Warehouse Health**: Document counts for matches, teams, players, and standings per sport.
2. **Data Provenance Inspector**: Review provider confidence scores and sync timestamps.
3. **Execute Backfill & Sync Jobs**: Trigger background sync for historical seasons without blocking the application.
4. **Head-to-Head Sandbox**: Query any two teams across football, cricket, or basketball to inspect generated analytics.
