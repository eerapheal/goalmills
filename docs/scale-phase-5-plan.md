# GOALMILLS SCALE & REVENUE PROGRAM — PHASE 5 PLAN
## Recommendation Engine

### 1. Executive Summary
Phase 5 introduces an enterprise, multi-platform **Recommendation Engine** for the GoalMills sports publishing network. It powers intelligent content discovery across Web, Admin, Mobile, and Newsletter channels, delivering deterministic and personalized recommendations for articles, matches, teams, leagues, sports, and video highlights while maintaining strict privacy standards and multi-tenant isolation.

---

### 2. Core Architecture & Scope

```text
┌────────────────────────────────────────────────────────────────────────┐
│             GOALMILLS PHASE 5: RECOMMENDATION ENGINE                   │
├────────────────────────────────────────────────────────────────────────┤
│ 1. DETERMINISTIC SCORING: Sport, league, team, taxonomy & recency      │
│ 2. PERSONALIZED SIGNALS: Reading history & team/sport affinity graphs  │
│ 3. MULTI-ENTITY RECOMMENDATIONS: Articles, matches, videos, topics     │
│ 4. CROSS-PLATFORM CONSUMERS: Web, Mobile app, Admin studio, Mailer     │
│ 5. TELEMETRY & FEEDBACK: CTR, engagement lift & conversion tracking    │
│ 6. ADMIN TUNING STUDIO: Real-time algorithm weights & candidate tester │
│ 7. MULTI-TIER CACHING: Redis candidate caching with sub-10ms response  │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 3. Key Milestones & Deliverables

#### Milestone 1: Shared Domain Models & Types (`@goalmills/types`)
- **`RecommendationType`**: `'article' | 'match' | 'team' | 'league' | 'sport' | 'video' | 'newsletter' | 'multi'`.
- **`RecommendationContext`**: `'homepage' | 'article_detail' | 'match_detail' | 'sports_hub' | 'mobile_feed' | 'newsletter'`.
- **`RecommendationCandidate`**: Scored entity payload with score, reason badge (`Trending`, `Because you follow X`, `Related Analysis`), and target link.
- **`RecommendationAlgorithmWeights`**: Tenant-tunable weights for sport match, team overlap, category match, recency decay, and personalization boost.
- **`RecommendationMetrics`**: CTR, impressions, clicks, and conversion rate telemetry.

#### Milestone 2: Core Hybrid Recommendation Service
- **`RecommendationService` (`apps/web/src/lib/recommendations` & `apps/admin/src/lib/recommendations`)**:
  - **Phase 5.1 Deterministic Engine**: Content-based filtering on sport, competition, team entities, and exponential recency decay.
  - **Phase 5.2 Personalization Engine**: Blends visitor reading history and favorite team signals from Phase 4 audience profiles without invasive tracking.
  - **Phase 5.3 Multi-Entity Resolver**: Resolves related matches from live sports API, video highlights, and breaking news in parallel.
  - **Phase 5.4 High-Performance Caching**: Redis multi-tier caching with single-flight request coalescing for candidate generation.

#### Milestone 3: Cross-Platform Recommendation APIs (`apps/web`)
- `GET /api/recommendations`: Multi-context recommendation endpoint for web and mobile clients.
- `POST /api/recommendations/feedback`: Recommendation impression and click CTR telemetry.
- `GET /api/admin/recommendations/config`: Fetch tenant algorithm configuration.
- `PUT /api/admin/recommendations/config`: Update algorithm weights and decay factors.
- `GET /api/admin/recommendations/preview`: Live candidate scoring preview for editorial testing.

#### Milestone 4: Web Reader Experience (`apps/web`)
- `<SmartRelatedContent />`: Interactive multi-entity widget on article detail pages (`/news/[id]`).
- `<MatchRelatedIntel />`: Dynamic article and highlight recommendations on match detail pages.
- `<PersonalizedForYouFeed />`: "For You" personalized section on the homepage.

#### Milestone 5: Mobile App Experience (`apps/mobiles`)
- `<RecommendedFeed />`: Native recommendation carousel and list component.
- Integration into Mobile Home Tab, `FootballScreen`, `CricketScreen`, and `BasketballScreen`.
- `recommendationService.ts` in `apps/mobiles/src/services/` with local fallback to `newsHistoryUtil`.

#### Milestone 6: Newsletter & Mailer Integration (`services/mailer`)
- Algorithm-curated "Recommended For You" block in automated daily digests and match roundups.

#### Milestone 7: Admin Control & Observability Suite (`apps/admin`)
- Dedicated `/admin/recommendations` dashboard:
  - Algorithm weight sliders (Recency decay, Sport similarity, Team affinity, Trending weight).
  - Live Recommendation Candidate Tester & Inspector.
  - Recommendation CTR and engagement lift performance charts.
- Integrated into `AdminNavBar.tsx`.

#### Milestone 8: Verification & Documentation
- Unit tests for scoring algorithms, decay formulas, and candidate deduplication.
- API integration tests across all contexts.
- Typechecks and production builds across all packages.
- `docs/scale-phase-5-report.md` finalization.
