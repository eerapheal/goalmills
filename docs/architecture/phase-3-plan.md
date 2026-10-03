# GoalMills Platform — Phase 3 Implementation Plan

**Document Version:** 1.0.0  
**Phase:** Phase 3 — Centralized Infrastructure Extraction (Redis, Database, Events & Logging)  
**Author:** Chief Technology Officer & Principal Software Architect, GoalMills  
**Date:** October 2026  
**Status:** PROPOSED & PENDING USER APPROVAL  

---

## 1. Executive Summary & Objective

With **Phase 2 (Domain Boundary Definition & Modular Core Packages)** 100% complete across all 7 business domains (`sports`, `content`, `commercial`, `audience`, `identity`, `analytics`, `warehouse`), **Phase 3** executes the consolidation and extraction of shared platform infrastructure:

1. **Centralized Database Engine (`@goalmills/infrastructure-database`)**:
   - Eliminates the **29 duplicated Mongoose schemas and models** currently copy-pasted across `apps/web/src/models` and `apps/admin/src/models`.
   - Establishes a unified connection manager with pooling, graceful reconnection, and serverless lifecycle handling.
2. **Centralized Redis & Multi-Tier Caching (`@goalmills/infrastructure-redis`)**:
   - Consolidates duplicated `ioredis` / Upstash connection logic between `apps/web/src/lib/redisCache.ts` and `apps/admin/src/lib/redisCache.ts`.
   - Provides standardized cache-aside wrappers, single-flight request stampede deduplication, and in-memory failover.
3. **Structured Correlation Logging (`@goalmills/infrastructure-logging`)**:
   - Integrates JSON structured logger with distributed correlation ID propagation (`X-Correlation-ID`) across API handlers.
4. **Platform Event Bus (`@goalmills/infrastructure-events`)**:
   - Lightweight, type-safe event dispatcher for cross-domain decoupled communication (`subscriber.confirmed`, `odds.updated`, `article.published`).
5. **Zero Functional Regression**:
   - Preserve 100% of existing unit tests (e.g. `redisResilience.test.ts`, `dataIntegrity.test.ts`), Next.js routes, and build scripts.

---

## 2. Inventory of Current Duplications to Resolve

| Infrastructure Subsystem | Current `apps/web` Location | Current `apps/admin` Location | Phase 3 Target Unified Package |
| :--- | :--- | :--- | :--- |
| **Redis Cache Engine** | `apps/web/src/lib/redisCache.ts` | `apps/admin/src/lib/redisCache.ts` | `@goalmills/infrastructure-redis` |
| **MongoDB Connection** | `apps/web/src/lib/mongodb.ts` | `apps/admin/src/lib/mongodb.ts` | `@goalmills/infrastructure-database` |
| **Article Models** | `apps/web/src/models/Article.ts` | `apps/admin/src/models/Article.ts` | `@goalmills/infrastructure-database` |
| **Affiliate Models** | `apps/web/src/models/AffiliateConversion.ts` | `apps/admin/src/models/Affiliate...` | `@goalmills/infrastructure-database` |
| **Subscriber Models** | `apps/web/src/models/Subscriber.ts` | `apps/admin/src/models/Subscriber.ts` | `@goalmills/infrastructure-database` |
| **Sponsorship Models** | `apps/web/src/models/Sponsorship.ts` | `apps/admin/src/models/Sponsorship.ts`| `@goalmills/infrastructure-database` |
| **Logger & Telemetry** | Ad-hoc `console.log` / local logger | Ad-hoc `console.log` / local logger | `@goalmills/infrastructure-logging` |

---

## 3. Detailed Work Breakdown Structure (WBS)

### Step 3.1: Database Infrastructure (`@goalmills/infrastructure-database`)
- Initialize `@goalmills/infrastructure-database` package (`package.json`, `tsconfig.json`).
- Implement `connection.ts`:
  - Unified `connectToDatabase()` with Mongoose connection cache for Next.js hot-reloading & serverless warm containers.
  - Connection event telemetry (`connected`, `error`, `disconnected`).
- Consolidate canonical Mongoose schemas:
  - `models/Article.ts`
  - `models/NewsletterSubscriber.ts`
  - `models/AffiliateConversion.ts`
  - `models/Sponsorship.ts`
  - `models/AdminUser.ts`
  - `models/SystemConfig.ts`
- Export strongly-typed models and connection utilities from `src/index.ts`.

### Step 3.2: Complete Redis Infrastructure (`@goalmills/infrastructure-redis`)
- Enhance `@goalmills/infrastructure-redis` with real `ioredis` connection pooling and Upstash TLS configuration.
- Implement `cacheAside<T>(key, fetcher, ttlSeconds)` helper with single-flight promise caching to prevent cache stampedes.
- Provide backward-compatible shim in `apps/web/src/lib/redisCache.ts` and `apps/admin/src/lib/redisCache.ts` re-exporting the centralized engine.

### Step 3.3: Platform Event Bus (`@goalmills/infrastructure-events`)
- Create `@goalmills/infrastructure-events`:
  - In-memory event emitter for synchronous/asynchronous in-process domain events.
  - Interface for future Redis PubSub distributed transport.
  - Strongly-typed event contracts (`DomainEvent<T>`).

### Step 3.4: Application Layer Shimming & Integration
- Update `apps/web/src/models` and `apps/admin/src/models` to re-export unified models from `@goalmills/infrastructure-database`.
- Ensure zero breakage across the 109 web routes and 107 admin routes.
- Update `package.json` dependencies in `apps/web` and `apps/admin`.

### Step 3.5: Comprehensive Quality & Regression Verification
- Run static typechecks across all 19 workspace projects:
  - `pnpm --filter @goalmills/infrastructure-database typecheck`
  - `pnpm --filter @goalmills/infrastructure-redis typecheck`
  - `pnpm --filter web typecheck`
  - `pnpm --filter admin typecheck`
- Execute critical infrastructure test suites:
  - `redisResilience.test.ts`
  - `dataIntegrity.test.ts`

---

## 4. Rollback & Safety Strategy

1. **Non-Destructive Shimming**: Existing application files in `apps/web/src/models/` and `apps/web/src/lib/` will initially act as shims pointing to the extracted infrastructure packages. This guarantees that zero internal imports or route handlers break.
2. **Atomic Commits**: Each infrastructure module will be committed upon verified typecheck and test pass.
3. **No Database Schema Alterations**: Collection names, indexes, and document structures remain 100% identical to current production schemas.
