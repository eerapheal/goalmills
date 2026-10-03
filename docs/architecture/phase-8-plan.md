# GoalMills Platform — Target Architecture Blueprint
## Phase 8: Comprehensive Integration & Regression Testing

### 1. Context & Objectives
With the completion of **Phases 0 through 7**, the GoalMills platform has successfully migrated from monolithic, duplicated applications into a clean, decoupled architecture:
- **7 Core Domains:** [`@goalmills/core-sports`](file:///d:/New%20folder/goalmills/core/sports), [`@goalmills/core-content`](file:///d:/New%20folder/goalmills/core/content), [`@goalmills/core-commercial`](file:///d:/New%20folder/goalmills/core/commercial), [`@goalmills/core-audience`](file:///d:/New%20folder/goalmills/core/audience), [`@goalmills/core-identity`](file:///d:/New%20folder/goalmills/core/identity), [`@goalmills/core-analytics`](file:///d:/New%20folder/goalmills/core/analytics), [`@goalmills/core-warehouse`](file:///d:/New%20folder/goalmills/core/warehouse).
- **4 Centralized Infrastructure Packages:** [`@goalmills/infrastructure-database`](file:///d:/New%20folder/goalmills/infrastructure/database), [`@goalmills/infrastructure-redis`](file:///d:/New%20folder/goalmills/infrastructure/redis), [`@goalmills/infrastructure-events`](file:///d:/New%20folder/goalmills/infrastructure/events), [`@goalmills/infrastructure-logging`](file:///d:/New%20folder/goalmills/infrastructure/logging).
- **Formalized Service Contracts:** [`@goalmills/contracts`](file:///d:/New%20folder/goalmills/packages/contracts) (Go Mailer, Social Engine, Realtime).
- **De-duplicated Application Layers:** Both `apps/web` and `apps/admin` rely on shared canonical models and caching abstractions, eliminating over 1,100 lines of duplicated code.

**Phase 8 Focus:**
Execute rigorous monorepo-wide integration and regression testing to formally validate that all internal packages, services, applications, and critical business flows interoperate seamlessly with zero regressions.

---

### 2. Scope & Execution Plan

#### Step 1: Monorepo-Wide TypeScript Typecheck
- Validate that all 20 packages in the workspace pass `tsc --noEmit` without error:
  - `apps/web` & `apps/admin`
  - `core/*` (sports, content, commercial, audience, identity, analytics, warehouse)
  - `infrastructure/*` (database, redis, logging, events)
  - `packages/*` (types, contracts, ui)

#### Step 2: Cross-Domain Unit & Contract Integration Tests
- Run and verify all domain test suites:
  - **Sports normalization & resilience:** Football, Cricket, Basketball normalizers, ProviderCircuitBreaker rate spacing & backoff.
  - **Go Mailer service contracts:** Protocol parity between Go 1.22 mailer (`services/mailer`) and `@goalmills/contracts` / `@goalmills/core-audience`.
  - **Social engine contracts:** Platform formatting (Twitter, Telegram, WhatsApp, Facebook, LinkedIn, YouTube).
  - **Database & Cache adapters:** Connection pooling, single-flight stampede coalescing, memory fallback.

#### Step 3: Critical End-to-End Business Flow Validation
1. **Live Sports Flow:** Ingestion ──▶ ProviderCircuitBreaker ──▶ SportNormalizer ──▶ Normalized `UnifiedMatch` ──▶ Redis CacheAside.
2. **Audience & Newsletter Flow:** Subscription ──▶ Email Validation & Health Gating ──▶ HMAC Token Generation ──▶ MailerServiceClient ──▶ Webhook Dispatch.
3. **Commercial & Ad Placement Flow:** Sponsorship Query ──▶ Targeting Filter (device, country, sport) ──▶ Tracking Impression/Click ──▶ Budget Deductions.
4. **Editorial & Content Pipeline:** Article Creation ──▶ Slug Generation ──▶ Status Transitions (draft, pending_approval, published) ──▶ Public Filter Middleware Gating.

#### Step 4: Verification & Git Commit
- Document all test outcomes and verification metrics.
- Update `target-state.md` to record Phase 8 [COMPLETED].
- Commit changes to `product-ready` branch.

---

### 3. Acceptance Criteria
- [ ] 100% of workspace packages compile with 0 TypeScript diagnostics.
- [ ] All cross-domain integration test suites pass with zero failures.
- [ ] All Go service test suites pass cleanly.
- [ ] Zero regression on consumer and admin Next.js routes.
