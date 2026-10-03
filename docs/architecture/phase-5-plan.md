# GoalMills Platform — Phase 5 Implementation Plan

**Document Version:** 1.0.0  
**Phase:** Phase 5 — Social Engine Contract Formalization  
**Author:** Chief Technology Officer & Principal Software Architect, GoalMills  
**Date:** October 2026  
**Status:** PROPOSED & PENDING USER APPROVAL  

---

## 1. Executive Summary & Objective

In accordance with Blueprint Section 5.2, the **Social Engine Service (`services/social-engine`)** remains a **100% independent Node.js microservice**. Native image rendering (`sharp`, canvas) and intensive third-party platform API handshakes across **Twitter, Telegram, WhatsApp, Facebook, YouTube, and LinkedIn** must remain decoupled from consumer-facing web traffic.

**Phase 5** formalizes the architectural boundary and contract interfaces between the GoalMills Core application and the Social Engine:

```text
┌─────────────────────────────────┐                 ┌─────────────────────────────────┐
│       GoalMills Admin Hub       │                 │     Social Engine Service       │
│   (@goalmills/core-content)     │                 │    (services/social-engine)     │
└────────────────┬────────────────┘                 └────────────────┬────────────────┘
                 │                                                   │
                 │ 1. GET /api/status (Health & Platform Status)     │
                 ├──────────────────────────────────────────────────▶│
                 │                                                   │
                 │ 2. POST /api/dispatch (Multi-platform Publish)    │
                 ├──────────────────────────────────────────────────▶│
                 │                                                   │
                 │ 3. 200 OK (Platform Post IDs & Image CDN URLs)    │
                 │◀──────────────────────────────────────────────────┤
                 │                                                   │
                 │ 4. Independent Token Vaults & Cron Schedulers     │
                 │    (Retained 100% within Social Engine)           │
```

---

## 2. Phase 5 Work Breakdown Structure (WBS)

### Step 5.1: Type-Safe Client SDK (`SocialEngineClient`)
- Implement `SocialEngineClient` in `@goalmills/contracts`:
  - `getStatus(): Promise<SocialEngineStatus>`
  - `publish(request: SocialPublishRequest): Promise<SocialPublishResponse>`
  - `generateGraphic(options: SocialGraphicOptions): Promise<{ imageUrl: string }>`
  - Configurable timeouts, circuit breaker, and automatic retry on network drops.

### Step 5.2: Content Domain Social Publisher (`@goalmills/core-content`)
- Implement `SocialPublisher` in `core/content/src/distribution/socialPublisher.ts`:
  - Platform-specific message formatting:
    - Twitter/X: 280 character limit with hashtag trimming.
    - Telegram & WhatsApp: Markdown formatting and deep links.
    - Facebook & LinkedIn: Long-form summary and thumbnail previews.
  - Integration with `Article` editorial workflow (`published` state triggers).

### Step 5.3: Application Layer Shimming & Admin Hub Integration
- Update `apps/admin/src/lib/distribution/socialEngineClient.ts` to re-export and consume `@goalmills/contracts`.
- Preserve existing Admin Content Distribution Studio UI (`/admin/distribution`).

### Step 5.4: Microservice Boundary Verification (`services/social-engine`)
- Validate payload contract alignment between `services/social-engine/src/index.ts` and `@goalmills/contracts`.
- Verify token vault isolation: all social API keys (Twitter OAuth, Telegram Bot Token, Meta Graph API) remain strictly inside the microservice container.

### Step 5.5: Comprehensive Quality & Regression Verification
- Run static typechecks across all 20 workspace projects (`web`, `admin`, `core/*`, `infrastructure/*`, `contracts`).
- Execute existing unit tests.
- Verify zero regressions.
