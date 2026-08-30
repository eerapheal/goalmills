# GOALMILLS SCALE & REVENUE PROGRAM — PHASE 3 ARCHITECTURE
## Newsletter SaaS Architecture & Deliverability Specification

```text
                               ┌────────────────────────┐
                               │  GoalMills Multi-Tenant│
                               │   Newsletter Platform   │
                               └───────────┬────────────┘
                                           │
             ┌─────────────────────────────┼─────────────────────────────┐
             ▼                             ▼                             ▼
   ┌───────────────────┐         ┌───────────────────┐         ┌───────────────────┐
   │    apps/admin     │         │     apps/web      │         │   apps/mobiles    │
   ├───────────────────┤         ├───────────────────┤         ├───────────────────┤
   │ • Campaign Hub    │         │ • Self-Service Hub│         │ • Mobile Opt-Ins  │
   │ • List Management │         │ • Double Opt-In   │         │ • Topic Selection │
   │ • Template Studio │         │ • Public Archive  │         │ • Push/Email Sync │
   │ • Deliverability  │         │ • RFC 8058 Unsub  │         │                   │
   └─────────┬─────────┘         └─────────┬─────────┘         └─────────┬─────────┘
             │                             │                             │
             └─────────────────────────────┼─────────────────────────────┘
                                           │
                                           ▼
                               ┌────────────────────────┐
                               │      API Router &      │
                               │   Tenant Context Gate  │
                               └───────────┬────────────┘
                                           │
                      ┌────────────────────┴────────────────────┐
                      ▼                                         ▼
            ┌───────────────────┐                     ┌───────────────────┐
            │  MongoDB Storage  │                     │   Upstash Redis   │
            ├───────────────────┤                     ├───────────────────┤
            │ • Subscribers     │                     │ • Rate Limiting   │
            │ • Lists & Segments│                     │ • Campaign Cache  │
            │ • Templates       │                     │ • Single-Flight   │
            │ • SendJobs        │                     │ • Deduplication   │
            │ • Suppressions    │                     │                   │
            └─────────┬─────────┘                     └───────────────────┘
                      │
                      ▼
         ┌─────────────────────────┐
         │ services/mailer (Go API)│
         ├─────────────────────────┤
         │ • Priority Domain Queue │
         │ • SPF / DKIM / DMARC    │
         │ • Delivery Webhooks     │
         └─────────────────────────┘
```

---

### 1. Data Models & Entity Relationships

1. **`NewsletterSubscriber`**:
   - `email`: Plain text user email.
   - `emailNormalized`: Lowercased, trimmed unique key with compound tenant index `{ tenantSlug: 1, emailNormalized: 1 }`.
   - `status`: `'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'ENGAGED' | 'INACTIVE' | 'SOFT_BOUNCE' | 'HARD_BOUNCE' | 'COMPLAINT' | 'SUPPRESSED' | 'UNSUBSCRIBED'`.
   - `listIds`: Array of string list identifiers for multi-list subscription.
   - `preferences`: `{ sports: string[]; frequency: string; breakingAlerts: boolean; transfersOnly: boolean; isPaused: boolean; pausedUntil?: Date }`.
   - `emailHealthScore` (0-100), `engagementScore` (0-100), `reputationRiskScore` (0-100).
   - `unsubscribeToken`: RFC 8058 compliant HMAC token.

2. **`NewsletterList`**:
   - `name`, `slug`, `description`, `isDefault`, `subscriberCount`, `tenantId`, `tenantSlug`.

3. **`NewsletterSegment`**:
   - `name`, `slug`, `rules` (field, operator, value), `matchType` ('all' | 'any'), `estimatedSubscribers`.

4. **`NewsletterTemplate`**:
   - `name`, `slug`, `category` (`daily_digest`, `breaking_news`, `weekend_preview`, `tactical_debrief`, `transfer_radar`), `sections`, `accentColor`.

5. **`NewsletterSendJob`**:
   - `campaignId`, `status` (`pending`, `running`, `paused`, `completed`, `failed`), `totalRecipients`, `processedRecipients`, `successCount`, `failedCount`, `batchSize`.

---

### 2. Deliverability & Anti-Abuse Controls

- **Pre-Flight Deliverability Gate**:
  - Validates recipient list against global & tenant-level `EmailSuppression` collections before dispatch.
  - Excludes hard bounces, past spam complaints, unsubscribed addresses, and addresses with health score < 40.
- **Traffic Shaping**:
  - Go mailer throttles delivery to major inbox providers (Gmail, Outlook, Yahoo) using distinct domain rate limits.
- **One-Click Unsubscribe (RFC 8058)**:
  - Generates `List-Unsubscribe: <https://goalmills.com/api/newsletter/unsubscribe?token=...>` and `List-Unsubscribe-Post: List-Unsubscribe=One-Click` headers on all outbound messages.
