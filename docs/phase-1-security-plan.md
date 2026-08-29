# GoalMills — Phase 1 Production Security & Data Integrity Plan

**Document Version:** 1.0.0  
**Phase:** Phase 1 (Production Security + Data Integrity Hardening)  
**Status:** In Execution  

---

## 1. Executive Summary

Phase 1 focuses on eliminating critical security vulnerabilities, guaranteeing sports data integrity, hardening authentication and administrative boundaries, safeguarding sports API quotas, and preventing fabricated or stale data presentation on the consumer portal.

---

## 2. Prioritized Findings & Remediation Plan

### Finding 1: Sports Client Secrets Leakage via `NEXT_PUBLIC_*`
- **Severity:** `HIGH`
- **Affected Files:**
  - `apps/web/src/services/basketballApi.ts`
  - `apps/web/src/services/apiFootball.ts`
- **Risk:** If credentials were configured in `NEXT_PUBLIC_*`, webpack bundle injection would expose upstream API keys to client browsers.
- **Implementation Plan:**
  1. Remove all unused `NEXT_PUBLIC_API_FOOTBALL_KEY_WEB` / `NEXT_PUBLIC_API_BASKETBALL_KEY_WEB` references in web services.
  2. Enforce that all client requests strictly route through the backend proxy routes (`/api/football`, `/api/basketball`, `/api/cricket`).
- **Testing Plan:** Verify that client bundle contains zero sports provider API keys.

---

### Finding 2: Unsafe Top-Level Database Connection Throw
- **Severity:** `MEDIUM`
- **Affected Files:**
  - `apps/web/src/lib/db.ts`
  - `apps/admin/src/lib/db.ts`
- **Risk:** Top-level throw upon module import breaks test runners or serverless warmups when environment variables are injected at runtime.
- **Implementation Plan:**
  1. Move environment variable check inside `dbConnect()`.
  2. Add strict production runtime validation helper.
- **Testing Plan:** Verify `pnpm test` and `pnpm typecheck` execute cleanly without throwing during mock module resolution.

---

### Finding 3: Centralized Production Environment Validation
- **Severity:** `HIGH`
- **Affected Files:**
  - `apps/web/src/lib/env.ts` (NEW)
  - `apps/admin/src/lib/env.ts` (NEW)
- **Risk:** In production, missing critical environment variables (e.g. `MONGODB_URL`, `NEXTAUTH_SECRET`) could cause runtime crashes or insecure fallbacks.
- **Implementation Plan:**
  1. Create `validateEnv()` to check required variables on production startup.
  2. Fall back cleanly in test/development environments with explicit logs.
- **Testing Plan:** Unit test `validateEnv()` under production and test conditions.

---

### Finding 4: Comprehensive API Security Inventory
- **Severity:** `HIGH`
- **Affected Files:**
  - `docs/api-security-inventory.md` (NEW)
- **Risk:** Uncatalogued endpoints can become targets for unauthorized access, parameter tampering, and un-rate-limited scraping.
- **Implementation Plan:**
  1. Catalogue every route handler in `apps/web/src/app/api` and `apps/admin/src/app/api`.
  2. Classify by Method, Path, Access Tier (Public / Authenticated / Admin), Rate Limiting, and Data Source.
- **Testing Plan:** Review all listed routes against the codebase.

---

### Finding 5: Live Sports Data Trust & Stale State Indicators
- **Severity:** `HIGH`
- **Affected Files:**
  - `apps/web/src/components/FootballScreen.tsx`
  - `apps/web/src/components/CricketScreen.tsx`
  - `apps/web/src/components/BasketballScreen.tsx`
  - `apps/web/src/app/page.tsx`
- **Risk:** Displaying stale cached scores as active "LIVE" or rendering fabricated accuracy percentages deceives consumers.
- **Implementation Plan:**
  1. Ensure live badges are only rendered when upstream data confirms `event_live === '1'` or short status `1H`, `2H`, `HT`, `LIVE`.
  2. When match feeds fail or return empty, display clear timestamps and "Live data temporarily unavailable" states with refresh triggers.
  3. Ensure predictions display mathematical validity (`home + draw + away ≈ 100%`) or display "Prediction unavailable".
- **Testing Plan:** Add data integrity regression tests for live status and failure handling.

---

### Finding 6: Security & Data Integrity Regression Test Suite
- **Severity:** `HIGH`
- **Affected Files:**
  - `apps/web/src/lib/__tests__/security.test.ts` (NEW)
  - `apps/web/src/lib/__tests__/dataIntegrity.test.ts` (NEW)
- **Risk:** Future code edits could re-introduce NoSQL injection, XSS vectors, or unnormalized sports data structures.
- **Implementation Plan:**
  1. Add tests verifying `sanitizeObject`, `sanitizeHtml`, and `escapeRegex`.
  2. Add tests verifying `adaptStanding`, `adaptFixture`, and prediction math consistency.
- **Testing Plan:** Run `pnpm --filter web test`.
