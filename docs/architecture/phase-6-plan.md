# GoalMills Platform — Phase 6 Implementation Plan

**Document Version:** 1.0.0  
**Phase:** Phase 6 — Core Sports Domain Ingestion & Normalization  
**Author:** Chief Technology Officer & Principal Software Architect, GoalMills  
**Date:** October 2026  
**Status:** PROPOSED & PENDING USER APPROVAL  

---

## 1. Executive Summary & Objective

In accordance with Blueprint Section 4.1, the **Sports Domain (`core/sports`)** isolates external sports provider instability and schema changes from the rest of the application:

```text
GoalMills Sports Domain (Unified Canonical Entities)
                   ▲
                   │
       ┌─────────────────────────┐
       │ Sports Provider Adapter │
       │ (Abstract Interface)    │
       └─────────────────────────┘
         ├── AllSportsAPIAdapter   ──▶ AllSportsAPI
         ├── ApiFootballAdapter    ──▶ API-Football
         ├── CricbuzzAdapter       ──▶ Cricbuzz RapidAPI
         └── BetloyOddsAdapter     ──▶ Betloy Odds API
```

**Phase 6** consolidates sports ingestion, circuit breakers, multi-sport normalizers (Football, Cricket, Basketball), and live match polling into `@goalmills/core-sports`, providing a unified service layer for `apps/web` and `apps/mobile`:

---

## 2. Phase 6 Work Breakdown Structure (WBS)

### Step 6.1: Provider Ingestion & Circuit Breaking (`@goalmills/core-sports`)
- Unify the provider pipeline with:
  - Rate-limit spacing (250ms gap protection).
  - Exponential backoff retry with jitter (max 3 retries, excluding 401/403).
  - Circuit breaker (trips on consecutive provider failures, serving stale cache or graceful fallback).
  - Single-flight deduplication via `@goalmills/infrastructure-redis`.

### Step 6.2: Multi-Sport Normalization Engine (`@goalmills/core-sports`)
- **Football Normalizer:** First half, half-time, extra time, penalty shootouts, standings tables, form guides.
- **Cricket Normalizer:** Innings, overs, wickets, runs, run rates, batting/bowling statistics.
- **Basketball Normalizer:** Quarters, overtime, game clock, fouls, box scores.
- Freshness indicators: `lastUpdatedAt`, `receivedAt`, `isStale`.

### Step 6.3: Application Layer Shimming & Route Ingestion
- Ensure `apps/web/src/lib/sports/` and `apps/web/src/app/api/sports/` route handlers consume canonical entities and normalizers from `@goalmills/core-sports`.
- Verify backward compatibility for all sports feeds and live score pollers.

### Step 6.4: Comprehensive Quality & Regression Verification
- Run static typechecks across all 20 workspace projects (`web`, `admin`, `core/*`, `infrastructure/*`, `contracts`).
- Execute sports test suites:
  - `sportsNormalization.test.ts`
  - `stageArchitecture.test.ts`
  - `betloyIntegration.test.ts`
- Verify zero functional regressions.
