# GOALMILLS SCALE & REVENUE PROGRAM — PHASE 3 PLAN
## Enterprise Newsletter Platform SaaS

### 1. Executive Summary
Phase 3 evolves GoalMills' newsletter capabilities from standard daily dispatches into a full-featured, multi-tenant Newsletter SaaS platform. It introduces dynamic audience segmentation, subscriber list partitioning, reusable structured email templates, batch job control (pause, resume, retry), subscriber self-service preference hubs, and public newsletter archives.

---

### 2. Architecture & Scope

```text
┌────────────────────────────────────────────────────────────┐
│                    GOALMILLS NEWSLETTER SAAS               │
├────────────────────────────────────────────────────────────┤
│ 1. LISTS & SEGMENTS: Static lists and rule-based segments  │
│ 2. TEMPLATES: Layout designer for digests & flash alerts  │
│ 3. CAMPAIGNS: Scheduled broadcasts with target filtering   │
│ 4. SEND JOBS: Batch execution via services/mailer (Go)     │
│ 5. PREFERENCES: Self-service topic & frequency hub        │
│ 6. PUBLIC ARCHIVE: SEO-indexed directory of past editions  │
│ 7. DELIVERABILITY: Automated bounce & suppression gates    │
└────────────────────────────────────────────────────────────┘
```

---

### 3. Deliverables & Milestones

- **Milestone 1**: Shared Type System (`@goalmills/types`) & Schema Expansion (`NewsletterList`, `NewsletterSegment`, `NewsletterTemplate`, `SendJob`).
- **Milestone 2**: Admin SaaS Control Plane (`/admin/newsletters`) with CRUD APIs, template preview, and batch job controls.
- **Milestone 3**: Web Subscriber Portal (`/newsletter/preferences`, `/newsletter/archive`, and enhanced double opt-in).
- **Milestone 4**: Mobile Preference Integration in `apps/mobiles`.
- **Milestone 5**: Full Integration Testing, Typechecks, and Deliverability Validation.
