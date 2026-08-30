# GOALMILLS SCALE & REVENUE PROGRAM — PHASE 9 PLAN
## Automated Content Distribution & Multi-Channel Sports Syndication Engine

### 1. Executive Summary
Phase 9 transforms GoalMills into an enterprise-grade **Automated Content Distribution & Multi-Channel Syndication Engine** across **all platforms** (`apps/web`, `apps/admin`, `apps/mobiles`, `@goalmills/types`). When editorial articles are published, or when live matches reach `finished` status in the Phase 8 Sports Warehouse, automated distribution pipelines generate match recaps, breaking bulletins, and social cards, dispatching them across configured syndication channels (X/Twitter, Telegram, WhatsApp, Facebook, Apple News, RSS/MRSS Feeds, and Google News sitemaps) with strict editorial safety controls, tenant scoping, and delivery telemetry.

---

### 2. Architecture & Multi-Channel Flow

```text
  ┌────────────────────────┐                    ┌────────────────────────┐
  │ Editorial Article      │                    │ Sports Warehouse &     │
  │ Publishing Action      │                    │ Match Finalizer        │
  └───────────┬────────────┘                    └───────────┬────────────┘
              │                                             │
              ▼                                             ▼
  ┌──────────────────────────────────────────────────────────────────────┐
  │             Phase 7 Event Pipeline (`sports:events`)                 │
  │     (`article_published` / `match_fulltime_recap_ready`)             │
  └──────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
  ┌──────────────────────────────────────────────────────────────────────┐
  │                  Distribution Rules Engine & Router                  │
  │    (Filter by Sport, Competition, Team, Tenant & Channel Routing)    │
  └──────────────────┬─────────────────────────────┬─────────────────────┘
                     │                             │
        (Direct Automation)               (Requires Review)
                     ▼                             ▼
  ┌─────────────────────────────────────┐ ┌──────────────────────────────┐
  │   Automated Syndication Dispatcher  │ │ Editorial Gate / Queue Hub   │
  │     (Rate-Limiting & Jitter Retry)  │ │ (Admin Approval / Rejection) │
  └──────────────────┬──────────────────┘ └──────────────┬───────────────┘
                     │                                   │ (Upon Approval)
                     ├───────────────────────────────────┘
                     │
     ┌───────────────┼───────────────┬───────────────┐
     ▼               ▼               ▼               ▼
┌──────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐
│X/Twitter │   │ Telegram  │   │ WhatsApp  │   │  RSS/MRSS │
│Broadcast │   │  Channel  │   │  Channel  │   │ & News XML│
└──────────┘   └───────────┘   └───────────┘   └───────────┘
```

---

### 3. Key Milestones & Platform Scope

#### Milestone 1: Shared Distribution Types & Channel Contracts (`@goalmills/types`)
- **`DistributionChannelType`**: `'x_twitter' | 'telegram' | 'whatsapp' | 'facebook' | 'rss_feed' | 'apple_news' | 'google_news'`.
- **`DistributionRule`**: Rule entity with `ruleId`, `tenantSlug`, `name`, `sport`, `competitionSlug`, `triggerEvent` (`'article_publish' | 'match_recap' | 'breaking_news' | 'score_alert'`), `targetChannels`, `requiresApproval`, `template`, `isActive`.
- **`SyndicationJob`**: Job state with `jobId`, `ruleId`, `channel`, `content` (headline, body, mediaUrls, linkUrl), `status` (`'queued' | 'pending_approval' | 'dispatched' | 'failed' | 'cancelled'`), `attempts`, `dispatchedAt`, `responsePayload`.
- **`ChannelCredentials`**: Secure configuration schema for API keys, Webhook URLs, Telegram Bot Tokens, and WhatsApp business endpoints.

#### Milestone 2: MongoDB Syndication Models (`apps/web`, `apps/admin`)
- `DistributionRule.ts`: Configurable tenant routing rules.
- `SyndicationJob.ts`: Durable job queue with status tracking, failure stacks, and audit logs.
- `ChannelConfig.ts`: Encrypted/managed tenant syndication channel connections.

#### Milestone 3: Distribution Dispatcher & Template Engine (`apps/web`, `apps/admin`)
- `ContentDistributionService`:
  - Automatically handles `article_published` and `match_fulltime` stream events.
  - Generates platform-tailored message templates (e.g. 280-char tweets with hashtags, rich Markdown Telegram posts with scorecard emojis, RSS 2.0 XML entries).
  - Rate-limiting token bucket per channel to prevent social API rate limits.

#### Milestone 4: Public Feeds & Syndication Endpoints (`apps/web`)
- `GET /api/feeds/rss`: Sport-filtered standard RSS 2.0 feed with MRSS enclosure images.
- `GET /api/feeds/google-news`: Google News compatible XML sitemap.
- `GET /api/feeds/apple-news`: Apple News format syndicated feed.
- `POST /api/distribution/webhook`: Outbound/inbound webhook receiver for external distribution triggers.

#### Milestone 5: Mobile App Content Sharing & Push Feed Parity (`apps/mobiles`)
- Direct push notifications and social syndication intent hooks for mobile devices.
- `goalmillsApi.getSyndicatedFeed(sport?: string)` for mobile live wire and breaking match recaps.

#### Milestone 6: Admin Content Distribution Hub (`apps/admin`)
- Dedicated `/admin/distribution` console:
  - **Connected Channels**: Status of X/Twitter, Telegram, WhatsApp, and RSS feeds.
  - **Distribution Rules Engine**: Create, edit, and toggle automated routing rules per sport.
  - **Editorial Approval Queue**: Review, edit, approve, or discard pending social posts and match recaps.
  - **Broadcast Sandbox & Preview**: Compose a test bulletin, preview rendering across channels, and trigger one-click broadcast.
- Integrated into `AdminNavBar.tsx` under CMS & Editorial and Quick Shortcuts.

#### Milestone 7: Automated Verification & Documentation
- Comprehensive Vitest unit tests for distribution rule matching, template rendering, and syndication dispatch.
- Monorepo compilation clean (`pnpm turbo run typecheck`).
- Documentation in `docs/scale-phase-9-plan.md`, `docs/scale-phase-9-architecture.md`, and `docs/scale-phase-9-report.md`.
