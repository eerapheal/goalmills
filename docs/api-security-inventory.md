# GoalMills — Master API Security Inventory & Classification

**Scope:** All API Route Handlers in `apps/web` (Port 3000) and `apps/admin` (Port 3001)  
**Date:** 2026-08-29  

---

## 1. Public Consumer Web API (`apps/web/src/app/api`)

| Method | Path | Access Tier | Auth Required? | Role Required | Input Validation | Rate Limiting | Caching Strategy | Data Store / Upstream |
| :--- | :--- | :--- | :---: | :--- | :---: | :---: | :--- | :--- |
| `GET` | `/api/football` | `PUBLIC` | No | None | Yes (`met`, query) | Upstream 250ms gap | Redis (15s–600s) | AllSportsAPI / API-Football |
| `GET` | `/api/cricket` | `PUBLIC` | No | None | Yes (`endpoint`) | Upstream 250ms gap | Redis (15s–600s) | Cricbuzz RapidAPI |
| `GET` | `/api/basketball` | `PUBLIC` | No | None | Yes (`met`, query) | Upstream 250ms gap | Redis (15s–600s) | AllSportsAPI / API-Basketball |
| `GET` | `/api/news` | `PUBLIC` | No | None | Yes (pagination) | In-Memory Token Bucket | Redis (180s) | MongoDB (`News` collection) |
| `GET` | `/api/news/[id]` | `PUBLIC` | No | None | Yes (`id` / slug) | In-Memory Token Bucket | Redis (300s) | MongoDB (`News` collection) |
| `GET` | `/api/videos` | `PUBLIC` | No | None | Yes (category, limit) | In-Memory Token Bucket | Redis (180s) | MongoDB (`Video` collection) |
| `GET` | `/api/categories` | `PUBLIC` | No | None | None | In-Memory Token Bucket | Redis (600s) | MongoDB (`Category` collection) |
| `GET` | `/api/categories/[id]` | `PUBLIC` | No | None | Yes (`id`) | In-Memory Token Bucket | Redis (600s) | MongoDB (`Category` collection) |
| `POST` | `/api/newsletter/subscribe` | `PUBLIC` | No | None | HealthGate + Regex | 10 req/min per IP | None | MongoDB (`NewsletterSubscriber`) |
| `GET` | `/api/newsletter/confirm` | `PUBLIC` | No | None | Token validation | In-Memory Token Bucket | None | MongoDB (`NewsletterSubscriber`) |
| `GET` | `/api/newsletter/unsubscribe` | `PUBLIC` | No | None | Token validation | In-Memory Token Bucket | None | MongoDB (`NewsletterSubscriber`) |
| `POST` | `/api/notifications/register` | `PUBLIC` | No | None | Schema check | 30 req/min per IP | None | MongoDB (`NotificationToken`) |
| `POST` | `/api/notifications/send` | `INTERNAL` | **Yes** | Server Secret | Schema check | Rate-limited | None | FCM & Expo Push Gateways |
| `GET` | `/api/realtime/stream` | `PUBLIC` | No | None | None | Connection Limit | Live Stream | SSE Event Bus / Broadcaster |
| `POST` | `/api/cron/newsletter` | `INTERNAL` | **Yes** | `CRON_SECRET` | Frequency param | None | None | Dispatcher & Go Mailer |
| `POST` | `/api/webhooks/mailer` | `INTERNAL` | No (Token) | Webhook Payload | Schema check | Rate-limited | None | MongoDB (`SuppressionEntry`) |
| `GET` | `/api/openapi.json` | `PUBLIC` | No | None | None | In-Memory Token Bucket | Static / Memory | OpenAPI 3.0 Document |

---

## 2. Admin & Editorial Management API (`apps/admin/src/app/api`)

| Method | Path | Access Tier | Auth Required? | Role Required | Input Validation | Audit Logged? | Data Store / Upstream |
| :--- | :--- | :--- | :---: | :--- | :---: | :---: | :--- |
| `GET/POST` | `/api/auth/[...nextauth]` | `PUBLIC` | No / Handled | None / Login | Sanitized credentials | Yes | NextAuth JWT Session |
| `GET/POST` | `/api/news` | `ADMIN` | **Yes** | `contributor`+ | Full article schema | **Yes** | MongoDB (`News` collection) |
| `GET/PUT/DELETE` | `/api/news/[id]` | `ADMIN` | **Yes** | `editor`+ | ObjectId + Body | **Yes** | MongoDB (`News` collection) |
| `GET/POST` | `/api/videos` | `ADMIN` | **Yes** | `contributor`+ | Video schema | **Yes** | MongoDB (`Video` collection) |
| `GET/PUT/DELETE` | `/api/videos/[id]` | `ADMIN` | **Yes** | `editor`+ | ObjectId + Body | **Yes** | MongoDB (`Video` collection) |
| `GET/POST` | `/api/categories` | `ADMIN` | **Yes** | `editor`+ | Category schema | **Yes** | MongoDB (`Category` collection) |
| `GET` | `/api/newsletter/subscribers` | `ADMIN` | **Yes** | `editor`+ | Pagination | No | MongoDB (`NewsletterSubscriber`) |
| `POST` | `/api/newsletter/campaigns` | `ADMIN` | **Yes** | `manager`+ | Campaign schema | **Yes** | Go Mailer (`/api/dispatch`) |
| `GET/POST` | `/api/payroll` | `ADMIN` | **Yes** | `manager`, `super-admin`| Payroll schema | **Yes** | MongoDB (`Payroll` collection) |
| `GET/POST` | `/api/evaluations` | `ADMIN` | **Yes** | `manager`, `super-admin`| Evaluation schema | **Yes** | MongoDB (`Evaluation` collection) |
| `GET/POST` | `/api/standups` | `ADMIN` | **Yes** | `staff`+ | Standup schema | **Yes** | MongoDB (`Standup` collection) |
| `GET/POST` | `/api/training` | `ADMIN` | **Yes** | `staff`+ | Training schema | **Yes** | MongoDB (`Training` collection) |
| `GET/POST` | `/api/reports` | `ADMIN` | **Yes** | `manager`+ | Report schema | **Yes** | MongoDB (`DailyReport` collection) |
| `POST` | `/api/upload` | `ADMIN` | **Yes** | `staff`+ | MIME & size check | **Yes** | Cloudinary Media Storage |
| `GET/PUT` | `/api/user` | `ADMIN` | **Yes** | `user`+ | User schema | **Yes** | MongoDB (`User` collection) |
| `GET/PUT` | `/api/admin/users` | `ADMIN` | **Yes** | `super-admin` | Role escalation check | **Yes** | MongoDB (`User` collection) |

---

## 3. Threat Assessment by Route Group

1. **Public Sports Proxies (`/api/football`, `/api/cricket`, `/api/basketball`)**: Protected against quota exhaustion by upstream rate spacers (250ms gap) and Redis caching (15s–600s). No raw upstream credentials exposed to clients.
2. **Audience & Newsletter Endpoints (`/api/newsletter/subscribe`)**: Protected by HealthGate validator (RFC 5322 syntax, domain MX lookup, disposable email blacklist) and token-authenticated double opt-in.
3. **Admin Endpoints**: Authenticated via NextAuth JWT and checked with `requireRole(session, ['manager', 'super-admin'])`. Sensitive mutations are audited with actor timestamps.
