# GOALMILLS SCALE & REVENUE PROGRAM — PHASE 9 ARCHITECTURE
## Automated Content Distribution & Syndication Engine

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

### 1. Ingestion Triggers & Event Coupling

1. **Article Publishing Event**:
   - When an editor publishes an article (`News` document `status: 'published'`), a stream event of type `'article_published'` is emitted.
2. **Match Finalization Recap Event**:
   - When the Phase 8 Sports Warehouse marks a fixture as `'finished'`, a stream event `'match_fulltime_recap_ready'` is emitted containing scores, scorers, and key moments.
3. **Breaking Sports Alerts**:
   - Major events (e.g. transfer breaking news, derby results) trigger instant multi-channel dispatch.

---

### 2. Multi-Channel Adapters & Formatters

Each syndication channel receives platform-optimized content payloads:
- **X / Twitter Adapter**: Compiles 280-character copy with relevant team hashtags (`#ARSCHE #PremierLeague`), match score cards, and article canonical links.
- **Telegram Channel Adapter**: Emits rich Markdown messages with matchday emoji banners, goal timelines, and instant-view preview links.
- **WhatsApp Broadcast Adapter**: Formats clean, mobile-friendly matchday updates and news briefs.
- **Public Feed Generators**:
  - `GET /api/feeds/rss`: Standard RSS 2.0 with Media RSS (MRSS) enclosures.
  - `GET /api/feeds/google-news`: Google News indexed XML sitemap with publication timestamps and genre metadata.
  - `GET /api/feeds/apple-news`: Apple News syndicated feed.

---

### 3. Editorial Safety Gate & Approval Workflows

1. **Direct Publish Mode**: High-velocity routine match recaps and standard article publications bypass manual gates and dispatch immediately.
2. **Editorial Review Gate**: High-impact breaking alerts or sensitive derbies queue in `SyndicationJob` with `status: 'pending_approval'`, allowing editors to tweak copy, add custom imagery, or cancel dispatch before broadcasting.

---

### 4. Admin Content Distribution Studio (`/admin/distribution`)

The dedicated studio interface provides:
1. **Channel Connection Manager**: Manage API keys, Bot tokens, and webhook URLs securely per tenant.
2. **Rules Configuration Engine**: Set up conditional routes (e.g., "Premier League matches $\rightarrow$ Post to X and Telegram").
3. **Syndication Queue**: Live inspector for queued, pending, and dispatched syndication jobs with retry controls.
4. **Broadcast Sandbox**: Interactive composer to test-render social cards and simulate live broadcasts.
