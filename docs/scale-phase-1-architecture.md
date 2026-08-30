# GoalMills Scale & Revenue Program — Phase 1 Architecture

## Multi-Tenant System Architecture

```text
                                HTTP Request
                                     │
                     ┌───────────────┴───────────────┐
                     │                               │
             x-tenant-id / slug              Host / Domain
                     │                               │
                     └───────────────┬───────────────┘
                                     │
                     ┌───────────────▼───────────────┐
                     │    resolveTenantContext()     │
                     │  1. Check Session JWT         │
                     │  2. Check Headers             │
                     │  3. Check Subdomain           │
                     │  4. Check Custom Domain       │
                     │  5. Fallback to 'goalmills'   │
                     └───────────────┬───────────────┘
                                     │
                             TenantContext
                       { tenantId, tenantSlug, ... }
                                     │
                     ┌───────────────┴───────────────┐
                     │                               │
             Global Data                     Tenant-Scoped Data
       (Ecosystem, Live Sports)         (Articles, Ads, Subscribers)
                     │                               │
           Direct Query Fetch                Scoped Filter Query
                                        { $or: [{ tenantId }, ...] }
```

---

### Data Boundary Matrix

| Domain / Model | Isolation Scope | Tenant Query Pattern |
| :--- | :--- | :--- |
| **Ecosystem Entities** | `GLOBAL` | Universal across all tenants |
| **Live Sports Feeds** | `GLOBAL` | Shared Redis cache & normalizer |
| **News & Articles** | `TENANT-SCOPED` | `{ $or: [{ tenantId }, { tenantId: 'default' }, { tenantId: { $exists: false } }] }` |
| **Sponsorships & Ads** | `TENANT-SCOPED` | Filtered by campaign `tenantId` |
| **Newsletter Subscribers**| `TENANT-SCOPED` | Partitioned per organization |
| **Staff & Payroll** | `TENANT-SCOPED` | Isolated to organization |

---

### Tenant Context Resolution Precedence

1. **Admin Session JWT**: `session.user.tenantId` for logged-in tenant contributors and editors.
2. **Request Headers**: `x-tenant-id` / `x-tenant-slug` for programmatic and mobile API clients.
3. **Custom Domain**: Lookup `Tenant.findOne({ customDomain, status: 'active' })`.
4. **Subdomain**: `<slug>.goalmills.com`.
5. **Default Fallback**: Virtual master tenant `DEFAULT_TENANT` (`id: 'default'`, `slug: 'goalmills'`).
