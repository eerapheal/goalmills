# GoalMills — Production Security & Threat Model Audit

**Date:** 2026-08-29  
**Scope:** `apps/web`, `apps/admin`, `apps/mobiles`, `services/mailer`  
**Security Status:** HARDENED  

---

## 1. Authentication & Session Security
- **JWT Signature Enforced:** Admin authentication uses cryptographically signed JWT tokens with server-side expiry validation.
- **Cookie Flags:** `HttpOnly: true`, `SameSite: Lax`, and `Secure: true` in production environments.
- **Client Shielding:** Sensitive API keys (`FOOTBALL_API_KEY`, `CRICKET_API_KEY`, `BASKETBALL_API_KEY`, `MONGODB_URI`, `REDIS_URL`) are strictly restricted to server-side route handlers.

---

## 2. Server-Side RBAC Enforcement Matrix

Every administrative route validates user permissions server-side using `requirePermission()` from `apps/admin/src/lib/serverAuth.ts`:

| Permission Key | Contributor | Staff | Editor | Manager | Super-Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `articles:draft` | **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW** |
| `articles:publish` | DENY | DENY | **ALLOW** | **ALLOW** | **ALLOW** |
| `articles:delete` | DENY | DENY | DENY | **ALLOW** | **ALLOW** |
| `sponsorships:manage` | DENY | DENY | DENY | **ALLOW** | **ALLOW** |
| `content:trash` | DENY | DENY | DENY | **ALLOW** | **ALLOW** |
| `content:purge` | DENY | DENY | DENY | DENY | **ALLOW** |
| `system:settings` | DENY | DENY | DENY | DENY | **ALLOW** |

---

## 3. Vulnerability Defense Verification

### 3.1 NoSQL Injection & Query Sanitization
- MongoDB ObjectId params are strictly validated using `isValidObjectId()` (`/^[0-9a-fA-F]{24}$/`).
- Arbitrary `$where`, `$regex`, `$gt`, and `$ne` user payload injections are blocked.

### 3.2 Cross-Site Scripting (XSS)
- Rich text content rendered via sanitize pipelines.
- React DOM default escaping active for all user-supplied inputs, comments, and sponsorship metadata.

### 3.3 SSRF Mitigation
- Outbound sports proxies only communicate with whitelisted provider base URLs (`allsportsapi.com`, `cricbuzz-cricket.p.rapidapi.com`).
- Internal network addresses (`127.0.0.1`, `169.254.169.254`, `10.0.0.0/8`) are blocked from user redirection.

### 3.4 Public Telemetry Anti-Abuse
- `POST /api/sponsorships/[id]/track` enforces:
  - 20 requests / minute / IP rate limit.
  - 10-second duplicate impression suppression.
  - Active, non-deleted campaign state gate.
