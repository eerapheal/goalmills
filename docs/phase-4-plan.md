# Phase 4 Architecture & Implementation Plan: GoalMills Betting Intelligence Platform

**Role:** CTO & Principal Software Architect, GoalMills  
**Status:** PROPOSED — PENDING APPROVAL  
**Domain:** Unified Betting Intelligence Platform, Bet Editor, Saved Slips, Odds Alerts & Commercial Intelligence  
**Target Phase:** Phase 4 — Unified Betting Workspace  

---

## 1. Executive & Architectural Vision

In Phases 1–3, GoalMills built:
1. **Phase 1:** Foundational betting domain, canonical event/bookmaker registry (`gm_event_*`), and secure configuration-driven affiliate engine.
2. **Phase 2:** Normalized Odds Comparison Engine, real-time objective best odds calculations, odds movement tracking, and match page integration.
3. **Phase 3:** Provider abstraction layer (`BetToolsProvider`), resilient Betloy integration with circuit breaker, bet code decoding, odds scanning, AI risk analysis, and risk trimming.

In **Phase 4**, we unify these individual capabilities into a coherent, high-converting **GoalMills Betting Intelligence Platform**:
- Dedicated Unified Workspace: `/betting` (Dashboard, Odds, Scanner, Analyzer, Editor, Saved Slips)
- Interactive **Bet Editor**: decode, remove risky legs, modify selections, recompute accumulator odds and win probabilities.
- **Bet Slip Saver & Public Sharing**: save, rename, archive, reopen, and share slips (`/bet-slip/:publicId`) with strict privacy controls.
- **Odds Alert Engine**: user-configured target odds monitoring (Email, Push, In-App).
- **Affiliate Intelligence & Commission Rules**: CPA, RevShare, Hybrid, Sponsored fixed placements with drill-down analytics.
- **Unified Analytics**: full lifecycle tracking from odds impression to affiliate conversion.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        GOALMILLS BETTING INTELLIGENCE PLATFORM                         │
│                                                                                        │
│  /betting            /betting/odds          /betting/scanner       /betting/analyzer   │
│  (Workspace Hub)     (Odds Directory)       (Odds Scanner)         (AI Risk Engine)    │
│                                                                                        │
│  /betting/editor     /betting/saved         /bet-slip/:publicId    Header & Mobile Nav │
│  (Slip Builder)      (User Slips)           (Secure Public Share)  (Global Entrypoint) │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ GoalMills REST APIs
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              GOALMILLS SERVICE LAYER                                   │
│  ┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────────────┐ │
│  │   betEditorService    │ │   betSlipSaverService │ │       oddsAlertService        │ │
│  └───────────────────────┘ └───────────────────────┘ └───────────────────────────────┘ │
│  ┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────────────┐ │
│  │ affiliateIntelligence │ │   bettingAnalytics    │ │   betToolsProvider / Betloy   │ │
│  └───────────────────────┘ └───────────────────────┘ └───────────────────────────────┘ │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ Mongoose Persistence & Redis Cache
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               PERSISTENCE & SCHEMAS                                    │
│  - BetSlip (publicId, legs, totalOdds, isPublic, status)                               │
│  - OddsAlert (eventId, marketId, targetOdds, channel, status)                          │
│  - AffiliateCommissionRule (bookmakerId, commissionType, value, currency)              │
│  - BettingAnalyticsEvent (event, bookmakerId, placement, anonymousVisitorId)           │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Modules & Step-by-Step Roadmap

### Step 1: Types & Domain Contracts (`packages/types/betting.ts`)
Define Phase 4 domain contracts:
- `SavedBetSlip`:
  - `id`, `publicId`, `userId`, `title`, `sourceBookmaker`, `originalCode`, `totalOdds`, `legs`, `isPublic`, `status`, `createdAt`, `updatedAt`
- `BetSlipEditRequest` & `BetSlipEditResult`:
  - leg additions, removals, selection updates, modified total odds, and delta
- `OddsAlert`:
  - `id`, `userId`, `eventId`, `sport`, `matchName`, `marketId`, `selection`, `targetOdds`, `targetDirection`, `channel`, `status`, `triggeredAt`
- `AffiliateCommissionRule`:
  - `bookmakerId`, `provider`, `country`, `commissionType` (`CPA` | `REV_SHARE` | `HYBRID` | `SPONSORED`), `commissionValue`, `currency`, `effectiveFrom`, `effectiveTo`
- `BettingAnalyticsEventPayload`:
  - `eventType`, `bookmakerId`, `eventId`, `placement`, `campaign`, `metadata`

### Step 2: Database Models (`apps/web/src/models/`)
Create Mongoose schemas with compound indexes:
1. `BetSlip.ts`:
   - `publicId` (indexed, unique, nanoid/token)
   - `userId` (indexed)
   - `title`, `sourceBookmaker`, `originalCode`, `totalOdds`, `legs`, `isPublic` (default `false`), `status` (`'ACTIVE' | 'ARCHIVED' | 'SETTLED'`)
2. `OddsAlert.ts`:
   - `userId` (indexed), `eventId` (indexed), `sport`, `matchName`, `marketId`, `selection`, `targetOdds`, `targetDirection`, `channel` (`'EMAIL' | 'PUSH' | 'IN_APP'`), `status` (`'ACTIVE' | 'TRIGGERED' | 'CANCELLED'`)
3. `AffiliateCommissionRule.ts`:
   - `bookmakerId` (indexed), `provider`, `country`, `commissionType`, `commissionValue`, `currency`, `effectiveFrom`, `effectiveTo`, `status`
4. `BettingAnalyticsEvent.ts`:
   - dedicated high-throughput schema for betting events with automatic 90-day TTL index.

### Step 3: Service Layer Implementation (`apps/web/src/lib/betting/`)
1. `betEditorService.ts`:
   - Decodes or initializes bet slips.
   - Supports removing legs, changing selections from valid markets, recalculating combined odds and variance.
   - Formats side-by-side original vs edited slip differences.
2. `betSlipSaverService.ts`:
   - Saves new slip with cryptographic nano publicId.
   - Updates title, tags, archives, and deletes slips.
   - Privacy enforcement: public access endpoint strictly filters out user identifiers and internal IDs.
3. `oddsAlertService.ts`:
   - Creates, lists, and cancels odds alerts.
   - Evaluates alerts against real-time odds snapshots (`recordOddsQuotesSnapshot`).
   - Dispatches alerts via generic notification abstraction.
4. `affiliateIntelligenceService.ts`:
   - Aggregates click and conversion data per bookmaker, sport, placement, campaign, and country.
   - Calculates projected commission earnings based on active commission rules.
5. `bettingAnalyticsService.ts`:
   - Dispatches and batches betting analytics events: `odds_viewed`, `bookmaker_viewed`, `best_odds_viewed`, `bet_now_clicked`, `affiliate_redirected`, `scanner_opened`, `scan_completed`, `bet_analyzed`, `bet_decoded`, `bet_converted`, `bet_trimmed`, `bet_edited`, `slip_saved`, `slip_shared`, `odds_alert_created`, `odds_alert_triggered`.

### Step 4: REST API Routes (`apps/web/src/app/api/v1/betting/`)
Create secure Next.js API route handlers:
- `GET /api/v1/betting/slips`: list user saved slips (with pagination & status filter)
- `POST /api/v1/betting/slips`: save new or edited bet slip
- `GET /api/v1/betting/slips/[id]`: retrieve individual slip (owner only)
- `PATCH /api/v1/betting/slips/[id]`: update/archive/rename slip
- `DELETE /api/v1/betting/slips/[id]`: delete saved slip
- `GET /api/v1/betting/slips/public/[publicId]`: retrieve public shareable slip (sanitized)
- `POST /api/v1/betting/alerts`: create new odds threshold alert
- `GET /api/v1/betting/alerts`: list user alerts
- `DELETE /api/v1/betting/alerts/[id]`: cancel/delete alert
- `POST /api/v1/betting/analytics/track`: record telemetry event
- `GET /api/v1/admin/affiliate/intelligence`: admin click & revenue overview

### Step 5: Frontend UI & Pages (`apps/web/src/app/betting/`)
1. **Unified Workspace Hub (`/betting/page.tsx`)**:
   - Executive dashboard greeting and Quick-Tool Launchpad.
   - Live Best Odds carousel for top upcoming fixtures.
   - Odds Movement ticker.
   - Embedded Bet Scanner & AI Analyzer.
   - Recent Saved Slips preview & Quick Actions.
2. **Dedicated Tool Pages**:
   - `/betting/odds/page.tsx`: Comprehensive market comparison directory across Football, Cricket, Basketball.
   - `/betting/scanner/page.tsx`: Full-screen odds comparison scanner.
   - `/betting/analyzer/page.tsx`: AI risk analysis with risk gauges and breakdown.
   - `/betting/editor/page.tsx`: Interactive slip builder (remove leg, adjust market, recalculate odds).
   - `/betting/saved/page.tsx`: Saved slips manager (filter by bookmaker/status, share link modal).
3. **Public Shareable Viewer (`/bet-slip/[publicId]/page.tsx`)**:
   - Publicly accessible page with OpenGraph cards (`og:title="Bet Slip on GoalMills"`).
   - Clean, branded accumulator card.
   - Zero private user info or internal credentials exposed.
   - CTA button: `[SCAN ACROSS BOOKMAKERS]` or `[BET NOW]` with affiliate attribution.
4. **Header Navigation**:
   - Add `Betting Intelligence` to `NAV_LINKS` in [Header.tsx](file:///d:/New%20folder/goalmills/apps/web/src/components/Header.tsx).

---

## 3. Strict Non-Negotiables & Security Boundaries

1. **No Real-Money Wagering**:
   - No deposits, withdrawals, balances, wallets, or direct bet placement. All features are strictly informational and tool-based.
2. **Privacy Controls for Shared Slips**:
   - Slips are `isPublic: false` by default.
   - Public view exposes only: `publicId`, `title`, `sourceBookmaker`, `totalOdds`, `legs` (match name, market, selection, odds).
   - Never exposes `userId`, IP addresses, or internal database object IDs.
3. **Objective Odds Integrity**:
   - Paid/sponsored placements will never manipulate objective Best Odds calculations.
   - Sponsored bookmakers are clearly designated with commercial badges.
4. **Resilient Degradation**:
   - If Betloy or upstream providers are degraded, saved slips, editor calculations, and odds alerts remain fully functional with cached data and mathematical calculations.

---

## 4. Verification & Testing Strategy

1. **Unit & Integration Tests (`npm test -- src/lib/betting`)**:
   - `betEditorService.test.ts`: Test leg removal, odds recalculation, and variance adjustments.
   - `betSlipSaverService.test.ts`: Test saving, nanoId generation, privacy enforcement, and public serialization.
   - `oddsAlertService.test.ts`: Test threshold condition checking (`>=` target) and alert triggering.
   - `affiliateIntelligence.test.ts`: Test CPA/RevShare calculations.
2. **Typecheck & Build Validation**:
   - `npx tsc --noEmit` across entire monorepo.
   - `pnpm run build:web` ensuring all new `/betting/*` and `/bet-slip/[publicId]` routes generate without errors.
3. **End-to-End User Flow**:
   - Scan code -> Send to Bet Editor -> Remove a leg -> Save slip -> Generate public link -> Open `/bet-slip/:publicId` -> Verify display and affiliate link.
