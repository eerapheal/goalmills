# GoalMills Platform — Target Architecture Blueprint (Phase 0)

**Document Version:** 1.0.0  
**Phase:** Phase 0 — Target Architectural State  
**Author:** Chief Technology Officer & Principal Software Architect, GoalMills  
**Date:** October 2026  
**Status:** PROPOSED ARCHITECTURAL BLUEPRINT  

---

## 1. Executive Summary & Architectural Vision

The target architecture transitions GoalMills from an application-coupled monorepo into a:

> **Modular Core Application + Selectively Extracted Enterprise Services**

This architecture achieves enterprise scalability, domain boundary clarity, and high developer velocity while avoiding the operational failure modes of premature microservices.

```text
                               GoalMills Platform
                                       │
                                API Gateway / BFF
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                Web App            Admin App          Mobile App
              (Next.js 16)        (Next.js 16)         (Expo RN)
                    │                  │                  │
                    └──────────────────┼──────────────────┘
                                       ▼
                              GoalMills Core (Modular)
                                       │
        ┌────────────┬─────────┼──────────┬───────────┬────────────┐
        ▼            ▼         ▼          ▼           ▼            ▼
     [Sports]    [Content]  [Identity] [Commercial] [Audience] [Analytics]
        │
        ├── Football
        ├── Cricket
        ├── Basketball
        ├── Matches & Fixtures
        ├── Standings & Tables
        ├── Canonical Entities
        └── Provider Adapters
               │
               ▼
      [Provider Interface]
        ├── AllSportsAPI Adapter
        ├── API-Football Adapter
        ├── Cricbuzz Adapter
        └── Betloy Adapter

       Independent Services                        Infrastructure
       ────────────────────                        ──────────────
       • services/newsletter (Go 1.22)             • infrastructure/redis
       • services/social-engine (Node/TS)          • infrastructure/database
                                                   • infrastructure/events
                                                   • packages/contracts
```

---

## 2. Guiding Architectural Principles

1. **Zero Functional Regression:** 100% of working functionality must be preserved. Behavior is never changed solely to satisfy theoretical structure.
2. **Modular Monolith Core First:** Business domains reside within a unified, deployable core with clean boundaries before any extraction is considered.
3. **Selective Service Extraction:** Microservices are reserved strictly for workloads with divergent runtimes, extreme throughput disparities, or strict fault-isolation requirements (e.g. Go Mailer and Social Engine).
4. **Isolate Third-Party Providers:** No UI or business logic depends directly on external API formats. All data flows through domain adapters.
5. **Centralized Infrastructure:** Redis, databases, logging, and events are treated as platform infrastructure, eliminating copy-pasted connection logic.
6. **Explicit Contracts Over Shared Code:** Applications communicate through versioned contracts and DTOs rather than sharing internal implementation details.

---

## 3. Target High-Level Monorepo Structure

```text
GoalMills Monorepo
│
├── apps/                        # Application Frontends & Gateways
│   ├── web/                     # Public Consumer Web Portal (Next.js 16)
│   ├── admin/                   # Staff, CMS & Operations Hub (Next.js 16)
│   └── mobile/                  # Native iOS & Android App (Expo / React Native)
│
├── core/                        # Modular Core Domain Modules
│   ├── sports/                  # Multi-sport domain, entities, normalizers & adapters
│   │   ├── domain/              # Entities: Match, Team, Player, Competition, Standing
│   │   ├── application/         # Use Cases: GetLiveMatches, GetStandings, CompareOdds
│   │   ├── infrastructure/      # External Provider Adapters (AllSports, API-Sports, Cricbuzz)
│   │   └── interface/           # DTOs and API route handlers
│   ├── content/                 # Articles, video highlights, categories, recommendations
│   ├── identity/                # Authentication, RBAC, sessions, tokens, user accounts
│   ├── commercial/              # Betting intelligence, bookmakers, sponsorships, affiliate
│   ├── audience/                # EMS campaign orchestration, subscriber state machine
│   ├── warehouse/               # Historical match, team, and standings archives
│   └── analytics/               # Event tracking, clickstream, advertiser metrics
│
├── services/                    # Independent Enterprise Microservices
│   ├── newsletter/              # High-throughput Go 1.22 mailer, queues, domain shaping
│   └── social-engine/           # Automated social media graphics and multi-platform publishing
│
├── infrastructure/              # Shared Infrastructure Adapters
│   ├── redis/                   # Centralized Redis client, in-memory fallback, cache policies
│   ├── database/                # MongoDB connection management, connection pooling, base schemas
│   ├── events/                  # Event dispatcher (In-memory/Redis PubSub)
│   ├── logging/                 # Structured JSON logger with request correlation IDs
│   └── monitoring/              # Health checks, readiness probes, telemetry metrics
│
├── packages/                    # Shared Monorepo Packages
│   ├── contracts/               # Shared API request/response schemas, DTOs, Event payloads
│   ├── types/                   # Core TypeScript types and domain interfaces
│   ├── ui/                      # Design system tokens, components, palettes
│   ├── validation/              # Zod / schema validation rules
│   └── config/                  # Shared ESLint, Prettier, and TypeScript configurations
│
└── docs/                        # Architecture decision records (ADRs) and system specs
```

---

## 4. Domain Module Design & Boundaries

Each domain within `core/` adheres to a clean, layered architecture:

```text
core/<domain>/
├── domain/                      # Core business models, entities, and domain rules (Zero external dependencies)
├── application/                 # Use cases, orchestrators, query services, command handlers
├── infrastructure/              # Repositories (Mongoose), external API clients, Redis caches
└── interface/                   # Route adapters, HTTP controllers, serializers
```

### 4.1 Sports Domain (`core/sports`)
Isolates external sports provider instability and schema changes from the rest of the application:
```text
GoalMills Sports Domain (Unified Entities)
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

### 4.2 Commercial Domain (`core/commercial`)
Consolidates betting intelligence, affiliate attribution, and sponsor ad delivery:
- **Affiliate Sub-domain:** Tracks click-through conversions, dynamic query parameter stamping, and affiliate revenue reporting.
- **Odds Intelligence Sub-domain:** Canonical match ID reconciliation, arbitrage detection, multi-bookmaker margin calculations.
- **Sponsorship Sub-domain:** Banner impressions, frequency capping, campaign scheduling.

### 4.3 Audience Domain (`core/audience`)
Manages newsletter subscriber lifecycle:
- Double opt-in state machine: `PENDING_CONFIRMATION` ➔ `CONFIRMED` ➔ `UNSUBSCRIBED` / `SUPPRESSED`.
- Seamless internal contract with `services/newsletter` (Go Mailer).

---

## 5. Independent Microservices Preservation Strategy

### 5.1 Newsletter Service (`services/newsletter` / Go 1.22)
- **Decision:** **RETAIN 100% INDEPENDENT.**
- **Rationale:** High-concurrency worker pools (25 domain workers), multi-domain TCP connection shaping, and raw MIME formatting benefit immensely from Go's lightweight goroutines and low memory footprint.
- **Contract Boundary:**
  - `GoalMills Core ──▶ POST /api/dispatch ──▶ Go Mailer`
  - `Go Mailer ──▶ POST /api/webhooks/mailer ──▶ GoalMills Core`
  - No database sharing: Mailer remains a stateless execution worker with priority queues.

### 5.2 Social Engine Service (`services/social-engine` / Node.js)
- **Decision:** **RETAIN 100% INDEPENDENT.**
- **Rationale:** Native image manipulation (`sharp`, canvas rendering) and intensive third-party platform API handshakes (Twitter, Telegram, WhatsApp) are CPU/IO-heavy operations that must not block public web response times.
- **Contract Boundary:**
  - `GoalMills Admin ──▶ REST / Webhooks ──▶ Social Engine`
  - Social Engine maintains independent cron schedules and platform token vaults.

---

## 6. Shared Infrastructure Strategy

### 6.1 Redis Abstraction (`infrastructure/redis`)
Eliminates duplicated `ioredis` configuration and in-memory fallback boilerplate across `apps/web` and `apps/admin`:
```typescript
// infrastructure/redis/src/index.ts
export interface CacheClient {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  invalidatePattern(pattern: string): Promise<number>;
  isHealthy(): boolean;
}
```

### 6.2 Database Unification (`infrastructure/database`)
Eliminates the 29 duplicated Mongoose model definitions between `web` and `admin`:
- Models are defined once in their respective `core/<domain>` infrastructure layer or `infrastructure/database/models`.
- Both `web` and `admin` import identical, strongly-typed Mongoose models.

---

## 7. Migration Phasing & Evolution Path

To guarantee **zero functional downtime**, restructuring executes incrementally across 10 defined phases:

```text
Phase 0: Discovery & Documentation Baseline        [CURRENT]
    │
    ▼
Phase 1: Safety Baseline & Test Suite Verification
    │
    ▼
Phase 2: Domain Boundary Definition & Adapter Shims
    │
    ▼
Phase 3: Centralized Infrastructure Extraction (Redis, DB, Logger)
    │
    ▼
Phase 4: Go Mailer Service Contract Formalization
    │
    ▼
Phase 5: Social Engine Contract Formalization
    │
    ▼
Phase 6: Core Sports Domain Ingestion & Normalization
    │
    ▼
Phase 7: Application Layer Decoupling & Dead Code Cleanup
    │
    ▼
Phase 8: Comprehensive Integration & Regression Testing
    │
    ▼
Phase 9: Performance Benchmarking & SLA Auditing
    │
    ▼
Phase 10: Final Documentation & Production Verification
```

---

## 8. Service Ownership & Governance Matrix

| Subsystem | Primary Responsibility | Runtime / Stack | Data Ownership | Deployment Target |
| :--- | :--- | :--- | :--- | :--- |
| **Core Platform** | Sports, Content, Users, Commercial | Next.js / Node.js / TS | MongoDB Atlas | Vercel Serverless |
| **Go Mailer** | High-throughput email dispatch | Golang 1.22 | In-memory Queues | Render Container |
| **Social Engine** | Automated graphic rendering & social posts | Node.js / Express | MongoDB / Cloudinary | Render Container |
| **Web Portal** | Public UI & Realtime Streaming | Next.js 16 Webpack | Consumes Core APIs | Vercel Edge |
| **Admin Hub** | Editorial CMS, Operations & EMS | Next.js 16 | Consumes Core APIs | Vercel Edge |
| **Mobile App** | Cross-platform native reader | Expo 52 / React Native | Local cache + Core APIs | App Store / Play Store |
