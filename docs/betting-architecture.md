# GoalMills Betting Architecture & System Specification

**Role:** CTO & Principal Software Architect, GoalMills  
**Version:** 4.0.0 (Production Architecture)  
**Status:** Approved & Implemented  

---

## 1. Architectural Vision & Core Principles

GoalMills is a high-performance sports intelligence platform delivering live football scores, fixtures, standings, stats, news, and market intelligence across global sports. 

The **Betting Intelligence + Odds Comparison + Affiliate Platform** transforms passive odds display into a high-utility, high-converting intelligence hub while strictly adhering to the **GoalMills Ownership Hierarchy**:

```
                       GOALMILLS (Single Source of Truth)
  ┌────────────────────────────────────────────────────────────────────────┐
  │  Sports Data  │  Canonical Events  │  Competitions  │  Odds Engine     │
  │  Bookmakers   │  Affiliate Engine  │  Bet Intelligence │ Analytics     │
  │  Editorial    │  User Slips        │  Odds Alerts   │  UI / Experience │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │ Provider Abstraction Layer
            ┌─────────────────────────┴─────────────────────────┐
            ▼                                                   ▼
┌───────────────────────┐                           ┌───────────────────────┐
│ Existing Sports/Odds  │                           │   Betloy Provider     │
│ (Allsports / Football)│                           │ (Scan, Trim, Convert) │
└───────────────────────┘                           └───────────────────────┘
```

### Core Architecture Axioms:
1. **GoalMills Owns the Domain:** Betloy and upstream odds feeds are interchangeable external infrastructure providers. Under no circumstances is GoalMills a thin wrapper around any third party.
2. **Strict Informational Boundary:** All features are analytical and informational. GoalMills operates zero real-money wagering, wallets, payment deposits, cashouts, or bet acceptance.
3. **Objective Mathematical Integrity:** "Best Odds" calculations are mathematically pure. Sponsored/affiliate partner placements are clearly disclosed with badges and can never distort objective best odds.
4. **Resilient Circuit Breaking:** Provider downtime, rate limits, or external errors degrade gracefully into cached snapshots or fallback calculations without breaking page rendering.
5. **No Client-Side Secret Leakage:** `BETLOY_API_KEY` and affiliate secret tokens remain exclusively in secure server-side environments.

---

## 2. Domain Separation

The platform strictly partitions concerns into independent, loosely coupled layers:
1. **Sports Data Layer:** Matches, fixtures, team lineups, and live statistics fetched from core providers.
2. **Canonical Identity Layer (`gm_event_*`):** Resolves provider-specific event and bookmaker IDs into immutable GoalMills entities.
3. **Odds Engine:** Normalizes divergent bookmaker odds formats, calculates margins, tracks opening vs current movement, and selects objective best quotes.
4. **Bet Intelligence Tools:** Bet code decoding, multi-bookmaker odds scanning, AI risk analysis, accumulator editing, and risk trimming.
5. **Affiliate Engine:** Configuration-driven dynamic tracking templates, open-redirect mitigation, and non-PII click telemetry.
6. **Commercial Optimization Layer:** Dynamic priority scoring, geo-targeting, and CPA/RevShare yield tracking.
7. **Future Wagering Boundary:** Sealed architectural interfaces defining future sportsbook potential without implementing any gambling mechanisms.

---

## 3. Technology Stack & Multi-Tier Caching

- **Framework:** Next.js 16+ (Webpack) App Router
- **Language:** TypeScript 5+ (Strict mode, `@goalmills/types`)
- **Database:** MongoDB with Mongoose ODM (Compound indexes & automatic 90-day TTL)
- **Cache Strategy (`redisCache.ts`):**
  - **Static Registry & Affiliate Configs:** 1-hour TTL (`3600s`)
  - **Pre-match Odds Snapshots:** 60–90 seconds TTL with single-flight coalescing
  - **Live In-play Odds:** 5–15 seconds TTL
  - **Rate Limiting & Click Dedup:** 60-second sliding windows with in-memory bounded LRU fallback
