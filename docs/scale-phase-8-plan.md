# GOALMILLS SCALE & REVENUE PROGRAM — PHASE 8 PLAN
## Sports Data Warehouse & Historical Sports Intelligence Engine

### 1. Executive Summary
Phase 8 establishes the **GoalMills Sports Data Warehouse & Historical Intelligence Engine**. It creates a durable, query-optimized analytical historical repository across all supported sports (Football, Cricket, Basketball, Tennis) without disturbing or introducing latency to the existing sub-second live match engine. Historical matches, head-to-head records, team trends, player statistics, and competition standings are durably persisted with strict data provenance tracking (provider, provider ID, ingestion timestamp, normalization version, confidence rating) and deduplication.

---

### 2. Architecture & Data Flow

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

### 3. Key Milestones & Deliverables

#### Milestone 1: Shared Domain Models & Types (`@goalmills/types`)
- **`HistoricalMatchRecord`**: Match entity with `matchId`, `sport`, `competitionId`, `competitionSlug`, `season`, `date`, `status`, `homeTeam`, `awayTeam`, `finalScore`, `periodScores`, `events` (goals, cards, wickets, points), `lineups`, `venue`, `referee`, `provenance`.
- **`HistoricalTeamRecord`**: Team entity with `teamId`, `name`, `shortName`, `slug`, `sport`, `logo`, `country`, `founded`, `stadium`, `stats` (win/loss/draw, goal averages, clean sheets).
- **`HistoricalPlayerRecord`**: Player profile with `playerId`, `name`, `sport`, `currentTeam`, `position`, `nationality`, `careerStats`.
- **`HistoricalStandingsRecord`**: Season league tables with team rows (`rank`, `played`, `won`, `drawn`, `lost`, `points`, `goalDiff`, `form`).
- **`HeadToHeadSummary`**: Head-to-head historical matrix (total matches, home/away wins, total goals, recent meetings).
- **`DataProvenance`**: Metadata tracking `provider`, `providerId`, `ingestedAt`, `normalizationVersion`, `confidenceScore`.

#### Milestone 2: MongoDB Sports Warehouse Schemas (`apps/web`, `apps/admin`)
- Mongoose models:
  - `HistoricalMatch`: Compound indexes `{ sport: 1, competitionSlug: 1, date: -1 }`, `{ 'homeTeam.slug': 1, 'awayTeam.slug': 1 }`, `{ 'provenance.provider': 1, 'provenance.providerId': 1 }` (unique).
  - `HistoricalStandings`: Indexed by `{ sport: 1, competitionSlug: 1, season: 1 }`.
  - `HistoricalTeam`: Indexed by `{ sport: 1, slug: 1 }` (unique).
  - `HistoricalPlayer`: Indexed by `{ sport: 1, playerId: 1 }`.

#### Milestone 3: Sports Warehouse Ingestion & Synchronization Worker
- `SportsWarehouseService` (`apps/web/src/lib/warehouse/sportsWarehouseService.ts` & `apps/admin/src/lib/warehouse/sportsWarehouseService.ts`):
  - Ingestion hook connected to live sports feed completion and Phase 7 stream worker.
  - Idempotent upsert logic preventing duplicate match records.
  - Automatic calculation of Head-to-Head summaries, team form streaks (Last 5: W/D/L), and goal averages.

#### Milestone 4: Cross-Platform Sports Data Warehouse APIs (`apps/web`)
- `GET /api/warehouse/h2h`: Returns historical head-to-head analysis between two teams (e.g. `?sport=football&teamA=arsenal&teamB=chelsea`).
- `GET /api/warehouse/teams/[slug]/trends`: Returns team form, scoring trends, clean sheets, and recent fixture history.
- `GET /api/warehouse/competitions/[slug]/standings`: Historical season standings archive.
- `GET /api/warehouse/matches/[id]`: Durable deep match scorecard and event timeline.

#### Milestone 5: Web Historical Sports Intelligence Hub (`apps/web`)
- `<HeadToHeadComparisonCard />`: Deep head-to-head comparison card for match detail pages (`/football/match/[id]`, etc.).
- `<TeamTrendAnalyticsWidget />`: Form guide, goal averages, and defensive record charts.
- Standings & Historical Season selector in competition hubs.

#### Milestone 6: Admin Sports Warehouse Diagnostics & Management Studio (`apps/admin`)
- Dedicated `/admin/warehouse` dashboard:
  - **Warehouse Volume Metrics**: Total historical matches stored, active competitions, teams, and players.
  - **Data Provenance Inspector**: Provider sync status, confidence ratings, and ingestion timestamps.
  - **Warehouse Sync & Backfill Action**: Manual and scheduled trigger to backfill historical season data (`POST /api/admin/warehouse/sync`).
  - **Head-to-Head Sandbox**: Test historical queries and inspect match telemetry.
- Updated `AdminNavBar.tsx` with "Sports Warehouse" under CMS & Sports Data.

#### Milestone 7: Verification, Typechecks & Documentation
- Comprehensive Vitest unit tests for warehouse upserts, deduplication, H2H calculations, and provenance validation.
- Monorepo typecheck clean (`pnpm turbo run typecheck`).
- Complete documentation in `docs/scale-phase-8-architecture.md` and `docs/scale-phase-8-report.md`.
