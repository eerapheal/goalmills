# GoalMills Scale & Revenue Program — Phase 1 Plan

## Multi-Tenant Architecture

### 1. Objective
Transform GoalMills into a robust, isolated multi-tenant publishing platform supporting sports publishers, brand clubs, and independent media networks, while retaining 100% backward compatibility for the primary GoalMills deployment.

---

### 2. Architecture & Data Model Scope

- **Shared Core Types (`@goalmills/types`)**:
  - `Tenant`: `_id`, `name`, `slug`, `status` (`'active' | 'suspended' | 'trial' | 'cancelled'`), `plan` (`'free' | 'creator' | 'publisher' | 'enterprise'`), `customDomain`, `settings`, `features`, `createdAt`, `updatedAt`.
  - `TenantContext`: `tenantId`, `tenantSlug`, `tenant`, `isSuperAdmin`, `isDefaultTenant`.

- **Mongoose Database Models**:
  - `Tenant` model in `apps/admin/src/models/Tenant.ts` and `apps/web/src/models/Tenant.ts`.

- **Tenant Resolution Engine**:
  - Headers (`x-tenant-id`, `x-tenant-slug`)
  - Subdomains (`*.goalmills.com`)
  - Custom Domains (`Tenant.customDomain`)
  - Session JWT (`session.user.tenantId`)
  - Default Fallback (`DEFAULT_TENANT` -> `goalmills`).

- **Admin Control Plane**:
  - `GET /api/admin/tenants` (Super Admin list & search).
  - `POST /api/admin/tenants` (Provision new tenant).
  - `GET /api/admin/tenants/[id]` (Single tenant details).
  - `PATCH /api/admin/tenants/[id]` (Update plan, status, custom domain, features).
  - `DELETE /api/admin/tenants/[id]` (Soft cancel/suspend tenant).
  - Multi-Tenant UI module integrated in `/admin/system`.

---

### 3. Verification Gates

1. Unit tests for context resolution and backward-compatible query building.
2. Integration tests for admin tenant provisioning, duplicate prevention, and RBAC authorization.
3. Full regression testing across `apps/web` and `apps/admin`.
