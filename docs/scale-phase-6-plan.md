# GOALMILLS SCALE & REVENUE PROGRAM — PHASE 6 PLAN
## Scalable Search Infrastructure

### 1. Executive Summary
Phase 6 delivers a high-speed, multi-entity search engine across GoalMills Web, Mobile, and Admin applications. It provides full-text indexed searches across sports articles, video highlights, newsletters, teams, competitions, and players with sub-15ms autocomplete suggestions, multi-facet filtering (sport, competition, team, date range, entity type), and dedicated Admin Search Diagnostics.

---

### 2. Architecture & Scope

```text
┌────────────────────────────────────────────────────────────┐
│                  GOALMILLS SEARCH ENGINE                   │
├────────────────────────────────────────────────────────────┤
│ 1. FULL-TEXT SEARCH: Weighted text indexes & relevance     │
│ 2. AUTOCOMPLETE: Sub-15ms instant suggestion chips         │
│ 3. MULTI-FACET FILTER: Sports, competitions, dates, types  │
│ 4. REDIS CACHING: Single-flight query coalescing           │
│ 5. ADMIN DIAGNOSTICS: Index health, doc count & reindex    │
│ 6. CROSS-PLATFORM: Responsive web portal & mobile search   │
└────────────────────────────────────────────────────────────┘
```

---

### 3. Key Milestones

- **Milestone 1**: Shared Type System (`@goalmills/types`) for search queries, results, facets, and diagnostics.
- **Milestone 2**: Search Engine & Redis Cache Layer (`apps/web/src/lib/searchService.ts`).
- **Milestone 3**: Search Delivery APIs (`/api/search`, `/api/search/suggest`) & Web Search Portal (`/search`).
- **Milestone 4**: Admin Search Diagnostics Studio (`/admin/search`) with re-indexing & health endpoints.
- **Milestone 5**: Mobile Search Screen & SDK (`apps/mobiles/src/screens/SearchScreen.tsx`).
- **Milestone 6**: Automated Verification, Typecheck, and Documentation (`scale-phase-6-architecture.md`, `scale-phase-6-report.md`).
