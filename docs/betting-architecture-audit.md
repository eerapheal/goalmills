# GoalMills Betting Architecture & Existing System Audit
**Status:** Complete  
**Date:** September 30, 2026  
**Auditor:** CTO & Principal Software Architect  
**Objective:** Comprehensive inspection of the existing GoalMills sports, odds, and affiliate infrastructure before implementing Phase 1 of the Betting Intelligence Platform.

---

## 1. Executive Summary

GoalMills is a high-performance sports intelligence platform covering Football, Cricket, Basketball (NBA), and global competitions. The platform currently includes a functioning **Market Betting Odds** component on match detail pages, which fetches pre-match and in-play odds from upstream sports data feeds and displays 1X2 and Over/Under 2.5 markets across bookmakers.

The platform requires a production-grade transformation into:
**GOALMILLS BETTING INTELLIGENCE + ODDS COMPARISON + AFFILIATE PLATFORM**

This transformation will:
1. **Preserve 100% of existing sports and odds data flows** without replacing current odds feeds or breaking current UI components.
2. Introduce a **Canonical Identity Layer** (`gm_event_*`) mapping external provider IDs.
3. Establish a **Canonical Bookmaker Registry** (`1xbet`, `bet365`, `betfair`, `betano`, etc.) as a single source of truth.
4. Establish an **Affiliate Engine** with configuration-driven links, database-backed tracking, open redirect protection, and non-PII click analytics.
5. Create a **Provider Abstraction (`BetToolsProvider`)** isolating Betloy capabilities (Odds Scanner, AI Bet Analyzer, Bet Code Decoder/Converter, Risk Trimmer) so Betloy remains an interchangeable backend infrastructure provider without client-side key leakage.
6. Isolate future wagering concepts behind clean architectural boundaries without activating real-money gambling.

---

## 2. Existing System Inventory & Dependency Map

### 2.1 Current Odds API Integration
- **Upstream Data Provider:** AllsportsAPI / API-Football proxy.
- **Service Layer (Web):** [`apps/web/src/services/advancedFootballApi.ts`](file:///d:/New%20folder/goalmills/apps/web/src/services/advancedFootballApi.ts)
  - Method: `advancedFootballApi.getOdds({ matchId: key })`
  - Endpoint: `fetchFromAPI<FootballOddsResponse>('Odds', { matchId: key })`
  - Live Odds: `advancedFootballApi.getLiveOdds({ matchId: key })`
  - Probabilities: `advancedFootballApi.getProbabilities({ matchId: key })`
- **Secondary Service Layer:** [`apps/web/src/services/apiFootball.ts`](file:///d:/New%20folder/goalmills/apps/web/src/services/apiFootball.ts) (Pre-match, live odds, bookmaker mapping endpoints).
- **Mobile Service Layer:** [`apps/mobiles/src/services/advancedFootballApi.ts`](file:///d:/New%20folder/goalmills/apps/mobiles/src/services/advancedFootballApi.ts) and [`apps/mobiles/src/components/MatchOddsModal.tsx`](file:///d:/New%20folder/goalmills/apps/mobiles/src/components/MatchOddsModal.tsx).

### 2.2 Existing Odds Data Structures
- **Interface:** `FootballOdds` in [`packages/types/index.ts`](file:///d:/New%20folder/goalmills/packages/types/index.ts#L989-L1057)
  ```typescript
  export interface FootballOdds {
    match_id: string;
    odd_bookmakers: string;      // e.g. "1xBet", "bet365", "Marathon", "Betfair", "BetVictor", "Pncl", "Sbo", "WilliamHill", "Betano"
    odd_1: string | null;         // Home Win
    odd_x: string | null;         // Draw
    odd_2: string | null;         // Away Win
    odd_1x: string | null;        // Home or Draw (Double Chance)
    odd_12: string | null;        // Home or Away
    odd_x2: string | null;        // Draw or Away
    'ah-4.5_1' ... 'ah+4.5_2': string | null; // Asian Handicaps
    'o+0.5' ... 'o+5.5': string | null;       // Over Totals
    'u+0.5' ... 'u+5.5': string | null;       // Under Totals
    bts_yes: string | null;       // Both Teams to Score Yes
    bts_no: string | null;        // Both Teams to Score No
  }
  ```
- **Response Wrapper:**
  ```typescript
  export interface FootballOddsResponse {
    success: 1;
    result: {
      [matchId: string]: FootballOdds[];
    };
  }
  ```

### 2.3 Match Details Page & Odds UI
- **Location:** [`apps/web/src/app/football/matches/[...slug]/page.tsx`](file:///d:/New%20folder/goalmills/apps/web/src/app/football/matches/[...slug]/page.tsx)
- **Current Component:** `OddsTab` (Lines 933–997)
  - Displays a tabular grid: `Bookmaker | 1 (Home) | X (Draw) | 2 (Away) | Over 2.5 | Under 2.5`
  - Directly loops over `odds: FootballOdds[]`.
  - Bookmaker display relies strictly on the raw string: `o.odd_bookmakers`.
  - Currently **no affiliate link**, no **Bet Now** button, no **Best Odds** indicator, and no **Odds Movement** indicators.

### 2.4 Database & Schema Architecture
- **Engine:** MongoDB with Mongoose ODM via [`apps/web/src/lib/db.ts`](file:///d:/New%20folder/goalmills/apps/web/src/lib/db.ts).
- **Existing Models:** 29 production models in [`apps/web/src/models`](file:///d:/New%20folder/goalmills/apps/web/src/models), including:
  - `Sponsorship.ts`: Contains campaign pacing, impression/click tracking, device/sport targeting.
  - `AnalyticsEvent.ts`: Stores telemetry, user sessions, page views, client events.
  - `EcosystemEntity.ts`, `News.ts`, `Tenant.ts`.
- **Database Extension Point:** Betting and affiliate models (`Bookmaker`, `EventProviderMapping`, `OddsQuote`, `AffiliateProgram`, `AffiliateLink`, `AffiliateClick`, `BetSlip`, `OddsAlert`) can seamlessly integrate into MongoDB with optimal indexes.

### 2.5 Caching & Performance Architecture
- **Location:** [`apps/web/src/lib/redisCache.ts`](file:///d:/New%20folder/goalmills/apps/web/src/lib/redisCache.ts)
- **Features:**
  - Multi-tier cache: Upstash Redis (REST & TLS) with automated in-memory bounded LRU fallback (up to 5,000 entries).
  - Single-flight request coalescing (`singleFlightSaves`): Prevents cache stampedes on hot sports events.
  - Telemetry counters: hits, misses, sets, latency samples.
- **Cache Strategy for Betting:**
  - Static Bookmaker Directory & Affiliate Configs: TTL 1 hour (`3600s`).
  - Active Event Odds Snapshot: TTL 30–60 seconds.
  - Live In-Play Odds: TTL 5–15 seconds.
  - Rate limiting & Duplicate click suppression: 10–60 seconds sliding window.

### 2.6 Security, Redirects & Telemetry
- **Existing Redirect & Telemetry Patterns:** Seen in [`apps/web/src/app/api/sponsorships/[id]/track/route.ts`](file:///d:/New%20folder/goalmills/apps/web/src/app/api/sponsorships/[id]/track/route.ts).
  - IP-based rate-limiting window (20 req / 60s).
  - Duplicate suppression window (10s dedup).
  - Strict ID validation (`isValidObjectId`).
- **Affiliate Security Mandates:**
  - Never allow open redirects (`targetUrl` must come from verified database records).
  - Never trust client-supplied destination URLs.
  - Reject unwhitelisted or inactive bookmakers.
  - Anonymize IP addresses and minimize PII.

---

## 3. Identified Identification & Normalization Gaps

| Domain Concept | Current State | GoalMills Target State |
| :--- | :--- | :--- |
| **Event Identity** | Raw upstream integer/string (`event_key`, e.g. `"123456"`) | Canonical `gm_event_123456` with provider cross-reference mapping table |
| **Bookmaker Identity** | Inconsistent raw strings (`"1xBet"`, `"bet365"`, `"Pncl"`, `"Sbo"`) | Canonical Bookmaker Entity (`id: "1xbet"`, `displayName: "1xBet"`, `logoUrl`, `countries`) |
| **Market Identity** | Hardcoded flat object keys (`"odd_1"`, `"o+2.5"`, `"bts_yes"`) | Normalized Market & Selection structure (`1X2`, `OVER_UNDER`, `BTTS`, `HANDICAP`) |
| **Affiliate Links** | None | Secure server-generated redirect endpoints (`/api/affiliate/redirect/:bookmaker`) |
| **Commercial Disclosure** | None | Strict separation of "Best Odds" (mathematical) vs "Sponsored" vs "Affiliate" |
| **Betloy Isolation** | Unintegrated | Server-side `BetToolsProvider` adapter with 0 client exposure of API keys |

---

## 4. Integration Risks & Mitigation Strategies

1. **Risk:** Slow or failing external betting tools (e.g. Betloy API timeout) degrade match detail pages.  
   **Mitigation:** Progressive enhancement. Odds and match info render independently from betting tools. Betloy requests are executed asynchronously with strict timeouts (3000ms), circuit breakers, and background fallback.
2. **Risk:** Client-side API key leakage.  
   **Mitigation:** All Betloy and affiliate network credentials reside strictly in server-side environment variables (`BETLOY_API_KEY`), never exposed to frontend React components or Next.js public bundles.
3. **Risk:** Open redirect vulnerability via affiliate links.  
   **Mitigation:** The redirect endpoint (`/api/affiliate/redirect/[bookmakerSlug]`) ignores client-supplied destination URLs and exclusively reconstructs approved URLs from the verified database `AffiliateLink` and `Bookmaker` registry.
4. **Risk:** Biased "Best Odds" calculations favoring affiliate partners.  
   **Mitigation:** The Best Odds calculation engine is a pure mathematical comparator. Sponsored placements are explicitly badged as "SPONSORED / AD" and cannot override the true mathematical top quote.

---

## 5. Extension Points for Phase 1

1. **Types Package (`@goalmills/types`):**  
   Add canonical betting domain types: `Bookmaker`, `EventProviderMapping`, `OddsQuote`, `MarketType`, `SelectionType`, `AffiliateProgram`, `AffiliateLink`, `AffiliateClick`, `BetloyScanResult`, `BetloyAnalysisResult`.
2. **Domain Library (`apps/web/src/lib/betting`):**  
   - `bookmakerRegistry.ts`: Static seeded registry of top tier global & regional bookmakers.
   - `canonicalEventResolver.ts`: Converts between provider IDs and `gm_event_*`.
   - `oddsNormalizer.ts`: Maps raw `FootballOdds` into canonical `OddsQuote[]`.
   - `affiliateEngine.ts`: URL builder, placeholder replacement (`{click_id}`, `{subid}`), and validation.
   - `featureFlags.ts`: Feature flag controller for betting modules.
3. **Database Models (`apps/web/src/models/`):**  
   - `Bookmaker.ts`
   - `EventProviderMapping.ts`
   - `OddsQuote.ts`
   - `AffiliateProgram.ts`
   - `AffiliateLink.ts`
   - `AffiliateClick.ts`
4. **API Route Handlers:**  
   - `GET /api/v1/bookmakers`: List registered bookmakers.
   - `GET /api/affiliate/redirect/[bookmaker]`: Secure click tracking and redirect endpoint.
5. **Existing UI Preservation:**  
   The existing `OddsTab` in [`apps/web/src/app/football/matches/[...slug]/page.tsx`](file:///d:/New%20folder/goalmills/apps/web/src/app/football/matches/[...slug]/page.tsx) remains operational, enhanced with bookmaker logos and safe affiliate routing when enabled.
