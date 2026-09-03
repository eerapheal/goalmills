# GoalMills — Master Enterprise Admin Operations Document (EOD)

**Document Reference:** GM-EOD-2026-V1  
**Classification:** Confidential / Internal Enterprise Operations Manual  
**Author & Executive Lead:** Ekpenisi Erue Raphael, Lead Architect & Sports Media Director  
**Effective Date:** September 2026  
**Target Systems:** GoalMills Admin Portal (`apps/admin`), Public Web (`apps/web`), Live Sports Engine, Microservices  
**Audience:** Super Admins, Operations Managers, Chief Editors, Desk Leads, System Administrators, DevOps Engineers

---

## TABLE OF CONTENTS

1. [Executive Overview & Operational Philosophy](#1-executive-overview--operational-philosophy)
2. [System Topology & Monorepo Architecture](#2-system-topology--monorepo-architecture)
3. [Role-Based Access Control (RBAC) & Security Governance](#3-role-based-access-control-rbac--security-governance)
4. [Newsroom CMS & Editorial Publishing Workflows](#4-newsroom-cms--editorial-publishing-workflows)
5. [Live Sports Engine & Matchday Operations](#5-live-sports-engine--matchday-operations)
6. [Omni-Channel Distribution & Social Syndication Engine](#6-omni-channel-distribution--social-syndication-engine)
7. [HR, Staff Management & Onboarding Operations](#7-hr-staff-management--onboarding-operations)
8. [SEO, Google News & Discover Growth Operations](#8-seo-google-news--discover-growth-operations)
9. [Revenue, Sponsorships & Financial Administration](#9-revenue-sponsorships--financial-administration)
10. [Technical Diagnostics, Redis Caching & Infrastructure Operations](#10-technical-diagnostics-redis-caching--infrastructure-operations)
11. [Data Privacy, GDPR/NDPR Compliance & Audit Logging](#11-data-privacy-gdprndpr-compliance--audit-logging)
12. [Incident Management Runbook & Emergency Response](#12-incident-management-runbook--emergency-response)
13. [Standard Operating Procedures (SOPs) & Checklists Library](#13-standard-operating-procedures-sops--checklists-library)

---

## 1. EXECUTIVE OVERVIEW & OPERATIONAL PHILOSOPHY

### 1.1 Mission & Enterprise Scope
GoalMills is a high-performance sports media technology enterprise delivering real-time sports intelligence, live matchday coverage, predictive statistics, verified investigative reporting, and multi-channel content syndication. 

The **GoalMills Admin Portal (`apps/admin`)** functions as the central nervous system of the organization. It integrates editorial content management, live sports event feeds, employee training and performance evaluation, commercial sponsorship inventory, audience analytics, and technical system infrastructure into a single unified dashboard.

### 1.2 Core Operational Philosophies
Every administrator, editor, and staff member must operate under five non-negotiable operational principles:

1. **Accuracy Over Speed:** Speed gets attention, but unverified errors destroy reputation. A story published 2 minutes later with 100% verified facts is infinitely more valuable than an erroneous breaking post published 30 seconds ahead of competitors.
2. **Zero Unverified Claims:** Rumours must be labeled as rumours. Unverified social chatter must never be stated as factual truth. Primary sources or the Two-Source Rule must govern all published claims.
3. **The Content Flywheel:** An individual article is never a standalone endpoint; it is a vehicle that feeds an ongoing audience engine (Website ↔ Social Media ↔ Newsletter ↔ WhatsApp ↔ Mobile Push).
4. **Defense-in-Depth Security:** Access to privileged actions is strictly partitioned through granular Role-Based Access Control (RBAC). No individual possesses unmonitored or unlogged access to production systems.
5. **Audience-Centric Value (80/20 Rule):** In all external distribution channels, deliver 80% direct contextual value in-feed and 20% outbound traffic conversion.

---

## 2. SYSTEM TOPOLOGY & MONOREPO ARCHITECTURE

### 2.1 Workspace Structure
GoalMills is structured as a Turbo-orchestrated enterprise monorepo:

```text
goalmills/
├── apps/
│   ├── web/                    # Consumer Web Portal (Next.js 16 App Router, Port 3000)
│   ├── admin/                  # Administrative Management Hub (Next.js 16, Port 3001)
│   └── mobiles/                # Mobile Client (Expo 52 / React Native)
├── packages/
│   ├── types/                  # Shared TypeScript Interfaces, Enums & DTOs
│   ├── ui/                     # Design System Components & Theme Tokens
│   └── config/                 # Monorepo Configurations (ESLint, Prettier, Tailwind)
├── services/
│   └── mailer/                 # High-Throughput Golang Background Email Microservice
├── docs/                       # Architectural Specifications, Runbooks & Audits
├── turbo.json                  # Turborepo Build Pipelines
└── pnpm-workspace.yaml         # Package Workspace Linking
```

### 2.2 Operational Service Map

```
                     ┌────────────────────────┐
                     │ Cloudflare Edge / WAF  │
                     └───────────┬────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
       ┌───────────────────┐           ┌───────────────────┐
       │     apps/web      │           │    apps/admin     │
       │ Public Consumer   │           │ Admin Operations  │
       │    (Port 3000)    │           │    (Port 3001)    │
       └─────────┬─────────┘           └─────────┬─────────┘
                 │                               │
                 ├───────────────────────────────┤
                 ▼                               ▼
       ┌───────────────────┐           ┌───────────────────┐
       │   Redis Cluster   │           │  MongoDB Cluster  │
       │ Caching & Pub/Sub │           │ Primary Document  │
       │    (Port 6379)    │           │    (Port 27017)   │
       └─────────┬─────────┘           └─────────┬─────────┘
                 │                               │
                 ├───────────────────────────────┤
                 ▼                               ▼
       ┌───────────────────┐           ┌───────────────────┐
       │ Cloudinary CDN    │           │ services/mailer   │
       │ Media Assets &    │           │ Golang Dispatcher │
       │ Transformations   │           │    (Port 8085)    │
       └───────────────────┘           └───────────────────┘
```

### 2.3 Application Roles & Port Allocations
- **`apps/web` (Port 3000):** Public-facing, SEO-optimized, highly cached consumer portal. Read-heavy architecture utilizing Next.js Incremental Static Regeneration (ISR) and Server Components.
- **`apps/admin` (Port 3001):** Internal operations portal. Write-heavy, authenticated, session-protected environment utilizing NextAuth.js JWT authentication and granular RBAC.
- **`services/mailer` (Port 8085):** High-throughput Golang microservice managing priority email queues, double opt-in verification, campaign syndication, and bounce handling.
- **`Redis` (Port 6379):** Distributed caching tier, rate-limiting store, session cache, and WebSocket pub/sub bus.
- **`MongoDB` (Port 27017):** Primary transactional database with connection pooling and multi-index coverage.

---

## 3. ROLE-BASED ACCESS CONTROL (RBAC) & SECURITY GOVERNANCE

### 3.1 Role Hierarchy Matrix
GoalMills implements a strict 6-tier role hierarchy defined in `@goalmills/types` and enforced via `@/lib/rbac.ts`:

| Tier | Role | Numeric Level | Primary Operational Scope |
| :--- | :--- | :---: | :--- |
| **Tier 0** | `user` | `0` | Public consumer / registered subscriber. Read-only access to published content. No admin access. |
| **Tier 1** | `contributor` | `1` | External freelance writers. Can draft articles and request editorial publication. Cannot self-publish. |
| **Tier 2** | `staff` | `2` | Full-time journalists & digital creators. Content creation, personal report filing, training portal, stand-ups. |
| **Tier 3** | `editor` | `3` | Senior editorial staff. Can review, approve, publish, manage categories, schedule stand-ups, and audit reports. |
| **Tier 4** | `manager` | `4` | Operations & Department Managers. Full access to editorial, employee onboarding, evaluations, payroll, and billing. |
| **Tier 5** | `super-admin` | `5` | Executive Leadership & DevOps. Unrestricted system access, user administration, system settings, and purge operations. |

### 3.2 Granular Permission Actions
The system enforces 28 distinct permission tokens across all operational domains:

```text
EDITORIAL & CONTENT:
- articles:read            # View published content
- articles:draft           # Create and edit draft articles
- articles:request_publish # Submit drafts for editorial review
- articles:publish         # Instantly publish or schedule articles
- articles:edit_own        # Edit content authored by self
- articles:edit_any        # Edit content authored by any staff member
- articles:delete          # Soft-delete or move articles to trash
- articles:approve         # Approve review requests in publishing queue

TAXONOMY & MEDIA:
- categories:manage        # Create, edit, and delete sports categories and tags
- transfers:manage         # Create and update transfer market records
- videos:upload            # Upload and publish video highlights and shorts

STAFF & HUMAN RESOURCES:
- employees:read           # View staff directory and profiles
- employees:manage         # Edit staff roles, status, and permissions
- employees:onboard        # Add new employees and initiate 30-day curriculum

REPORTS & STAND-UPS:
- reports:read_own         # View personal daily report history
- reports:read_all         # View, audit, and score all staff daily reports
- reports:submit           # Submit mandatory daily content reports
- standup:attend           # Attend daily 5 PM stand-up meeting
- standup:view_own         # View personal attendance records
- standup:view_all         # View complete newsroom attendance logs
- standup:schedule         # Host and record daily stand-up sessions

EVALUATIONS & COMPENSATION:
- evaluations:read         # View performance scores and tier rankings
- evaluations:manage       # Conduct performance evaluations and update scores
- payroll:read             # View personal compensation and bonus allowances
- payroll:manage           # Process newsroom payroll, incentives, and payouts

HANDBOOK & SOPs:
- handbook:read            # Access operating manual and training guides
- handbook:manage          # Update official operating systems and checklists

SYSTEM & SECURITY:
- users:manage             # Manage platform user accounts, bans, and access
- system:settings          # Configure global parameters, cache, and diagnostics
```

### 3.3 Authentication & Session Lifecycle
1. **Engine:** NextAuth.js configured with JSON Web Token (JWT) strategy.
2. **Token Rotation & Lifespan:** Access tokens expire after 24 hours. Refresh cycle checks role validity in MongoDB on every session revalidation.
3. **Session Invalidation:** When an employee's role is demoted, suspended, or terminated, all active sessions are immediately invalidated via Redis session revocation list.
4. **Password Policy:** Minimum 10 characters with uppercase, lowercase, numeric, and symbol requirements. Hashed using `bcryptjs` with salt work factor of 12.
5. **Brute Force Protection:** IP and username rate-limited to 5 failed attempts within a 15-minute window before triggering a temporary 30-minute block.

---

## 4. NEWSROOM CMS & EDITORIAL PUBLISHING WORKFLOWS

### 4.1 Editorial Story Lifecycle

```
[DRAFT] ──────► [REVIEW_REQUESTED] ──────► [APPROVED] ──────► [PUBLISHED]
   │                    │                     │                   │
   ▼                    ▼                     ▼                   ▼
Author Saves       Editor Queue          Scheduled or       Live on Web,
Locally &          Checked for           Instant Live       API & Mobile
Self-Edits         Verification          Trigger            Feeds
```

1. **`DRAFT`:** Story is drafted by Contributor, Staff, or Editor. Auto-saved every 30 seconds.
2. **`REVIEW_REQUESTED`:** Contributor/Staff marks piece ready. Moves into Publishing Queue (`/admin/publishing`).
3. **`APPROVED`:** Editor validates sourcing, accuracy, tone, SEO metadata, and image rights.
4. **`SCHEDULED`:** Story assigned future release timestamp (e.g., timed with match kickoff).
5. **`PUBLISHED`:** Story becomes public. Generates canonical URL, triggers Next.js ISR on-demand revalidation, and enqueues social syndication tasks.
6. **`ARCHIVED` / `TRASH`:** Obsolete, duplicate, or soft-deleted items moved to Trash (`/admin/deletion`).

### 4.2 Breaking News Verification Protocol & Status Badges
Every piece of breaking sports journalism must display a verified status badge:

| Status Badge | Editorial Meaning | Verification Requirement |
| :---: | :--- | :--- |
| 🔴 **UNVERIFIED** | Initial lead or viral report | Single social report or unconfirmed tip. **NEVER** publish as definitive fact. |
| 🟠 **DEVELOPING** | Active investigation ongoing | Multiple sources reporting; negotiations or discussions actively occurring. |
| 🟡 **REPORTED** | Substantial credible reporting | High-tier journalist (e.g. Ornstein, Romano) or major network reporting. |
| 🟢 **CONFIRMED** | 100% Factually Verified | Official club announcement, league statement, or press conference confirmation. |

### 4.3 Sourcing Hierarchy & The Two-Source Rule
The newsroom strictly enforces the **Two-Source Rule**:
- Any unconfirmed transfer bid, managerial firing, or disciplinary sanction must have:
  - **Option A:** One Tier-1 Official Primary Source (Club, Player, League, Press Conference); OR
  - **Option B:** Two independent, reputable Tier-2 sources (e.g. BBC Sport + The Athletic) with zero shared sourcing links.
- If a claim has only one secondary source, the headline and lead must explicitly state attribution:  
  *Good:* "Arsenal Exploring Move for Striker X, Reports Suggest"  
  *Unacceptable:* "Arsenal Sign Striker X"

### 4.4 Mandatory Pre-Publishing Checklist (10 Points)
Before any article changes status to `PUBLISHED`, the reviewing Editor must verify:
- [ ] Headline is clear, accurate, contains primary entity, and avoids deceptive clickbait (<60 chars).
- [ ] 3-Sentence Lead answers: 1. What happened? 2. What was the key factor? 3. Why does it matter?
- [ ] All player names, opponent clubs, match scores, transfer fees, and competition titles are 100% accurate.
- [ ] Primary source is explicitly attributed with contextual link where appropriate.
- [ ] Structured headings (H2, H3) used logically throughout the piece; paragraphs limited to 2–4 sentences.
- [ ] Statistics cited directly support the core argument and have been cross-checked (FBref, Transfermarkt).
- [ ] High-resolution lead image (minimum 1200px wide, WebP format) with descriptive alt text and license clearance.
- [ ] Unique URL slug configured using clean lowercase hyphens (`/football/premier-league/match-report`).
- [ ] 3–5 contextual internal links pointing to relevant Club Hubs, Player Profiles, or Match Centers.
- [ ] Author byline and publication timestamp accurately reflected.

### 4.5 Editorial Correction & Errata Protocol
If an inaccuracy is discovered post-publication:
1. **Immediate Correction:** Update the live content immediately.
2. **Transparent Errata Box:** Add a prominent correction note at the base of the article:  
   *`"Correction (August 28, 2026): An earlier version of this report incorrectly stated Player X scored in the 42nd minute. The goal was scored by Player Y. The statistics have been updated."`*
3. **Never Silently Scrub:** Silent changes destroy institutional credibility.
4. **Log in Error Registry:** Record the incident in the newsroom error log (`/admin/system`) to identify training gaps during daily stand-ups.

---

## 5. LIVE SPORTS ENGINE & MATCHDAY OPERATIONS

### 5.1 Matchday Coverage Architecture
GoalMills Match Centers operate as live data hubs anchored by an Entity-First model:

```text
MATCHDAY HUB (/matches/arsenal-vs-chelsea-2026)
├── PRE-MATCH (Kickoff -24h to -1h)
│   ├── Tactical Preview & Key Battles
│   ├── Injury Updates & Predicted XIs
│   └── Head-to-Head Historical Metrics
├── LIVE MATCH (Kickoff to Full-Time +15m)
│   ├── Real-Time Scoreboard & Clock
│   ├── Timeline Events (Goals, Cards, Subs, VAR)
│   ├── Live Commentary Stream & Field Tilt
│   └── Live Statistics (Possession, xG, Shots)
└── POST-MATCH (Full-Time to +48h)
    ├── Comprehensive Match Report
    ├── Player Performance Ratings (1–10)
    ├── Press Conference Manager Quotes
    └── Tactical Deep Dive & Table Impact
```

### 5.2 Sports API Ingestion & Rate-Limiting Spacer
To prevent 429 rate-limit rejections from upstream sports data providers:
- All outbound provider calls route through an internal rate-limiting spacer enforcing a minimum 250ms gap between consecutive requests.
- Live fixture polling intervals:
  - **In-Play Active Matches:** 15-second polling interval cached in Redis with 10-second TTL.
  - **Pre-Match / Upcoming (Today):** 5-minute polling interval.
  - **Completed / Historical:** 24-hour immutable cache TTL.

### 5.3 Live Commentary Desk Operations
Live commentary operators in the Admin portal must follow the standard notation:
- `[0'] KICKOFF:` Whistle blown, starting formations confirmed.
- `[GOAL!] 24' - ARSENAL 1-0 CHELSEA:` Scorer name, assisting player, and short description of the attacking sequence.
- `[YELLOW CARD] 38':` Player name, tactical foul / misconduct reason.
- `[HALF-TIME] 45+2':` Score, possession split, brief tactical observation.
- `[VAR CHECK] 61':` Event reviewed, on-field referee decision, final ruling.
- `[FULL-TIME] 90+5':` Final score, match summary, standout performer.

---

## 6. OMNI-CHANNEL DISTRIBUTION & SOCIAL SYNDICATION ENGINE

### 6.1 The 1 Article ➔ 20 Assets Repurposing Engine
A core administrative responsibility is managing the distribution pipeline so that every major story is atomized across the digital ecosystem:

```
                  ┌──────────────────────────────┐
                  │ 1 Verified Headline Article  │
                  │   Published on GoalMills     │
                  └──────────────┬───────────────┘
                                 │
     ┌──────────────┬────────────┼────────────┬──────────────┐
     ▼              ▼            ▼            ▼              ▼
┌─────────┐    ┌─────────┐  ┌─────────┐  ┌─────────┐   ┌────────────┐
│ X Wire  │    │Facebook │  │Instagram│  │TikTok / │   │ WhatsApp / │
│ Alerts  │    │Debate   │  │Carousels│  │Shorts   │   │ Push       │
│ 6 Posts │    │2 Posts  │  │3 Posts  │  │2 Videos │   │ 2 Alerts   │
└─────────┘    └─────────┘  └─────────┘  └─────────┘   └────────────┘
```

### 6.2 Platform Operational Specifications

#### X (Twitter) Engine
- **Primary Function:** Real-time breaking news wire, live match events, tactical debate threads.
- **Rules:** Clear emojis, concise text (<200 characters), verified tags, no bare links without context.
- **Matchday Rhythm:** Lineup release ➔ Kickoff ➔ Live goals ➔ Half-time score ➔ Full-time report link ➔ Tactical analysis thread.

#### Instagram & Visual Channels
- **Primary Function:** High-contrast visual storytelling, aesthetic player stats, engagement carousels.
- **Graphic Specs:** Standard portrait `1080 × 1350 px` (4:5 ratio) or Square `1080 × 1080 px`.
- **Canva Brand Kit:** Navy `#0B1220`, White `#FFFFFF`, GoalMills Green `#10B981`, Alert Red `#EF4444`.
- **Carousel Strategy:** 5–7 slides explaining "5 Tactical Reasons [Team] Won". Slide 1 must feature an irresistible visual hook.

#### TikTok, YouTube Shorts & Reels
- **Primary Function:** High-velocity discovery, younger sports demographic, viral storytelling.
- **Specs:** Vertical video `1080 × 1920 px` (9:16 ratio), 30–60 seconds duration.
- **30-Second Script Rule:** 
  - `0–3s Hook:` Dramatic statement ("Nobody noticed the tactical tweak that won Arsenal the game...").
  - `3–10s Core Event:` Result and primary protagonist.
  - `10–20s Analytical Evidence:` Concrete stat or tactical diagram.
  - `20–27s Impact:` League standing or tournament consequence.
  - `27–30s CTA:` "Follow GoalMills for daily football breakdowns."
- **Copyright Law:** **NEVER** re-upload broadcast TV match clips. Use high-res licensed stills, animated tactical boards, face-cam commentary, and copyright-cleared audio.

#### WhatsApp Broadcast Channel
- **Primary Function:** Direct, algorithm-free relationship with loyal sports fans.
- **Rhythm:** Morning Brief (7:00 AM WAT), Breaking Transfer Alerts, Half-Time/Full-Time Scores of major derbies.
- **Formatting:** Clean bulleted text, bold headers, single direct link to full report.

---

## 7. HR, STAFF MANAGEMENT & ONBOARDING OPERATIONS

### 7.1 The 30-Day Sports Media Academy
All incoming editorial and creative staff must complete the 30-Day GoalMills Employee Curriculum managed via `/admin/portal` and `/admin/employees`:
- **Week 1 (Days 1–7): Sports Journalism Foundation** (100% Supervision, Inverted pyramid, Fact-checking, Headlines, SEO).
- **Week 2 (Days 8–14): Content Strategy & Social Media** (High supervision, Platform mechanics, Community management, Multi-channel syndication).
- **Week 3 (Days 15–21): Canva Visuals + Video Production** (Moderate supervision, Brand kits, Matchday templates, Vertical short-form scripts, YouTube).
- **Week 4 (Days 22–30): Professional Newsroom & Independence** (Light supervision, Live matchday operations, Crisis management, Final certification exam).

### 7.2 Mandatory Daily Stand-Up Procedure
- **Time:** 5:00 PM – 5:30 PM WAT (Daily, Monday through Saturday).
- **Platform:** Google Meet (Permanent newsroom room link).
- **Attendance Policy:** 100% mandatory. Unexcused absence results in daily evaluation forfeiture.
- **Standard Stand-Up Agenda:**
  1. `5:00–5:05 PM:` Roll-call and attendance logging in `/admin/standup`.
  2. `5:05–5:15 PM:` Staff round-robin (What did I study? What did I create? What did I publish? What was my roadblock?).
  3. `5:15–5:25 PM:` Editor feedback session (Review of best article, best graphic, biggest error, and key improvement).
  4. `5:25–5:30 PM:` Tomorrow's match assignments, breaking news coverage roster, and priorities.

### 7.3 Daily Staff Content Report Audit Protocol
Every staff member must submit their Daily Report via `/admin/portal` before 4:45 PM WAT:
- Reviewing editors must audit all submitted links for sourcing validity, SEO compliance, and graphic branding before signing off.
- The 100-Point Scoring Rubric is applied:

| Evaluation Dimension | Weight | Scoring Standards |
| :--- | :---: | :--- |
| **Research & Verification** | 15 pts | Sourcing depth, primary confirmation, zero unverified claims. |
| **Accuracy & Factual Integrity** | 15 pts | Accurate scores, names, dates, stats, club badges, and quotes. |
| **Writing & Story Structure** | 15 pts | Inverted pyramid, compelling 3-sentence lead, clean grammar. |
| **SEO & Discover Readiness** | 10 pts | Search intent match, title <60 chars, slug, meta description, internal links. |
| **Social Media Formatting** | 10 pts | Platform-specific caption, hashtags, engaging CTA, comment replies. |
| **Graphic & Visual Quality** | 10 pts | Canva brand palette alignment, typography hierarchy, safe margins. |
| **Creativity & Editorial Angle** | 10 pts | Original tactical storytelling, unique data angle, engaging hook. |
| **Publishing Discipline** | 5 pts | Meeting deadlines, correct category hubs, tag hygiene. |
| **Analytics & Self-Awareness** | 5 pts | Awareness of CTR, engagement metrics, learning from underperformers. |
| **Reporting & Teamwork** | 5 pts | Report submitted before 4:45 PM, active stand-up participation. |

### 7.4 Certification Tiers & Performance Actions
- **90–100% (Advanced Professional):** Eligible for independent live match coverage, editorial queue review, and performance bonuses.
- **80–89% (Professional):** Standard operational clearance for assigned desks.
- **70–79% (Junior Professional):** Requires continuous editor sign-off before publishing.
- **Below 70% (Remedial Action):** 7-day probationary review; failure to improve results in contract termination.

---

## 8. SEO, GOOGLE NEWS & DISCOVER GROWTH OPERATIONS

### 8.1 Search Intent & Topical Authority
Sports SEO at GoalMills focuses on building compounding organic visibility:

```text
SPORTS KEYWORD ARCHITECTURE:
├── HEAD KEYWORDS (High Volume / High Competition)
│   └── "Premier League News", "Arsenal FC", "Transfer News"
├── MEDIUM-TAIL QUERIES (Intent-Driven)
│   └── "Arsenal Transfer News Today", "Premier League Fixtures", "Chelsea Injury News"
└── LONG-TAIL QUERIES (High Conversion / Immediate Authority)
    └── "Arsenal Predicted Lineup Against Chelsea", "Victor Osimhen Injury Return Date"
```

### 8.2 Structured Data Specifications (Schema.org)
All public pages automatically output JSON-LD structured data validated against Google Search Central guidelines:
- **`NewsArticle`:** Contains `headline`, `image`, `datePublished`, `dateModified`, `author` (Person with URL), and `publisher` (GoalMills).
- **`SportsEvent`:** Embedded on Match Centers with `homeTeam`, `awayTeam`, `startDate`, `location`, and `eventStatus`.
- **`BreadcrumbList`:** Hierarchical navigation (`Home > Football > Premier League > Arsenal`).
- **`Organization`:** Platform branding, official logo, verified social URLs, and editorial contact.

### 8.3 Google Discover Card Optimization
To maximize pickup on Google Discover:
1. **Lead Imagery:** Always include at least one high-resolution image (`width >= 1200px`) with `max-image-preview:large` meta robots directive.
2. **Emotional & Curious Headlines:** Capture genuine interest without deceptive clickbait.
3. **Entity Knowledge Graph Alignment:** Ensure main entities (players, clubs, tournaments) are prominent in the title and opening paragraph.
4. **Mobile Performance:** Page must load with LCP < 2.5s and CLS < 0.1 on 4G cellular connections.

---

## 9. REVENUE, SPONSORSHIPS & FINANCIAL ADMINISTRATION

### 9.1 Revenue Model Overview
GoalMills operates on a diversified, resilient revenue model:
1. **Programmatic Advertising:** Header bidding and Google Ad Manager placements designed with strict Core Web Vitals protections (no layout-shifting banners).
2. **Direct Brand Sponsorships:** Premium brand integrations across high-visibility assets.
3. **Fan Pass & GoalMills Pro:** Premium digital subscriptions offering ad-free reading, advanced statistical dashboards, and exclusive newsletters.
4. **Affiliate Commerce:** Contextual affiliate partnerships for official club kits, tickets, and sports streaming services.

### 9.2 Direct Sponsorship Inventory (`/admin/sponsorships`)
The commercial team administers four core sponsorship assets:

| Asset Name | Location | Deliverables |
| :--- | :--- | :--- |
| **Match Center Title Partner** | Live Match Hubs | "Match Center Presented by [Brand]", live banner on scoreboard, branded lineup cards. |
| **Transfer Hub Exclusive Partner** | `/football/transfers` | Header sponsor on all transfer articles, "Transfer Watch Powered by [Brand]" on social cards. |
| **Daily Morning Brief Partner** | Email Newsletter & WhatsApp | Top banner sponsorship + 50-word brand spotlight in morning dispatch. |
| **Matchday Prediction Sponsor** | Social Channels | Co-branded social prediction cards, weekly fan poll contests with branded prizes. |

### 9.3 Strict Separation of Church & State
- Commercial advertisers possess zero influence over editorial coverage, match ratings, or transfer reporting.
- All sponsored content must be prominently marked as **"Sponsored"** or **"Partner Content"** with appropriate `rel="sponsored"` outbound link attributes.
- Native advertising masquerading as objective reporting is strictly prohibited and subject to immediate administrative termination.

---

## 10. TECHNICAL DIAGNOSTICS, REDIS CACHING & INFRASTRUCTURE OPERATIONS

### 10.1 Diagnostic Control Panel (`/admin/system`)
The system diagnostics panel displays real-time health metrics across the infrastructure:
- MongoDB connection pool status, active cursors, and query execution times.
- Redis memory consumption, hit/miss ratios, and connected clients.
- Active background tasks, Golang mailer queue depth, and WebSocket connections.

### 10.2 Redis Caching Hierarchy & Invalidation Protocols

| Cache Key Pattern | Cached Resource | TTL | Invalidation Trigger |
| :--- | :--- | :---: | :--- |
| `news:article:{slug}` | Single Article HTML / Data | 1 Hour | Article Edit / Re-publish / Delete |
| `news:latest:{category}` | Category News Feed | 5 Mins | New Article Published in Category |
| `match:live:{fixtureId}` | Real-Time Match Data | 10 Secs | Match Event WebSocket Emission |
| `standings:{leagueId}` | League Table Standings | 15 Mins | Match Full-Time Result Recorded |
| `sports:warehouse:*` | Normalized Sports Statistics | 24 Hours | Scheduled Nightly Data Sync |

#### Targeted Cache Purge SOP:
When breaking news requires immediate global propagation:
1. Navigate to `/admin/system` ➔ **Cache Management**.
2. To purge a single article: Enter specific slug and dispatch `cache:invalidate:article:{slug}`.
3. To purge live match scores: Enter fixture ID and dispatch `cache:invalidate:match:{id}`.
4. **Never** execute a global `FLUSHALL` during peak live matchday hours.

### 10.3 Database Maintenance & Performance Tuning
- **Indexes:** Periodically verify compound indexes via MongoDB Compass or Atlas:
  - `articles: { status: 1, categorySlug: 1, publishedAt: -1 }`
  - `matches: { fixtureId: 1, status: 1, date: -1 }`
  - `employees: { email: 1, status: 1, tier: 1 }`
- **Connection Pooling:** Max pool size set to 25 connections per Node serverless instance to prevent socket exhaustion during traffic spikes.
- **Nightly Backup Schedule:** Automated mongodump snapshot taken at 02:00 UTC daily, encrypted, and synced to off-site object storage with a 30-day retention window.

---

## 11. DATA PRIVACY, GDPR/NDPR COMPLIANCE & AUDIT LOGGING

### 11.1 GDPR & NDPR Compliance Engine (`/admin/deletion`)
GoalMills adheres to the Nigeria Data Protection Regulation (NDPR) and the EU General Data Protection Regulation (GDPR):
- **Right to Erasure:** When a user requests data deletion, navigate to `/admin/deletion`. Entering the verified user ID initiates a soft-delete grace period (7 days) followed by an automated permanent purge of user profiles, comment histories, and newsletter subscriptions.
- **Cookie Consent & Tracking:** No third-party behavioral trackers execute prior to affirmative user consent on the public web portal.

### 11.2 Enterprise Audit Trail
Every privileged action within `/admin` generates an immutable audit record in the MongoDB `AuditLog` collection:
- `timestamp`: UTC timestamp of the action.
- `actorId`: User ID and email of the administrator.
- `actorRole`: Active role at time of execution.
- `ipAddress`: Remote client IP address.
- `action`: Specific permission token executed (e.g. `articles:publish`, `users:manage`, `payroll:manage`).
- `resource`: Target entity ID and collection.
- `changes`: Before and after diff snapshot.

---

## 12. INCIDENT MANAGEMENT RUNBOOK & EMERGENCY RESPONSE

### 12.1 Severity Classification Matrix

| Severity Level | Definition | Response Time | Incident Lead |
| :---: | :--- | :---: | :--- |
| **SEV-1 (Critical Outage)** | Public portal (`apps/web`) down, database failure, critical security breach. | `< 15 Mins` | DevOps / Super Admin |
| **SEV-2 (Degraded System)** | Live scores delayed, Redis cache offline, social publishing webhook failure. | `< 30 Mins` | System Administrator |
| **SEV-3 (Editorial Blunder)** | High-profile fact error, copyright infringement notice, defaming claim. | `< 20 Mins` | Chief Editor |
| **SEV-4 (Minor Issue)** | Cosmetic UI glitch, broken internal link, transient non-blocking error. | `< 4 Hours` | Assigned Desk Lead |

### 12.2 Incident Response Drill (SEV-1 & SEV-2)
1. **Identify & Triage:** Identify failure mode via `/admin/system` or monitoring alerts.
2. **War Room Activation:** Lead engineer initiates incident channel and alerts executive management.
3. **Containment:** If database compromised, activate read-only mode and switch to static maintenance page via Cloudflare.
4. **Remediation & Failover:** Restart unhealthy microservice, switch to backup MongoDB replica, or invalidate corrupted Redis keys.
5. **Verification:** Validate service health across public endpoints (`/api/health`).
6. **Post-Mortem:** Complete mandatory Incident Post-Mortem within 24 hours detailing root cause, timeline, impact, and preventive action items.

---

## 13. STANDARD OPERATING PROCEDURES (SOPS) & CHECKLISTS LIBRARY

### SOP-01: Breaking News Wire Verification & Publish SOP
- **Purpose:** Publish urgent sports developments rapidly while maintaining 100% verification.
- **Workflow:**
  1. Receive breaking tip via wire, official club handle, or Tier-2 reporter.
  2. Apply Sourcing Pyramid. Check official club portals and independent corroborating reports.
  3. Classify breaking status (🔴 Unverified, 🟠 Developing, 🟡 Reported, 🟢 Confirmed).
  4. Draft article in `/admin/news/new` using the Breaking News Template (Headline + 3-Sentence Lead + Deal Context + Source Attribution).
  5. Upload 1200px+ high-res image with dark gradient overlay and descriptive alt text.
  6. Reviewing Editor verifies facts, approves piece, and sets status to `PUBLISHED`.
  7. Enqueue breaking social wire posts (X Alert, Facebook context post, Instagram graphic, WhatsApp alert).

### SOP-02: Live Matchday Multi-Platform Coverage SOP
- **Purpose:** Execute high-impact real-time coverage of major football derbies and tournament finals.
- **Workflow:**
  1. **T-60 Mins:** Confirm starting lineups in Match Center. Post Starting XI graphic and debate prompt.
  2. **T-0 Mins:** Emit Kickoff event in live commentary desk.
  3. **In-Play Goals:** Immediately post goal alert graphic (Scorer, minute, score). Update live score in Match Center.
  4. **Half-Time:** Post Half-Time Score Card + 2-sentence tactical summary.
  5. **Full-Time:** Emit Full-Time event. Post final score graphic + Player of the Match spotlight within 3 minutes.
  6. **T+30 Mins:** Publish comprehensive Match Report with verified quotes and analytical statistics.
  7. **T+12 Hours:** Publish in-depth tactical analysis thread and video breakdown.

### SOP-03: Daily 5 PM Stand-Up & Staff Report Audit SOP
- **Purpose:** Ensure newsroom accountability, continuous learning, and editorial consistency.
- **Workflow:**
  1. **4:45 PM WAT:** All newsroom staff submit Daily Content Reports via `/admin/portal`.
  2. **4:50 PM WAT:** Reviewing editors audit submitted URLs for accuracy, SEO compliance, and branding.
  3. **5:00 PM WAT:** Stand-up commences on Google Meet. Moderator conducts roll-call.
  4. **5:05 PM WAT:** Each staff member presents daily progress (Studied, Created, Published, Challenges).
  5. **5:15 PM WAT:** Chief Editor conducts constructive feedback review of best and worst content of the day.
  6. **5:25 PM WAT:** Tomorrow's assignments confirmed. Stand-up concludes promptly at 5:30 PM WAT.

### SOP-04: Editorial Correction & Errata SOP
- **Purpose:** Handle factual errors transparently and ethically.
- **Workflow:**
  1. Error identified by reader, editor, or subject.
  2. Reviewing Editor verifies the true factual situation against official records.
  3. Edit the live article immediately.
  4. Append standard Errata Notice with exact UTC timestamp and explanation of corrected facts.
  5. If the error was shared on social channels, post a clear, transparent correction reply.
  6. Log error in the newsroom error registry for training review during the next 5 PM stand-up.

### SOP-05: Staff Onboarding, Evaluation & Tier Certification SOP
- **Purpose:** Transition new hires into productive, certified sports media professionals.
- **Workflow:**
  1. Manager creates employee profile in `/admin/employees` and assigns initial `staff` role.
  2. System initiates 30-Day Academy curriculum in `/admin/portal`.
  3. Employee assigned designated desk mentor for Week 1 (100% supervision).
  4. Daily reports scored on 100-point rubric.
  5. On Day 30, employee completes practical examination (live breaking news simulation + 1,500-word tactical deep dive).
  6. Manager reviews cumulative score and assigns Certification Tier (Advanced, Professional, Junior, Retraining).

### SOP-06: Direct Sponsorship Client Onboarding & Reporting SOP
- **Purpose:** Manage commercial partner relationships and deliver verified sponsor reporting.
- **Workflow:**
  1. Commercial team finalizes brand agreement and enters contract details in `/admin/sponsorships`.
  2. Creative assets uploaded and verified for brand guidelines and technical dimensions.
  3. Ad campaign scheduled with active start and end dates.
  4. System tags sponsored content with mandatory `Sponsored` badges and `rel="sponsored"` outbound attributes.
  5. At campaign conclusion, export verified Advertiser Performance Report (`/admin/advertisers`) containing total impressions, clicks, CTR, and audience reach.

### SOP-07: Emergency Cache Purge & Database Failover SOP
- **Purpose:** Restore normal operations during severe cache corruption or primary database strain.
- **Workflow:**
  1. Confirm elevated error rates or stale data anomalies on `/admin/system`.
  2. To invalidate corrupt Redis keys: Execute targeted pattern purge (e.g. `match:live:*` or `news:article:*`).
  3. If MongoDB replica node unseated: Inspect connection pool diagnostics. Initiate failover to secondary replica.
  4. Verify upstream response latency drops below 200ms.
  5. File technical incident post-mortem with root cause analysis within 24 hours.

---

_GoalMills Sports Media Group © 2026. All rights reserved. Enterprise Operations Division._
