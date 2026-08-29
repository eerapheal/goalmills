# GoalMills — Phase 3 Repository & Architecture Discovery

**Date:** 2026-08-29  
**Version:** 3.0.0  
**Status:** AUDITED  

---

## 1. Repository Inventory & Workspace Structure

The GoalMills mono-repository is structured into three frontends/applications and one dedicated Go microservice:

```text
goalmills/
├── apps/
│   ├── web/           # Next.js 16+ (Webpack) Public Web Application (SEO, Livescores, News, Videos, SSE)
│   ├── admin/         # Next.js 16+ (Webpack) Authenticated Staff CMS & Operations Dashboard
│   └── mobiles/       # React Native / Expo Mobile Application
├── services/
│   └── mailer/        # High-throughput Go SMTP/DKIM Microservice with Priority Queuing
├── docs/              # Master Architecture, Security Threat Models & Verification Reports
└── package.json       # Monorepo Workspace Configuration (pnpm)
```

---

## 2. Component & Surface Area Breakdown

### 2.1 Web Application (`apps/web`)
- **Framework:** Next.js (App Router), TailwindCSS, TypeScript.
- **Pages & Routes:**
  - `/` (Home, Live sports tabs: Football, Cricket, Basketball, Coming Soon tabs: Tennis, Baseball, Hockey).
  - `/news/[id]` (Rich article reader, editorial intel, related news).
  - `/videos/[id]` (Video highlight viewer with Cloudinary optimization).
  - `/docs` (OpenAPI Swagger / Interactive Documentation).
  - `/sitemap.xml` & `/robots.txt` (Discovery endpoints).
- **Core APIs:**
  - `/api/football` (AllSportsAPI proxy, 15s-600s dynamic Redis TTL, circuit breaker).
  - `/api/cricket` (Cricbuzz RapidAPI / AllSports proxy, innings normalizer).
  - `/api/basketball` (AllSportsAPI proxy, quarters & overtime normalizer).
  - `/api/news` & `/api/news/[id]` (MongoDB editorial feed with Redis cache).
  - `/api/videos` & `/api/videos/[id]` (Video highlights feed with Redis cache).
  - `/api/sponsorships` (Active banner ads with sport/placement targeting).
  - `/api/sponsorships/[id]/track` (Guarded telemetry tracking: 20/min/IP rate limit, 10s deduplication).
  - `/api/realtime/stream` (SSE event streaming for live scores, status changes, and publishing).
  - `/api/newsletter/*` (Subscription, double opt-in confirmation, deliverability health gates).

### 2.2 Admin Application (`apps/admin`)
- **Framework:** Next.js (App Router), TailwindCSS, TypeScript, NextAuth/JWT.
- **7 Primary Navigation Tabs:**
  1. **CMS & Editorial (`/` / `/news` / `/videos`)**: Content creation, rich markdown editing, image uploads.
  2. **Employee Management (`/employees`)**: Staff directory, role assignments, onboarding & training progress.
  3. **User Management (`/users`)**: Registered subscribers, activity tracking, account status.
  4. **Sponsorship Management (`/sponsorships`)**: Campaign creation, budget caps, impression/click analytics.
  5. **Content Deletion / Trash Bin (`/deletion`)**: Soft-deleted content recovery, permanent purge, audit log integration.
  6. **Publishing & Workflows (`/publishing`)**: Scheduled articles, editorial approval pipeline.
  7. **System Configuration (`/system`)**: Redis cache health, memory entries, stampede saves, database latency, cache flush.
- **Security & RBAC:**
  - Roles: `user`, `contributor`, `staff`, `editor`, `manager`, `super-admin`.
  - Server-side RBAC enforced via `requirePermission()` in `@/lib/serverAuth`.

### 2.3 Mobile Application (`apps/mobiles`)
- **Framework:** Expo / React Native.
- **Surfaces:** SportTabs (Football, Cricket, Basketball), Live match centers, News feeds, Video highlights, and `SponsoredBannerCard`.

### 2.4 Go Mailer Microservice (`services/mailer`)
- **Language:** Go (1.23+).
- **Port:** 8085.
- **Capabilities:** Priority queue, token bucket rate limiter, DKIM signature verification, bounce handling, suppression lists.

---

## 3. Production Environment & Secrets Matrix

| Environment Variable | Workspace | Purpose | Secret? | Required in Prod? | Audit Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `MONGODB_URI` | `web`, `admin` | MongoDB Atlas Connection String | **YES** | **YES** | Verified via environment injection |
| `REDIS_URL` / `REDIS_HOST` | `web`, `admin` | Redis URI (`rediss://` TLS supported) | **YES** | **YES** | Verified with fallback to in-memory |
| `NEXTAUTH_SECRET` | `admin` | NextAuth Session Encryption | **YES** | **YES** | Enforced 32+ char random key |
| `NEXTAUTH_URL` | `admin` | Admin Canonical URL | NO | **YES** | Configured per deployment domain |
| `FOOTBALL_API_KEY` | `web`, `admin` | AllSportsAPI Football Key | **YES** | **YES** | Server-side only (never exposed) |
| `CRICKET_API_KEY` | `web`, `admin` | Cricbuzz / RapidAPI Key | **YES** | **YES** | Server-side only (never exposed) |
| `BASKETBALL_API_KEY` | `web`, `admin` | AllSportsAPI Basketball Key | **YES** | **YES** | Server-side only (never exposed) |
| `CLOUDINARY_*` | `web`, `admin` | Cloudinary Media Asset Keys | **YES** | **YES** | Server-side only |
| `MAILER_SERVICE_URL` | `web`, `admin` | Internal Go Mailer URL | NO | **YES** | Defaults to `http://localhost:8085` |
| `NEXT_PUBLIC_APP_URL` | `web` | Canonical Base URL for SEO/OG | NO | **YES** | Required for absolute sitemaps/OG |

---

## 4. Discovery Conclusion

- **Zero Hardcoded Secrets** found in public client-side bundles or repository code.
- Sports API keys are strictly encapsulated behind server-side Next.js route handlers.
- Multi-sport normalization actively separates Football, Cricket, and Basketball logic while isolating Tennis, Baseball, and Hockey behind "Coming Soon" states.
