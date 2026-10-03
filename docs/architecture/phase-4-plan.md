# GoalMills Platform — Phase 4 Implementation Plan

**Document Version:** 1.0.0  
**Phase:** Phase 4 — Go Mailer Service Contract Formalization  
**Author:** Chief Technology Officer & Principal Software Architect, GoalMills  
**Date:** October 2026  
**Status:** PROPOSED & PENDING USER APPROVAL  

---

## 1. Executive Summary & Objective

In accordance with Blueprint Section 5.1, the **Go Mailer Service (`services/mailer`)** remains a **100% independent microservice** leveraging Go 1.22's lightweight goroutines, 25-worker priority queues, and domain connection rate shapers.

**Phase 4** formalizes the architectural boundary and HTTP/Webhook contracts between the GoalMills Core application and the Go Mailer microservice without introducing shared databases or coupling:

```text
┌─────────────────────────────────┐                 ┌─────────────────────────────────┐
│     GoalMills Core / Apps       │                 │     Go Mailer Microservice      │
│  (@goalmills/core-audience)     │                 │        (services/mailer)        │
└────────────────┬────────────────┘                 └────────────────┬────────────────┘
                 │                                                   │
                 │ 1. POST /api/dispatch (Strongly-typed DTO)        │
                 ├──────────────────────────────────────────────────▶│
                 │ 2. HTTP 202 Accepted (Job ID & Queued Count)      │
                 │◀──────────────────────────────────────────────────┤
                 │                                                   │
                 │ 3. POST /api/webhooks/mailer (Signed Event Feed)  │
                 │◀──────────────────────────────────────────────────┤
                 │ 4. Update Subscriber State & Deliverability Gate  │
                 │                                                   │
```

---

## 2. Phase 4 Work Breakdown Structure (WBS)

### Step 4.1: Client SDK Integration (`MailerServiceClient`)
- Implement a type-safe client SDK in `@goalmills/core-audience` (or `@goalmills/contracts`):
  - `dispatch(request: MailerDispatchRequest): Promise<MailerDispatchResponse>`
  - `checkHealth(): Promise<MailerHealthStatus>`
  - Configurable timeouts, circuit breaker, and automatic retry on 5xx errors.

### Step 4.2: Go Mailer Struct & Contract Parity (`services/mailer`)
- Verify parity between Go `DispatchRequest` / `DispatchResponse` structs and TypeScript `@goalmills/contracts`.
- Verify Go build and test status (`go test ./...` in `services/mailer`).
- Ensure Go cron triggers (`daily`, `weekly`, `monthly`) securely authenticate webhook calls to the core web/admin endpoints.

### Step 4.3: Campaign Dispatch Orchestration (`@goalmills/core-audience`)
- Implement `CampaignDispatcher` in `core/audience/src/dispatch/campaignDispatcher.ts`:
  - Enforce Deliverability Health Gates (filter `SUPPRESSED`, `HARD_BOUNCE`, low reputation scores).
  - Inject unsubscribe tokens and recipient IDs.
  - Call `MailerServiceClient.dispatch()`.

### Step 4.4: Webhook Ingestion & State Machine Updates
- Standardize the `POST /api/webhooks/mailer` handler in `apps/web` and `apps/admin`:
  - Validate HMAC-SHA256 signature / shared webhook secret.
  - Automatically update `NewsletterSubscriber` status on bounce/complaint events:
    - `bounce_hard` ➔ Status: `HARD_BOUNCE`, increase bounce counter.
    - `complaint` ➔ Status: `COMPLAINT`, suppress email.
    - `delivered` / `opened` / `clicked` ➔ Increment engagement score and update `lastOpenedAt` / `lastClickedAt`.

### Step 4.5: Quality & Regression Verification
- Run typechecks across all 20 workspace packages (`web`, `admin`, `core/*`, `infrastructure/*`, `contracts`).
- Execute unit tests for campaign dispatching and webhook ingestion.
- Verify zero regressions.
