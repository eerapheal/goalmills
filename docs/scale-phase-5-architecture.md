# GOALMILLS SCALE & REVENUE PROGRAM — PHASE 5 ARCHITECTURE
## Recommendation Engine Specification

```text
                               ┌────────────────────────┐
                               │  GoalMills Multi-Tenant│
                               │  Recommendation Engine │
                               └───────────┬────────────┘
                                           │
             ┌─────────────────────────────┼─────────────────────────────┐
             ▼                             ▼                             ▼
   ┌───────────────────┐         ┌───────────────────┐         ┌───────────────────┐
   │    apps/web       │         │   apps/mobiles    │         │    apps/admin     │
   ├───────────────────┤         ├───────────────────┤         ├───────────────────┤
   │ • SmartRelated    │         │ • RecommendedFeed │         │ • Algorithm Studio│
   │ • MatchIntel      │         │ • Affinity Engine │         │ • Weights Sliders │
   │ • ForYouFeed      │         │ • Native Carousel │         │ • CTR Telemetry   │
   │ • Feedback Beacons│         │ • Offline Fallback│         │ • Live Inspector  │
   └─────────┬─────────┘         └─────────┬─────────┘         └─────────┬─────────┘
             │                             │                             │
             └─────────────────────────────┼─────────────────────────────┘
                                           │
                                           ▼
                               ┌────────────────────────┐
                               │      API Router &      │
                               │  Recommendation Service│
                               └───────────┬────────────┘
                                           │
                      ┌────────────────────┴────────────────────┐
                      ▼                                         ▼
            ┌───────────────────┐                     ┌───────────────────┐
            │   Upstash Redis   │                     │  MongoDB Storage  │
            ├───────────────────┤                     ├───────────────────┤
            │ • Candidate Cache │                     │ • News & Videos   │
            │   (rec:det:*)     │                     │ • Sports Entities │
            │ • Trending Boost  │                     │ • AnalyticsEvents │
            │ • CTR Feedback Set│                     │ • Recommendation  │
            │ • Single-Flight   │                     │   Configs         │
            └───────────────────┘                     └───────────────────┘
```

---

### 1. Recommendation Pipeline Architecture

```text
Incoming Request (User/Session/Entity Context)
      │
      ▼
1. CANDIDATE RETRIEVAL (Multi-Tier)
   ├── Articles (News Collection)
   ├── Matches (Live Sports Normalizer & Redis)
   ├── Video Highlights (Videos Collection)
   └── Newsletters (Newsletter Lists & Campaigns)
      │
      ▼
2. DETERMINISTIC SCORING ENGINE (Phase 5.1)
   ├── Sport Match (+30 pts)
   ├── Competition Match (+25 pts)
   ├── Team Overlap (+35 pts)
   ├── Category Match (+15 pts)
   └── Exponential Recency Decay: Score × e^(-λ × hoursOld)
      │
      ▼
3. PERSONALIZED SIGNAL BOOST (Phase 5.2)
   ├── User Favorite Teams (+20 pts)
   ├── Reading History Sport Frequency (+15 pts)
   └── Trending Popularity Multiplier (from Phase 4 Analytics)
      │
      ▼
4. DEDUPLICATION & DIVERSITY RERANKING
   ├── Exclude currently viewed entity
   ├── Enforce category diversity (max 3 from single sport)
   └── Assign Explanation Badges ("🔥 Trending", "⭐ Your Teams", "⚽ Related Intel")
      │
      ▼
5. REDIS CACHE STORAGE & FAST RESPONSE (< 10ms)
```

---

### 2. Candidate Representation (`RecommendationCandidate`)

```typescript
export interface RecommendationCandidate {
  id: string;
  type: 'article' | 'match' | 'video' | 'newsletter' | 'topic';
  title: string;
  slug: string;
  url: string;
  image?: string;
  sportSlug?: string;
  categorySlug?: string;
  teamSlug?: string;
  competitionSlug?: string;
  score: number;
  reasonBadge: string;
  algorithm: 'content_similarity' | 'trending' | 'collaborative_signal' | 'personalized_affinity';
  metadata?: Record<string, any>;
  publishedAt?: string;
}
```

---

### 3. Cross-Platform Consumer Integration

- **Web Portal (`apps/web`)**:
  - `<SmartRelatedContent />` below articles and match pages.
  - `<PersonalizedForYouFeed />` tab on the homepage.
  - Instant impression & click telemetry reporting via `/api/recommendations/feedback`.
- **Mobile Application (`apps/mobiles`)**:
  - `<RecommendedFeed />` native carousel on home screen and sports hubs (`FootballScreen`, `CricketScreen`, `BasketballScreen`).
  - Seamless offline fallback to cached team favorites and recently viewed articles (`newsHistoryUtil`).
- **Newsletter Engine (`services/mailer` / Newsletter Curator)**:
  - Algorithm-curated "Top Recommendations For You" blocks dynamically populated inside daily and weekly dispatches.
- **Admin Control Plane (`apps/admin`)**:
  - `/admin/recommendations` algorithm tuner with live candidate test sandbox.
