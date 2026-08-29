# GoalMills Sports Intelligence Platform — Architecture Blueprint

## 1. System Overview

GoalMills is a high-performance, enterprise-grade multi-sport intelligence platform. It provides real-time live scores, tactical debriefs, predictive data models, video highlights, editorial journalism, audience intelligence newsletters, and push notifications across Football, Cricket, and Basketball.

```
                                  [ User Clients ]
                      ┌───────────────────┴───────────────────┐
                      ▼                                       ▼
            [ Web App (Next.js 16) ]               [ Mobile App (Expo / RN) ]
            • Port 3000                            • iOS & Android
            • Public Reader Portal                 • Native Sports UI
            • Fast Edge Caching                    • Offline Fallbacks
                      │                                       │
                      └───────────────────┬───────────────────┘
                                          ▼
                               [ Reverse Proxy & API ]
                      ┌───────────────────┴───────────────────┐
                      ▼                                       ▼
          [ Internal REST / Proxy ]               [ Realtime Stream Engine ]
          • /api/football                         • /api/realtime/stream (SSE)
          • /api/cricket                          • Socket.io Gateway Broadcaster
          • /api/basketball
          • /api/news & /api/videos
                      │                                       │
                      ├───────────────────┬───────────────────┤
                      ▼                   ▼                   ▼
             [ Primary Database ]   [ Distributed Cache ] [ Push Engine ]
             • MongoDB Atlas        • Redis Cloud (TLS)   • FCM / Web Push
             • Mongoose Pool        • Memory Fallback     • Expo Push API
                      │                   │
                      └─────────┬─────────┘
                                ▼
                   [ Admin Hub (Next.js 16) ]
                   • Port 3001
                   • NextAuth RBAC (JWT)
                   • Editorial CMS & Video Uploads
                   • Newsletter Campaigns & EMS
                                │
                                ▼
                 [ Go Enterprise Mailer Service ]
                 • Port 8085 (Golang 1.22)
                 • Priority Queue Traffic Shaping
                 • Multi-Domain Rate Limiting
                 • Bounce & Suppression Pipeline
```

---

## 2. Workspace & Monorepo Structure

The repository is organized as a Turborepo monorepo with `pnpm` workspaces:

```text
goalmills/
├── apps/
│   ├── web/                     # Public Consumer Web Portal (Next.js 16, Port 3000)
│   ├── admin/                   # Staff, CMS & EMS Admin Hub (Next.js 16, Port 3001)
│   └── mobiles/                 # Cross-platform Mobile App (Expo 52, React Native)
├── packages/
│   ├── types/                   # Unified Domain Entities, Enums & DTOs
│   ├── ui/                      # Shared Design System Tokens, Palettes & Breakpoints
│   └── config/                  # Shared ESLint, Prettier & TypeScript Configs
├── services/
│   └── mailer/                  # High-throughput Golang 1.22 Newsletter Microservice
├── docs/                        # Production Audits, Security & Architecture Specs
├── .env.example                 # Master environment variable template
├── package.json                 # Monorepo root scripts & turbo pipelines
└── turbo.json                   # Turborepo task pipeline definition
```

---

## 3. Application Separation & Role Boundaries

| Domain / Concern | `apps/web` (Port 3000) | `apps/admin` (Port 3001) | `apps/mobiles` | `services/mailer` (Port 8085) |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Audience** | Public sports consumers | Editorial staff, Admins, EMS | Mobile sports fans | Internal background service |
| **Authentication** | None (100% Unauthenticated) | NextAuth v4 (Credentials + JWT) | Local Preferences / Token | Internal API Token / CRON_SECRET |
| **RBAC Enforcement** | N/A | Strict RBAC (Contributor to Super-Admin) | N/A | Authenticated Webhook / Token |
| **Sports Coverage** | Football, Cricket, Basketball | Football, Cricket, Basketball | Football, Cricket, Basketball | Newsletter Curation Feed |
| **Coming Soon** | Tennis, Baseball, Hockey | N/A | Tennis, Baseball, Hockey | N/A |
| **Database Access** | Public Collections (News, Video, Newsletter) | All Collections (Users, EMS, CMS, News) | Via Web Proxy APIs | Internal / Webhook Callback |
| **Cache Layer** | ioredis + In-Memory Fallback | ioredis + In-Memory Fallback | AsyncStorage / Cache Store | In-Memory Priority Queues |

---

## 4. Sports Ingestion & Normalization Pipeline

To prevent provider lock-in and eliminate UI coupling to third-party schema quirks:

```
[ Upstream Providers ]
  ├── AllSportsAPI (Football & Basketball)
  ├── API-Football / API-Sports (Fixtures & Standings)
  └── Cricbuzz RapidAPI (Cricket Scores & Series)
            │
            ▼ (Rate-limited Proxy with 250ms fetch spacer)
[ GoalMills API Proxies ]
  ├── /api/football
  ├── /api/cricket
  └── /api/basketball
            │
            ▼ (TTL-Deliberate Caching: 15s Live, 60s Fixture, 300s Standings)
[ Redis Cloud / Memory Store ]
            │
            ▼ (Domain Adapters: adaptFixture, adaptStanding, UnifiedWebMatchEvent)
[ Standardized Internal Entities ]
  ├── UnifiedWebMatchEvent
  ├── UnifiedWebStandingItem
  └── CricketMatchEvent
            │
            ▼
[ UI Components ]
  ├── FootballMatchCard & FootballScreen
  ├── CricketMatchCard & CricketScreen
  └── BasketballMatchCard & BasketballScreen
```

---

## 5. Redis Caching & Realtime Strategy

### Cache Key Conventions & TTLs
- `cache:matches:live:{sport}` — 15 seconds (Real-time live scores)
- `cache:matches:fixtures:{sport}:{date}` — 60 seconds (Matchday schedule)
- `cache:standings:{sport}:{leagueId}` — 300 seconds (5 minutes)
- `cache:news:list:{filter}:{category}:{page}` — 180 seconds (3 minutes)
- `cache:news:item:{id}` — 300 seconds (5 minutes)
- `cache:videos:list:{category}:{limit}` — 180 seconds (3 minutes)
- `cache:metadata:{type}:{id}` — 600 seconds (10 minutes)

### Realtime Broadcast
1. Editorial CMS directly triggers `cacheInvalidatePattern('cache:news:*')` upon publication.
2. Server-Sent Events (`/api/realtime/stream`) and Socket.io broadcast live events to subscribed clients.

---

## 6. Email Deliverability & Audience Intelligence Engine

GoalMills incorporates an audience intelligence infrastructure:
1. **Double Opt-in Confirmation**: New subscribers receive a verification email with curated editor picks.
2. **Domain-Based Traffic Shaping**: The Go Mailer throttles outbound SMTP connections per recipient domain (e.g. Gmail, Yahoo, Outlook) to maximize inbox placement.
3. **Hard & Soft Bounce Classification**: Categorizes delivery failures and automatically moves permanent failures to the `SuppressionEntry` repository.
4. **Health Gate Validation**: Validates email syntax, domain MX records, and filters disposable email addresses before insertion.
