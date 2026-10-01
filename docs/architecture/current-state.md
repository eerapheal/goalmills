# GoalMills Platform — Current State Architecture Discovery (Phase 0)

**Document Version:** 1.0.0  
**Phase:** Phase 0 — Discovery & Architectural Audit  
**Author:** Chief Technology Officer & Principal Software Architect, GoalMills  
**Date:** October 2026  
**Status:** APPROVED ARCHITECTURAL BASELINE  

---

## 1. Executive Summary & Monorepo Overview

GoalMills is a high-performance multi-sport intelligence, media, and audience platform serving fans, editorial teams, and commercial partners across Football, Cricket, and Basketball.

The codebase is organized as a unified monorepo managed with **Turborepo** (`turbo.json`) and **pnpm workspaces** (`pnpm-workspace.yaml`). The repository currently contains:

- **3 Applications** in `apps/`: `web`, `admin`, `mobiles`
- **2 Independent Microservices** in `services/`: `mailer` (Golang 1.22), `social-engine` (Node.js/Express)
- **3 Shared Packages** in `packages/`: `types`, `ui`, `config`
- **Extensive Test Suites**: 80+ test files using Vitest in web/admin and unit test mocks

```text
GoalMills Monorepo
│
├── apps/
│   ├── web/                     # Public Consumer Web Portal (Next.js 16, Port 3000)
│   ├── admin/                   # Staff, CMS & EMS Admin Hub (Next.js 16, Port 3001)
│   └── mobiles/                 # Cross-platform Mobile App (Expo 52, React Native)
│
├── services/
│   ├── mailer/                  # High-throughput Golang 1.22 Newsletter Microservice (Port 8085)
│   └── social-engine/           # Automated Social Distribution Microservice (Port 4000)
│
├── packages/
│   ├── types/                   # Unified Domain Entities, Enums & DTOs
│   ├── ui/                      # Shared Design System Tokens, Palettes & Breakpoints
│   └── config/                  # Shared ESLint, Prettier & TypeScript Configs
│
└── docs/                        # Specifications, Audits & Architecture Documentation
```

---

## 2. Inventory of Applications

### 2.1 Web Application (`apps/web`)
- **Technology Stack:** Next.js 16.0.0 (Webpack mode), React 19.2.3, Tailwind CSS v4, TypeScript 5.9.
- **Port:** `3000` (Default HTTP).
- **Primary Audience:** Public sports consumers, sports bettors, search engine crawlers.
- **Core Capabilities:**
  - **Live Scores & Match Centers:** Football, Cricket, Basketball live tickers, line-ups, match events, timeline, head-to-head records.
  - **Intelligence & Betting Engine:** Canonical event mapping, odds comparison across bookmakers (Betloy integration), affiliate link generation and click tracking, betting insights.
  - **Editorial CMS:** Breaking sports news, categorization, tags, reading time, author profiles, related articles.
  - **Video Highlights:** Video catalog with YouTube/Cloudinary streaming, category filters, responsive player.
  - **Deliverability & EMS Portal:** Newsletter subscriber onboarding, double opt-in token verification, frequency preferences (Daily, Weekly, Monthly), one-click unsubscribe.
  - **Data Warehouse Ingestion:** Historical fixtures, team records, league standings.
  - **Realtime Streaming:** Server-Sent Events (SSE) `/api/realtime/stream` and Socket.io gateway client.

### 2.2 Admin Application (`apps/admin`)
- **Technology Stack:** Next.js 16.0.0, React 19.2.3, NextAuth v4.24.13, Redux Toolkit, Tailwind CSS v4, TypeScript 5.9.
- **Port:** `3001`.
- **Primary Audience:** Editorial staff, media managers, operations, administrators.
- **Core Capabilities:**
  - **Authentication & RBAC:** NextAuth credentials provider with JSON Web Tokens (JWT). Roles include `SuperAdmin`, `Admin`, `Editor`, `Contributor`.
  - **Editorial Desk (CMS):** Article authoring with rich text editor (`react-quill-new`), draft/publish workflows, Cloudinary image upload, tag management.
  - **Campaign Manager (EMS):** Campaign authoring, recipient list segmentation, high-priority broadcasting, automated dispatch to Go Mailer.
  - **Internal Operations:** Employee directory, daily standups, quarterly performance evaluations, payroll ledger, training progress tracker.
  - **Commercial Management:** Sponsorship campaign creation, banner placement rules, impression/click analytics, tenant management.
  - **Social Engine Proxy:** Proxy controls to trigger social graphics and automated cross-posting.

### 2.3 Mobile Application (`apps/mobiles`)
- **Technology Stack:** Expo SDK 52 (~57.0), React Native 0.86.3, Expo Router v57, TypeScript.
- **Platforms:** iOS and Android.
- **Core Capabilities:**
  - Native match centers with bottom navigation tabs.
  - Push notification token registration (Expo Push & Firebase Cloud Messaging).
  - Offline caching and optimistic UI states.
  - Deep linking into match and news screens.

---

## 3. Inventory of Independent Services

### 3.1 Newsletter Mailer Service (`services/mailer`)
- **Runtime:** Golang 1.22.
- **Containerization:** Docker (`Dockerfile`, `docker-compose.yml`), deployed on Render.
- **Port:** `8085`.
- **Architecture Highlights:**
  - **Priority-Aware Queue:** 25 concurrent domain-based workers, buffer sizes up to 10,000 tasks.
  - **Multi-Domain Traffic Shaping:** Granular outbound rate limits per email provider (Gmail: 15/s, Yahoo: 8/s, Outlook: 10/s, Default: 5/s) to ensure top-tier inbox placement.
  - **Bounce & Deliverability Pipeline:** Hard vs. soft bounce classification, automated suppression forwarding to webhook.
  - **Robfig Cron:** Autonomous cron schedules firing at 10:00 AM WAT (Daily: `0 10 * * *`, Weekly: `0 10 * * 1`, Monthly: `0 10 1 * *`).
  - **REST API Surface:**
    - `GET /health` — Service readiness, sandboxing flag, SMTP status.
    - `POST /api/dispatch` — Batch campaign dispatch with editorial curation templates.
    - `POST /api/send-confirmation` — Transactional double opt-in email dispatch.
  - **Outbound Webhooks:** Dispatches `delivered`, `soft_bounce`, and `hard_bounce` events back to GoalMills web/admin endpoints.

### 3.2 Social Engine Service (`services/social-engine`)
- **Runtime:** Node.js, Express 5.1.0, TypeScript 5.8.0.
- **Containerization:** Docker, deployed on Render.
- **Port:** `4000`.
- **Architecture Highlights:**
  - **Dynamic Graphic Generation:** Uses `sharp` to composite branded SVG scorecards, half-time recaps, full-time results, and weekly fixture announcements.
  - **AI Copywriting:** Google Gemini API integration for generating contextual, platform-specific social captions.
  - **Platform Adapters:** Twitter/X (API v2), Telegram, WhatsApp, Facebook, LinkedIn, YouTube, TikTok.
  - **Background Orchestration:** Node-cron scheduler for polling match statuses and triggering publishing workflows.
  - **REST API Surface:**
    - `GET /health` — Service health.
    - `GET /api/status` — Platform adapter status, scheduled tasks, daily post counts.
    - `GET /api/platforms` — Detailed platform configuration and health checks.
    - `POST /api/test-platform/:platform` — Diagnostic platform connectivity ping.

---

## 4. API Surface Catalog

### 4.1 `apps/web` API Endpoints (`/api/*`)
| Route Namespace | Functionality | Primary Backing Model / Provider |
| :--- | :--- | :--- |
| `/api/affiliate` | Affiliate tracking, link generation, click recording | `AffiliateClick`, `AffiliateLink`, `AffiliateProgram` |
| `/api/analytics` | Event ingestion, impression and click metrics | `AnalyticsEvent`, `ContentMetricSummary` |
| `/api/basketball` | Basketball live scores, standings, games proxy | AllSportsAPI, Redis cache |
| `/api/billing` | Subscription plans, billing checkout, payment webhooks | `Subscription`, Stripe/Paystack |
| `/api/categories` | Sports and news category listings | `Category` |
| `/api/coaches` | Coach profiles, achievements, tactical metadata | `EcosystemEntity` |
| `/api/cricket` | Live cricket matches, scorecards, series, player stats | Cricbuzz RapidAPI, Redis cache |
| `/api/cron/*` | Scheduled sync jobs (newsletter, match ingest, cleanups) | Vercel Cron, Internal Services |
| `/api/events` | Event tracking and dead-letter pipeline | `DeadLetterEvent` |
| `/api/feeds` | RSS / XML syndication feeds for news and match results | `News`, `HistoricalMatch` |
| `/api/football/*` | Live matches, fixtures, standings, top scorers, H2H | AllSportsAPI, API-Football, Redis cache |
| `/api/news/*` | Editorial articles, search, slugs, categories, related items | `News` |
| `/api/newsletter/*` | Subscribe, double opt-in confirm, preferences, unsubscribe | `NewsletterSubscriber`, `NewsletterList` |
| `/api/notifications` | Push notification token registration | `PushToken` |
| `/api/officials` | Match referee records, strictness ratings, disciplinary stats | `EcosystemEntity` |
| `/api/realtime/*` | Server-Sent Events stream for real-time scores | Redis PubSub, Socket.io |
| `/api/recommendations` | Contextual content and related match recommendations | `RecommendationConfig`, `News` |
| `/api/search` | Global search across news, matches, teams, and players | MongoDB text index |
| `/api/sponsorships` | Sponsor ad banner delivery and impression tracking | `Sponsorship`, `CampaignPlacement` |
| `/api/sports` | Multi-sport aggregation endpoint | Redis cache, multiple providers |
| `/api/tenants` | Multi-tenant domain and brand configuration | `Tenant` |
| `/api/v1/*` | Canonical REST API versioned endpoints | Core services |
| `/api/videos` | Video highlight directory and streaming metadata | `Video` |
| `/api/warehouse` | Historical match and standings storage and querying | `HistoricalMatch`, `HistoricalStandings` |
| `/api/webhooks/*` | Inbound webhooks from Mailer, Betloy, Payment gateways | `EmailEvent`, `EmailSuppression` |

### 4.2 `apps/admin` API Endpoints (`/api/*`)
| Route Namespace | Functionality | Primary Backing Model / Provider |
| :--- | :--- | :--- |
| `/api/auth/*` | NextAuth v4 credentials authentication, session checks | `User`, bcryptjs |
| `/api/admin/*` | User management, RBAC role updates, audit logs | `User`, `Tenant` |
| `/api/ecosystem` | Coaches, referees, stadiums, team meta administration | `EcosystemEntity` |
| `/api/evaluations` | Employee quarterly performance reviews | `PerformanceEvaluation`, `Employee` |
| `/api/newsletter/*` | Campaign authoring, scheduling, manual dispatch | `NewsletterCampaign`, `NewsletterTemplate` |
| `/api/payroll` | Staff payroll ledger, compensations, bonus records | `Payroll`, `Employee` |
| `/api/reports` | Daily executive reports, editorial performance stats | `DailyReport` |
| `/api/social/*` | Social engine configuration, triggers, manual posts | Proxy to `services/social-engine` |
| `/api/standups` | Daily engineering and editorial standup logs | `Standup` |
| `/api/training` | Staff onboarding and training progress | `TrainingProgress` |
| `/api/upload` | Media asset direct upload | Cloudinary API |

---

## 5. Database & Data Model Inventory

The platform persists data in **MongoDB Atlas** using **Mongoose ODM**.

### 5.1 Model Distribution & Duplication Analysis
- `apps/web/src/models`: Contains **43 models**.
- `apps/admin/src/models`: Contains **38 models**.
- **Duplication Findings:** 29 models are duplicated with identical or near-identical schemas between `web` and `admin` (e.g. `News.ts`, `Sponsorship.ts`, `NewsletterCampaign.ts`, `Tenant.ts`, `HistoricalMatch.ts`).
- **Domain Specializations:**
  - `web`-only: Betting & commercial models (`AffiliateClick`, `AffiliateCommissionRule`, `AffiliateConversion`, `AffiliateLink`, `AffiliateProgram`, `BetSlip`, `BettingAnalyticsEvent`, `BettingCampaign`, `Bookmaker`, `BookmakerProviderMapping`, `CampaignPlacement`, `EventProviderMapping`, `OddsAlert`, `OddsQuote`).
  - `admin`-only: Operational models (`Employee`, `Payroll`, `PerformanceEvaluation`, `SocialPlatformConfig`, `SocialPost`, `Standup`, `TrainingProgress`, `User`, `DailyReport`).

### 5.2 Model Categorization by Domain
1. **Content & Editorial:** `News`, `Video`, `Category`, `RecommendationConfig`.
2. **Sports & Historical Warehouse:** `HistoricalMatch`, `HistoricalStandings`, `HistoricalTeam`, `EcosystemEntity`.
3. **Betting & Commercial:** `AffiliateLink`, `AffiliateClick`, `AffiliateConversion`, `AffiliateProgram`, `AffiliateCommissionRule`, `BetSlip`, `BettingAnalyticsEvent`, `BettingCampaign`, `Bookmaker`, `BookmakerProviderMapping`, `EventProviderMapping`, `OddsAlert`, `OddsQuote`, `Sponsorship`, `CampaignPlacement`, `AdvertiserReport`.
4. **Audience & EMS:** `NewsletterSubscriber`, `NewsletterCampaign`, `NewsletterList`, `NewsletterSegment`, `NewsletterSendJob`, `NewsletterTemplate`, `EmailEvent`, `EmailSuppression`, `CampaignRecipient`.
5. **System & Analytics:** `AnalyticsEvent`, `ContentMetricSummary`, `DeadLetterEvent`, `DistributionRule`, `Notification`, `PushToken`, `Subscription`, `SyndicationJob`, `Tenant`.
6. **Administration & HR (Admin only):** `User`, `Employee`, `Payroll`, `PerformanceEvaluation`, `Standup`, `TrainingProgress`, `DailyReport`, `SocialPlatformConfig`, `SocialPost`.

---

## 6. Redis & Caching Strategy

The platform relies on **Redis Cloud** via `ioredis` with an automated **in-memory fallback cache** if Redis is unavailable:

### 6.1 Cache Keys and Time-to-Live (TTL)
| Cache Key Pattern | TTL (Seconds) | Purpose |
| :--- | :--- | :--- |
| `cache:matches:live:{sport}` | 15s | Real-time score updates and live game tickers |
| `cache:matches:fixtures:{sport}:{date}` | 60s | Matchday schedules and calendar views |
| `cache:standings:{sport}:{leagueId}` | 300s (5m) | League tables, points, goal differences |
| `cache:news:list:{filter}:{cat}:{page}` | 180s (3m) | Categorized news feeds and pagination |
| `cache:news:item:{id}` | 300s (5m) | Full article payloads and SEO metadata |
| `cache:videos:list:{category}:{limit}` | 180s (3m) | Video lists and carousel highlights |
| `cache:metadata:{type}:{id}` | 600s (10m) | Entity bios (referees, coaches, stadiums) |
| `cache:odds:{matchId}:{market}` | 30s | Live odds comparisons across bookmakers |

### 6.2 Resilience & Failover
- If `REDIS_URL` is omitted or Redis disconnects, the cache client seamlessly falls back to an in-process LRU map.
- Cache invalidation occurs via pattern matching: `cacheInvalidatePattern('cache:news:*')` is triggered immediately upon article publication in Admin CMS.

---

## 7. External Integrations & Service Providers

| Integration | Domain / Role | Integration Mechanism | Resilience / Fallback |
| :--- | :--- | :--- | :--- |
| **AllSportsAPI** | Football & Basketball fixtures, livescores | REST API with API key | 250ms fetch spacer, Redis caching |
| **API-Football** | Canonical football fixtures, lineups, standings | REST API with RapidAPI key | Redis caching, canonical slug normalization |
| **Cricbuzz RapidAPI** | Cricket matches, commentary, series | REST API with RapidAPI key | 60s fixture caching, graceful empty state |
| **Betloy API** | Betting odds, markets, bookmaker catalogs | REST API / Webhooks | Fallback odds cache, provider mapping table |
| **Cloudinary** | Media asset upload, transformation, CDN | REST API via Node SDK | Direct image URLs, CDN caching |
| **Google Gemini API** | AI social copy generation | REST API via SDK | Fallback template copy |
| **Twitter/X API v2** | Social post distribution | REST API via `twitter-api-v2` | Retry logic, dead-letter recording |
| **SMTP Relay** | Outbound transactional & newsletter emails | SMTP over TLS (Port 587) | Go Mailer worker queue, backoff retry |
| **Expo / FCM** | Mobile push notifications | Push REST API | Batch token chunking |

---

## 8. Scheduled Jobs & Background Workers

1. **Vercel Cron (`vercel.json`):**
   - `0 9 * * *`: Daily newsletter trigger (`/api/cron/newsletter?frequency=daily`).
   - `0 9 * * 1`: Weekly newsletter trigger (`/api/cron/newsletter?frequency=weekly`).
   - `0 9 1 * *`: Monthly newsletter trigger (`/api/cron/newsletter?frequency=monthly`).
2. **Go Mailer Cron (`services/mailer/cmd/server/main.go`):**
   - `0 10 * * *`: Daily 10:00 AM WAT trigger (`triggerCronWebhook("daily")`).
   - `0 10 * * 1`: Weekly Monday 10:00 AM WAT trigger.
   - `0 10 1 * *`: Monthly 1st 10:00 AM WAT trigger.
3. **Social Engine Schedulers (`services/social-engine`):**
   - Live match poller (every 2 minutes during active match windows).
   - Pre-match and post-match graphic generation tasks.
4. **Queue Workers:**
   - In-memory Priority Queue in Go Mailer with 25 domain-isolated worker threads.

---

## 9. Deployment Architecture

```text
                                [ Internet / Cloudflare DNS ]
                                               │
                        ┌──────────────────────┴──────────────────────┐
                        ▼                                             ▼
          [ Vercel Edge Network ]                           [ Render Cloud ]
          • apps/web (Next.js 16 Webpack)                   • services/mailer (Docker, Go 1.22)
          • apps/admin (Next.js 16)                         • services/social-engine (Docker)
                        │                                             │
                        ├──────────────────────┬──────────────────────┤
                        ▼                      ▼                      ▼
               [ MongoDB Atlas ]       [ Redis Cloud ]        [ Cloudinary CDN ]
               Primary Database        Cache & PubSub         Images & Media
```

---

## 10. Key Architecture Findings & Restructuring Targets

1. **Monolithic Model Duplication:** 29 Mongoose models are copy-pasted between `apps/web` and `apps/admin`. They belong in a unified core data layer (`core/` or `packages/contracts`).
2. **Mixed Domain Logic in API Routes:** In `apps/web/src/app/api`, some route handlers contain direct database calls and business calculations instead of calling domain services.
3. **Sports Provider Tight Coupling:** Sports ingestion logic is split across `apps/web/src/lib/football`, `apps/web/src/lib/cricket`, and `apps/web/src/lib/basketball`. These should be unified under a cohesive `core/sports` domain with strict provider adapter boundaries.
4. **Services Well Isolated:** `services/mailer` and `services/social-engine` are already clean, isolated services with their own runtimes and Docker deployments. They will remain independent services.
