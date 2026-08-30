# GOALMILLS SCALE & REVENUE PROGRAM — PHASE 10 PLAN
## CDN & Media Optimization, Fan Pass Subscriptions & Advertiser Reporting

### 1. Executive Summary
Phase 10 represents the final revenue expansion and global media delivery tier of the GoalMills Scale Program. It executes three interconnected enterprise pillars:
1. **10A — Global CDN & Media Optimization**: High-performance responsive image transformations, WebP/AVIF conversions, edge caching headers, and resilient CDN abstractions.
2. **10B — Fan Pass & Tiered Subscriptions Platform**: Stripe-powered recurring subscription platform (`free`, `fan_pass`, `vip_pass`, `sponsor_pro`) unlocking ad-free browsing, deep warehouse intelligence exports, and exclusive match video recaps with automated paywall gates (`<PremiumGate />`).
3. **10C — Certified Advertiser Reporting & Proof-of-Performance**: Certified campaign audit certificates, viewability telemetry, effective CPM reporting, automated invoice settlement, and CSV/PDF export for brand sponsors.

---

### 2. Multi-Tier Architecture

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        PHASE 10 SCALE & REVENUE ENGINE                                │
├────────────────────────────┬────────────────────────────┬─────────────────────────────┤
│   10A: CDN & MEDIA OPT     │  10B: BILLING & FAN PASS   │ 10C: ADVERTISER REPORTING   │
├────────────────────────────┼────────────────────────────┼─────────────────────────────┤
│ • Responsive Image srcset  │ • Stripe Checkout & Portal │ • Proof-of-Performance Cert│
│ • WebP / AVIF Conversions  │ • Fan Pass Tiers (VIP/Pro) │ • Real-Time eCPM & CTR Audit│
│ • Edge Caching Headers     │ • Ad-Free Entitlement Gate │ • Viewability Verification  │
│ • Media CDN Abstraction    │ • Webhook Event Processor  │ • Multi-Format PDF/CSV Export│
└────────────────────────────┴────────────────────────────┴─────────────────────────────┘
```

---

### 3. Key Milestones & Platform Deliverables

#### Milestone 1: Shared Types & Contracts (`@goalmills/types`)
- **Subscription Types**: `SubscriptionTier` (`'free' | 'fan_pass' | 'vip_pass' | 'sponsor_pro'`), `SubscriptionPlan`, `UserSubscription`, `PaywallEntitlement`.
- **Media Optimization Types**: `ImageTransformOptions`, `OptimizedMediaResult`, `EdgeCachePolicy`.
- **Advertiser Reporting Types**: `AdvertiserReportSummary`, `CampaignProofOfPerformance`, `AdvertiserInvoice`, `ViewabilityMetrics`.

#### Milestone 2: Durable Database Models (`apps/web`, `apps/admin`)
- `Subscription.ts`: Indexed on `{ tenantSlug: 1, userId: 1, status: 1 }`, `{ stripeCustomerId: 1 }`.
- `AdvertiserReport.ts`: Indexed on `{ tenantSlug: 1, sponsorId: 1, period: 1 }`.

#### Milestone 3: 10A Media CDN & Optimization Utility (`apps/web`, `apps/admin`)
- `mediaOptimizer.ts`: Generates high-efficiency responsive image srcset URLs, WebP/AVIF parameters, and sets immutable asset headers (`Cache-Control: public, s-maxage=31536000, immutable`).
- `<OptimizedImage />`: Next.js & React picture element with automatic format negotiation and skeleton shimmer.

#### Milestone 4: 10B Billing & Fan Pass Engine (`apps/web`, `apps/admin`)
- `billingService.ts`:
  - `createCheckoutSession(userId, planId, tenantSlug)`
  - `createCustomerPortalSession(stripeCustomerId)`
  - `handleStripeWebhook(event)`: Processes `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
  - `checkEntitlement(userId, featureKey)`.
- `<FanPassPricingModal />` & `<PremiumGate />`: Client paywall components.
- Web APIs:
  - `POST /api/billing/checkout`
  - `POST /api/billing/portal`
  - `POST /api/webhooks/stripe`
  - `GET /api/billing/subscription`

#### Milestone 5: 10C Advertiser Reporting & Audit Service (`apps/web`, `apps/admin`)
- `advertiserReportingService.ts`:
  - Consolidates campaign telemetry (verified impressions, clicks, CTR, eCPM).
  - Generates verifiable Proof-of-Performance certificates with cryptographic hash signatures.
  - Prepares CSV / PDF audit exports.
- Web & Admin APIs:
  - `GET /api/admin/advertisers/report`
  - `GET /api/admin/advertisers/export`

#### Milestone 6: Mobile App Subscription & Media Parity (`apps/mobiles`)
- `goalmillsApi.getSubscriptionStatus()` and `goalmillsApi.getAvailablePlans()`.
- `<FanPassBanner />`: Mobile upgrade callout offering ad-free viewing and match replays.

#### Milestone 7: Admin Billing & Advertiser Reporting Studios (`apps/admin`)
- `/admin/billing`: Subscription MRR metrics, active subscriber counts, churn tracking, and customer management.
- `/admin/advertisers`: Certified Proof-of-Performance generator, live advertiser campaign dashboards, and export tools.
- Integrated into `AdminNavBar.tsx`.

#### Milestone 8: Automated Verification & Documentation
- Comprehensive Vitest unit tests for billing webhooks, media optimizer, and advertiser reporting.
- Monorepo typecheck clean (`pnpm turbo run typecheck`).
- Complete documentation in `docs/scale-phase-10-architecture.md` and `docs/scale-phase-10-report.md`.
