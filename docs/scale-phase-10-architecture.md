# GOALMILLS SCALE & REVENUE PROGRAM — PHASE 10 ARCHITECTURE
## CDN / Media Optimization, Fan Pass Subscriptions & Advertiser Reporting

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

### 1. 10A: CDN & Media Delivery Subsystem

1. **Format Negotiation & Compression Pipeline**:
   - High-resolution sports imagery is automatically served as **AVIF** for modern browsers, fallback to **WebP**, and fallback to optimized JPEG.
   - Dynamic query parameters (`?w=800&q=80&format=webp`) provide pixel-density adjustments for retina displays and mobile phones.
2. **Edge Cache-Control Headers**:
   - Static media assets: `Cache-Control: public, max-age=31536000, immutable`
   - Real-time API endpoints: `Cache-Control: public, s-maxage=30, stale-while-revalidate=60`
   - RSS & News sitemaps: `Cache-Control: public, s-maxage=600, stale-while-revalidate=1200`

---

### 2. 10B: Billing & Fan Pass Subscription Subsystem

1. **Subscription Tiers & Entitlements**:
   - `free`: Standard tier with programmatic sports ads and standard news wire.
   - `fan_pass` ($4.99/mo): Ad-free experience, high-bitrate video clips, and dark mode badges.
   - `vip_pass` ($9.99/mo): All Fan Pass features + full historical warehouse H2H exports, tactical match insights, and subscriber-only newsletter digests.
   - `sponsor_pro` ($49.99/mo): Brand dashboard access, real-time impression telemetry, and self-serve ad placement.
2. **Stripe Webhook Lifecycle**:
   - `checkout.session.completed`: Instantly provisions tenant subscription record and grants entitlements.
   - `customer.subscription.updated`: Syncs tier changes, billing dates, and payment status.
   - `customer.subscription.deleted`: Gracefully revokes premium entitlements upon period expiration.
3. **Paywall Component (`<PremiumGate />`)**:
   - Wraps sensitive sports analytics and video replays, prompting users with the `<FanPassPricingModal />` if active subscription is missing.

---

### 3. 10C: Advertiser Proof-of-Performance & Reporting Subsystem

1. **Certified Viewability Audit**:
   - Real-time aggregation of Phase 2 viewability beacons and Phase 7 stream events (`ad_impression`, `ad_click`).
   - Calculation of effective CPM ($eCPM = \frac{\text{Spend}}{\text{Impressions}} \times 1000$) and Click-Through Rate ($CTR = \frac{\text{Clicks}}{\text{Impressions}} \times 100\%$).
2. **Cryptographic Proof-of-Performance Certificate**:
   - Generates SHA-256 integrity hash across campaign delivery numbers, guaranteeing non-tampered audience delivery for brand agencies and audit compliance.
3. **Automated Exports**:
   - Generates structured CSV and printable PDF proof-of-performance certificates for advertiser reconciliation.
