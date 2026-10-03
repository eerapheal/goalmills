# GoalMills Platform — Phase 7 Implementation Plan

**Document Version:** 1.0.0  
**Phase:** Phase 7 — Application Layer Decoupling & Dead Code Cleanup  
**Author:** Chief Technology Officer & Principal Software Architect, GoalMills  
**Date:** October 2026  
**Status:** PROPOSED & PENDING USER APPROVAL  

---

## 1. Executive Summary & Objective

With the completion of **Phase 2 through Phase 6** (all 7 core business domains, shared infrastructure, service contracts for Go Mailer & Social Engine, and multi-sport normalization), **Phase 7** decouples the application frontends (`apps/web`, `apps/admin`) from redundant internal code:

```text
┌─────────────────────────────────────────────────────────────┐
│                 Phase 7 Decoupling Pipeline                 │
└──────────────────────────────┬──────────────────────────────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
 [Dead Code Audit]      [Model Shim Trim]     [Build Verification]
 • Remove orphan files  • Clean re-exports    • Web Next.js Build
 • Purge duplicate types• Decouple monolithic • Admin Webpack Build
 • Unify env loaders      data access         • Zero route breaks
```

---

## 2. Phase 7 Work Breakdown Structure (WBS)

### Step 7.1: Model & Infrastructure Shim Audit
- Inspect `apps/web/src/models` and `apps/admin/src/models` to ensure all 29 duplicated models cleanly point to `@goalmills/infrastructure-database`.
- Purge redundant duplicate schemas, unused local interfaces, and legacy connection scripts.

### Step 7.2: Decouple Caching & Redis Access
- Standardize all cache lookups across `apps/web` and `apps/admin` through `@goalmills/infrastructure-redis`.
- Remove ad-hoc in-memory store implementations that were previously copy-pasted across utility files.

### Step 7.3: TypeScript Build & Route Generation Verification
- Execute full production builds to verify all dynamic and static Next.js routes:
  - `pnpm --filter web build` (Validate 109 Next.js routes).
  - `pnpm --filter admin build` (Validate 107 Next.js admin routes).
- Ensure zero broken links, missing exports, or unresolved imports.

### Step 7.4: Comprehensive Quality & Regression Verification
- Run static typechecks across all 20 workspace projects (`tsc --noEmit`).
- Execute core regression test suites:
  - `redisResilience.test.ts`
  - `dataIntegrity.test.ts`
  - `sportsNormalization.test.ts`
  - `betloyIntegration.test.ts`
