# GoalMills — Production Security Threat Model & Risk Matrix

## 1. Overview & Scope

This document evaluates the security threat surface of GoalMills across all tiers:
- Public Consumer Web Application (`apps/web`)
- Administrative Hub & CMS (`apps/admin`)
- Mobile Client (`apps/mobiles`)
- Background Microservices (`services/mailer`)
- Database & Cache (`MongoDB Atlas`, `Redis Cloud`)

---

## 2. Threat Vector Matrix

| # | Attack Vector | Severity | Likelihood | Impact | Current Mitigation Status | Action Item / Protection Implemented |
| :-: | :--- | :-: | :-: | :-: | :--- | :--- |
| **1** | **Account Takeover & Credential Stuffing** | `HIGH` | `MEDIUM` | `CRITICAL` | **MITIGATED** | `apps/admin` enforces bcrypt salt rounds, NextAuth JWT sessions with HttpOnly/Secure cookies, and strict login rate limits. |
| **2** | **Privilege Escalation (RBAC Bypass)** | `CRITICAL` | `LOW` | `CRITICAL` | **MITIGATED** | Server-side role enforcement via `serverAuth.ts` and `rbac.ts`. Web portal is 100% unauthenticated with all user models removed. |
| **3** | **Exposed Secrets & API Keys** | `CRITICAL` | `LOW` | `CRITICAL` | **MITIGATED** | `.env` files ignored by Git. Private API keys (`MONGODB_URL`, `REDIS_PASSWORD`, `SMTP_PASSWORD`, `CRON_SECRET`) are server-only. |
| **4** | **Cross-Site Scripting (XSS)** | `HIGH` | `MEDIUM` | `HIGH` | **MITIGATED** | Next.js automatic React escaping, Content-Security-Policy (CSP) headers enabled in middleware `proxy.ts`, sanitization of editorial HTML content. |
| **5** | **Cross-Site Request Forgery (CSRF)** | `HIGH` | `LOW` | `HIGH` | **MITIGATED** | NextAuth anti-CSRF token cookies, `SameSite=Lax` / `Strict` flags, and origin verification on mutation endpoints. |
| **6** | **Server-Side Request Forgery (SSRF)** | `HIGH` | `LOW` | `HIGH` | **MITIGATED** | Sports proxies strictly validate against upstream domain allowlists (`apiv2.allsportsapi.com`, `v3.football.api-sports.io`). User-controlled URL fetches are blocked. |
| **7** | **NoSQL / Mongo Operator Injection** | `HIGH` | `MEDIUM` | `HIGH` | **MITIGATED** | Sanitized query construction with parameter type coercion. Strict regex escaping and validation against MongoDB operator injection (`$gt`, `$where`). |
| **8** | **Sports Provider API Exhaustion / Quota Abuse** | `MEDIUM` | `HIGH` | `HIGH` | **MITIGATED** | Centralized Redis and In-Memory caching tiers with rate-limiting fetch spacers (250ms gap), preventing raw client requests from hitting providers. |
| **9** | **Unauthorized Admin Endpoint Access** | `CRITICAL` | `LOW` | `CRITICAL` | **MITIGATED** | All admin API endpoints and views (`apps/admin`) verify `session.user.role` on every request. `apps/web` middleware redirects `/admin/*` to admin host. |
| **10**| **Spam / Malicious Newsletter Subscription** | `MEDIUM` | `HIGH` | `MEDIUM` | **MITIGATED** | HealthGate validator checking syntax, MX DNS records, disposable email blocklist, and token-verified double opt-in. |
| **11**| **Email Reputation Poisoning & Spamtraps** | `HIGH` | `MEDIUM` | `HIGH` | **MITIGATED** | Hard and soft bounce classification in Go Mailer; automatic suppression listing (`SuppressionEntry`) before subsequent campaigns. |
| **12**| **Redis Cache Exposure** | `HIGH` | `LOW` | `HIGH` | **MITIGATED** | Redis connections support TLS (`rediss://`), strong authentication passwords, and fallback to in-memory caching if unreachable. |
| **13**| **Dangerous File Uploads** | `MEDIUM` | `LOW` | `HIGH` | **MITIGATED** | Cloudinary cloud-storage isolation with server-signed tokens, MIME type validation, and file-size enforcement. |
| **14**| **DDoS / HTTP Flood** | `HIGH` | `MEDIUM` | `HIGH` | **MITIGATED** | Edge CDN caching for static and public assets, route-level rate limiting, and minimal JSON payloads. |
| **15**| **Sensitive Data Exposure in Error Responses** | `MEDIUM` | `MEDIUM` | `MEDIUM` | **MITIGATED** | Generic user-facing error messages (`500 Internal Error`), no raw stack traces or internal connection strings leaked in responses. |

---

## 3. Threat Mitigation Verification Matrix

```text
[ Incoming Request ]
        │
        ├── 1. Security Headers (HSTS, CSP, X-Content-Type-Options, Referrer-Policy)
        │
        ├── 2. CORS Policy Verification (Allowed Origins Only)
        │
        ├── 3. Rate Limiting Check (Redis / Token Bucket)
        │
        ├── 4. Authentication Check (NextAuth JWT for Admin / Public Access for Web)
        │
        ├── 5. Authorization & RBAC (Role Verification in Server Handlers)
        │
        ├── 6. Input Validation & Operator Sanitization
        │
        ▼
[ Core Handler Execution ]
```
