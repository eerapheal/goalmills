# Phase 3 Architecture & Implementation Plan: Betloy Integration & Betting Intelligence Tools

**Role:** CTO & Principal Software Architect, GoalMills  
**Status:** PROPOSED — PENDING APPROVAL  
**Domain:** Betting Intelligence & Odds Comparison  
**Target Phase:** Phase 3 — Betloy Integration behind Provider Abstraction  

---

## 1. Executive & Architectural Vision

In Phase 1 and Phase 2, GoalMills established:
1. **Canonical Event & Bookmaker Registry** (`gm_event_*`, single source of truth for 10+ bookmakers).
2. **Normalized Odds & Best Odds Engine** (objective, real-time margin/payout calculations with odds movement tracking).
3. **Secure Affiliate Redirection Engine** (open-redirect protection, server-side destination resolution, click analytics).

In **Phase 3**, we integrate Betloy's advanced bet code intelligence capabilities:
- **Odds Scanner** (`POST /scan`)
- **Bet Code Decoder** (`POST /decode`)
- **AI Bet Analyzer** (`POST /analyze`)
- **Risk Trimmer** (`POST /trim`)
- **Bet Code Converter** (`POST /convert`)
- **Bookmaker Directory & Health/Usage** (`GET /bookmakers`, `GET /usage`, `GET /health`)

### The Non-Negotiable Core Principle
> **GoalMills owns the user experience, domain models, database, analytics, affiliate engine, and frontend.**  
> Betloy is strictly an interchangeable, external infrastructure provider. Under no circumstances will GoalMills be built as a thin wrapper around Betloy. If Betloy is swapped with another provider in the future, zero lines of UI, database, or affiliate logic will need to be rewritten.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        GOALMILLS CLIENT LAYER                          │
│     (Match Details Page, Odds Matrix, Bet Scanner, Bet Analyzer UI)    │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ GoalMills API / DTOs
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        GOALMILLS SERVER LAYER                          │
│     Next.js API Routes: /api/v1/betting/(scan|decode|analyze|trim)     │
└──────────────┬─────────────────────┬───────────────────┬───────────────┘
               │                     │                   │
               ▼                     ▼                   ▼
┌─────────────────────────┐ ┌─────────────────┐ ┌─────────────────────────┐
│     AFFILIATE ENGINE    │ │ REDIS CACHE &   │ │ CANONICAL BOOKMAKERS    │
│  (Secure Redirect URLs) │ │ RATE LIMITING   │ │ & PROVIDER MAPPING      │
└─────────────────────────┘ └─────────────────┘ └─────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    BetToolsProvider (TypeScript Interface)             │
├────────────────────────────────────────────────────────────────────────┤
│  + decodeBet(req): Promise<DecodedBetSlip>                             │
│  + scanOdds(req): Promise<NormalizedBetScanResult>                     │
│  + analyzeBet(req): Promise<NormalizedBetAnalysisResult>               │
│  + convertBet(req): Promise<NormalizedBetConvertResult>                 │
│  + trimBet(req): Promise<NormalizedBetTrimResult>                       │
│  + getBookmakers(): Promise<ProviderBookmakerSummary[]>                 │
│  + healthCheck(): Promise<ProviderHealthStatus>                         │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                   ┌─────────────────┴─────────────────┐
                   ▼                                   ▼
┌─────────────────────────────────────┐ ┌────────────────────────────────┐
│            BetloyAdapter            │ │      MockBetToolsProvider      │
│  - Circuit Breaker & Retry Strategy │ │  - Deterministic Mock Data     │
│  - Request Correlation & Logging    │ │  - Offline Dev & Test Suite    │
│  - Canonical Identity Normalization │ └────────────────────────────────┘
└──────────────────┬──────────────────┘
                   │ HTTPS (Bearer Token)
                   ▼
┌─────────────────────────────────────┐
│          BETLOY EXTERNAL API        │
│          (https://betloy.com/api)   │
└─────────────────────────────────────┘
```

---

## 2. Strict Security Boundaries & Safeguards

1. **Zero Client Leakage**:
   - `BETLOY_API_KEY` is strictly confined to server-only runtime (`process.env.BETLOY_API_KEY`).
   - Any accidental bundling into client bundles is prevented by physical file separation (server modules in `lib/betting/providers/betloy/`, never imported by `'use client'` components).
2. **Circuit Breaker Pattern**:
   - If Betloy experiences downtime, consecutive timeouts, or 5xx errors (threshold: 5 failures within 30s), the circuit breaker opens for 60 seconds.
   - Calls fail gracefully and return cached or structured offline responses without blocking the match page or crashing GoalMills.
3. **Request Deduplication & Caching**:
   - External requests for identical bet codes and source bookmakers are deduplicated in-flight and cached in Redis with a 5-minute TTL to avoid consuming unnecessary provider quota.
4. **Input Validation & Sanitization**:
   - All booking codes are strictly sanitized (regex: `^[A-Za-z0-9_-]{3,32}$`).
   - Bookmaker slugs are validated against the `CANONICAL_BOOKMAKERS` registry.
5. **No Gambling / Wagering Boundary**:
   - All tools are strictly informational.
   - Analysis results feature mandatory disclaimers: *"Analysis is informational and does not guarantee an outcome."*
   - No deposit, withdrawal, wallet, or direct wagering functionality is implemented.

---

## 3. Step-by-Step Implementation Roadmap

### Step 1: Core Domain Contracts & Provider Interface (`packages/types`)
Update `packages/types/betting.ts` to define:
- `BetToolsProvider` interface:
  ```typescript
  export interface BetToolsProvider {
    readonly providerId: string;
    decodeBet(request: BetDecodeRequest): Promise<DecodedBetSlip>;
    scanOdds(request: BetScanRequest): Promise<NormalizedBetScanResult>;
    analyzeBet(request: BetAnalysisRequest): Promise<NormalizedBetAnalysisResult>;
    convertBet(request: BetConvertRequest): Promise<NormalizedBetConvertResult>;
    trimBet(request: BetTrimRequest): Promise<NormalizedBetTrimResult>;
    getBookmakers(): Promise<ProviderBookmakerSummary[]>;
    healthCheck(): Promise<ProviderHealthStatus>;
  }
  ```
- Normalized Domain DTOs:
  - `DecodedBetSlip`, `BetSlipLeg`, `BetSlipSelection`
  - `BetScanRequest`, `NormalizedBetScanResult`, `BookmakerScanQuote`
  - `BetAnalysisRequest`, `NormalizedBetAnalysisResult`, `RiskFactor`
  - `BetConvertRequest`, `NormalizedBetConvertResult`
  - `BetTrimRequest`, `NormalizedBetTrimResult`, `TrimmedLegDifference`
  - `ProviderHealthStatus`, `ProviderUsageStats`

### Step 2: Configuration & Secret Management
Create `apps/web/src/lib/betting/providers/betloy/betloyConfig.ts`:
- Environment variables:
  - `BETLOY_API_URL` (default: `https://betloy.com/api`)
  - `BETLOY_API_KEY` (secret, server-only)
  - `BETLOY_TIMEOUT_MS` (default: `8000ms`)
  - `BETLOY_ENABLED` (boolean feature toggle)
- Throws clear diagnostic error if accessed outside Node/Server runtime.

### Step 3: Resilient Betloy Client & Adapter
Create `apps/web/src/lib/betting/providers/betloy/`:
1. `betloyClient.ts`:
   - HTTPS client using native `fetch` with AbortController timeout.
   - Exponential backoff (initial 300ms, max 2 retries) for idempotent requests (GET/health).
   - Rate limit awareness (HTTP 429 response handling with retry-after header parsing).
   - Circuit breaker state machine (`CLOSED`, `OPEN`, `HALF_OPEN`).
   - Correlation IDs (`x-request-id`) and structured error formatting.
2. `betloyAdapter.ts`:
   - Implements `BetToolsProvider`.
   - Normalizes Betloy raw response format into GoalMills canonical types.
   - Maps Betloy bookmaker slugs to GoalMills canonical IDs via registry.
3. `mockBetloyProvider.ts`:
   - Mock implementation returning realistic multi-leg accumulator slips, scan results, and AI analyses.
   - Enables full offline local development, CI testing, and automatic fallback when `BETLOY_API_KEY` is not configured.
4. `providerFactory.ts`:
   - Resolves active `BetToolsProvider` instance (returns `BetloyProvider` if configured and enabled, otherwise falls back to `MockBetToolsProvider`).

### Step 4: Bookmaker Provider Mapping Model
Create Mongoose Model `apps/web/src/models/BookmakerProviderMapping.ts`:
- Schema:
  - `bookmakerId`: String (GoalMills canonical ID, indexed)
  - `provider`: String (e.g., `'BETLOY'`)
  - `providerBookmakerId`: String (Betloy bookmaker identifier)
  - `country`: String
  - `supportedMarkets`: [String]
  - `status`: String (`'ACTIVE' | 'INACTIVE' | 'UNSUPPORTED'`)
  - `lastSyncedAt`: Date
- Seed initial mappings for 10+ canonical bookmakers (`1xbet`, `bet365`, `betfair`, `betano`, `marathon`, `betvictor`, `williamhill`, `sportybet`, etc.).

### Step 5: Betting Intelligence Service Layer (`apps/web/src/lib/betting/`)
Create server-side service modules:
1. `betScannerService.ts`:
   - Orchestrates bet scanning.
   - Queries `BetToolsProvider.scanOdds()`.
   - Computes objective `bestOdds` and `payout` for each scanned bookmaker.
   - Attaches GoalMills secure affiliate redirect URLs (`buildSecureAffiliateRedirectUrl`).
2. `betViewerService.ts`:
   - Orchestrates code decoding via `BetToolsProvider.decodeBet()`.
   - Normalizes selections, matches, and odds.
3. `betAnalyzerService.ts`:
   - Orchestrates AI analysis via `BetToolsProvider.analyzeBet()`.
   - Formats risk score, win probability estimate, value indicators.
   - Enforces legal disclaimer insertion.
4. `betTrimmerService.ts`:
   - Orchestrates risk trimming via `BetToolsProvider.trimBet()`.
   - Calculates leg differences (removed high-risk legs, adjusted markets).
5. `betConverterService.ts`:
   - Converts booking code from Source Bookmaker -> Target Bookmaker.

### Step 6: GoalMills REST API Endpoints (`apps/web/src/app/api/v1/betting/`)
Create secure, validated API routes:
- `POST /api/v1/betting/scan`:
  - Body: `{ code: string, sourceBookmaker: string, stake?: number }`
  - Validates input, checks rate-limit, calls `betScannerService`.
- `POST /api/v1/betting/decode`:
  - Body: `{ code: string, sourceBookmaker: string }`
  - Calls `betViewerService`.
- `POST /api/v1/betting/analyze`:
  - Body: `{ code: string, sourceBookmaker: string, stake?: number }`
  - Calls `betAnalyzerService`.
- `POST /api/v1/betting/convert`:
  - Body: `{ code: string, sourceBookmaker: string, targetBookmaker: string }`
  - Calls `betConverterService`.
- `POST /api/v1/betting/trim`:
  - Body: `{ code: string, sourceBookmaker: string, riskTolerance?: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE' }`
  - Calls `betTrimmerService`.
- `GET /api/v1/betting/providers/health`:
  - Returns provider health status, latency, and circuit breaker status (for admin/monitoring).

### Step 7: UI Components & Match Details Integration
Create modern, responsive client components matching GoalMills design system:
1. `BetScannerWidget.tsx` / `BetScannerModal.tsx`:
   - Input for Bet Code + Source Bookmaker dropdown.
   - Multi-bookmaker odds comparison grid.
   - Clear distinction: 🏆 **Best Odds** vs **Sponsored** vs **Standard**.
   - Direct `[BET NOW]` CTA with affiliate tracking.
2. `BetViewerCard.tsx`:
   - Visual accumulator ticket with match names, selected market, odds per leg, and total combined odds.
3. `BetAnalyzerCard.tsx`:
   - Visual risk gauge (Low / Medium / High).
   - Informational win probability and key insights breakdown.
   - Prominent disclaimer banner: *"Analysis is informational and does not guarantee an outcome."*
4. `RiskTrimmerCard.tsx`:
   - Side-by-side comparison: Original Slip vs Trimmed Slip.
   - Leg delta badges (e.g. `Leg Removed: Over 3.5 Goals -> Safe 1X`).
5. Feature Flag Integration:
   - Ensure all UI widgets check `bettingFeatureFlags.ts` before rendering.

---

## 4. Feature Flag Matrix

All Phase 3 capabilities will be controlled via `bettingFeatureFlags.ts`:

| Feature Flag | Default | Description |
| :--- | :--- | :--- |
| `betloyIntegration` | `true` | Master toggle for external bet tools provider calls |
| `betScanner` | `true` | Enables bet code odds scanning across bookmakers |
| `betAnalyzer` | `true` | Enables AI bet analysis & risk scoring |
| `betEditor` | `true` | Enables bet code conversion across bookmakers |
| `betTrimmer` | `true` | Enables risk trimming recommendation UI |

---

## 5. Verification & Testing Strategy

1. **Unit Testing (`vitest run src/lib/betting`)**:
   - `betloyClient.test.ts`: Test timeouts, retry logic, 429 backoff, circuit breaker transition from CLOSED -> OPEN -> HALF_OPEN.
   - `betloyAdapter.test.ts`: Verify raw Betloy JSON normalization into GoalMills canonical types.
   - `betScannerService.test.ts`: Verify best odds calculation and affiliate URL injection.
   - `bookmakerMapping.test.ts`: Verify mapping between GoalMills canonical slugs and Betloy IDs.
2. **API Route Testing**:
   - Test `/api/v1/betting/scan`, `/decode`, `/analyze`, `/convert`, `/trim` with valid, invalid, and rate-limited inputs.
   - Verify graceful degradation when provider is down (circuit breaker open).
3. **Full Production Webpack Build (`pnpm run build:web`)**:
   - Guarantee zero client bundle contamination (no server or Node built-in imports in client components).
4. **End-to-End Simulation**:
   - Decode mock bet code -> Run AI analysis -> Scan odds across bookmakers -> Click `BET NOW` -> Verify redirect tracking.

---

## 6. Phase 3 Definition of Done Checklist

- [ ] `BetToolsProvider` interface defined in `@goalmills/types`.
- [ ] Server-only `BetloyClient` and `BetloyAdapter` implemented with circuit breaker, timeout, and retry logic.
- [ ] `MockBetToolsProvider` available for offline development and testing.
- [ ] `BookmakerProviderMapping` database model created and seeded.
- [ ] Betting intelligence services created (`betScannerService`, `betViewerService`, `betAnalyzerService`, `betTrimmerService`, `betConverterService`).
- [ ] REST API endpoints `/api/v1/betting/*` implemented with input validation and rate limiting.
- [ ] UI components created with responsive mobile/desktop layout and design system alignment.
- [ ] Mandatory informational/non-guarantee legal disclaimers displayed on AI analyzer and risk trimmer.
- [ ] Zero client leakage of `BETLOY_API_KEY`.
- [ ] Feature flags configure every individual capability.
- [ ] Unit & integration tests pass with 100% success.
- [ ] Production build (`pnpm run build:web`) completes with zero errors.
