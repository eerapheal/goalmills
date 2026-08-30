# GOALMILLS SCALE & REVENUE PROGRAM — PHASE 6 ARCHITECTURE
## Scalable Multi-Entity Search Infrastructure

```text
                               ┌────────────────────────┐
                               │  GoalMills Multi-Tenant│
                               │     Search Engine      │
                               └───────────┬────────────┘
                                           │
             ┌─────────────────────────────┼─────────────────────────────┐
             ▼                             ▼                             ▼
   ┌───────────────────┐         ┌───────────────────┐         ┌───────────────────┐
   │    apps/admin     │         │     apps/web      │         │   apps/mobiles    │
   ├───────────────────┤         ├───────────────────┤         ├───────────────────┤
   │ • Search Studio   │         │ • Search Portal   │         │ • Instant Search  │
   │ • Reindex Action  │         │ • Live Autocomplete│        │ • Autocomplete    │
   │ • Index Health    │         │ • Multi-Facets    │         │ • Sport Filters   │
   │ • Query Sandbox   │         │ • Keyword Highlit │         │                   │
   └─────────┬─────────┘         └─────────┬─────────┘         └─────────┬─────────┘
             │                             │                             │
             └─────────────────────────────┼─────────────────────────────┘
                                           │
                                           ▼
                               ┌────────────────────────┐
                               │     Search Router &    │
                               │  Relevance Evaluator   │
                               └───────────┬────────────┘
                                           │
                      ┌────────────────────┴────────────────────┐
                      ▼                                         ▼
            ┌───────────────────┐                     ┌───────────────────┐
            │  MongoDB Storage  │                     │   Upstash Redis   │
            ├───────────────────┤                     ├───────────────────┤
            │ • News Text Index │                     │ • Query Cache     │
            │ • Video Text Index│                     │ • Autocomplete TTL│
            │ • Newsletter Text │                     │ • Single-Flight   │
            │ • Weighted Score  │                     │                   │
            └───────────────────┘                     └───────────────────┘
```

---

### 1. Weighted Full-Text Scoring Matrix

Searches compute relevance based on weighted multi-field criteria:
- **Title Matches**: `Weight: 10`
- **Team Names Overlap**: `Weight: 8`
- **Competition Equality**: `Weight: 6`
- **Tags & Taxonomies**: `Weight: 4`
- **Excerpt / Description**: `Weight: 2`

---

### 2. Multi-Facet Filtering Engine

Facets are dynamically tallied during candidate evaluation across:
1. **Sports**: `football`, `cricket`, `basketball`, `tennis`, `baseball`, `hockey`.
2. **Entity Types**: `article`, `video`, `match`, `team`, `player`, `newsletter`.
3. **Date Ranges**: `today` (24h), `week` (7d), `month` (30d), `year` (365d), `all`.
4. **Competitions & Leagues**: Premier League, UEFA Champions League, IPL, NBA, etc.

---

### 3. Caching & Performance SLAs

- **Autocomplete Suggestions**: `< 15ms` (cached in Redis with 300s TTL under `search:suggest:{tenant}:{query}`).
- **Faceted Search Invocations**: `< 30ms` (cached in Redis with 60s TTL under `search:query:{tenant}:{hash}`).
- **Single-Flight Coalescing**: Prevents duplicate database queries during high-concurrency trending search spikes.
