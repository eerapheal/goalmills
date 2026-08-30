import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { resolveTenantContext, buildTenantFilter, DEFAULT_TENANT_ID, DEFAULT_TENANT_SLUG } from '../tenantContext';

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/models/Tenant', () => {
  return {
    default: {
      findOne: vi.fn().mockImplementation((query) => {
        if (query.slug === 'arsenal-fan-club') {
          return {
            lean: vi.fn().mockResolvedValue({
              _id: '607f1f77bcf86cd799439099',
              name: 'Arsenal Fan Club',
              slug: 'arsenal-fan-club',
              status: 'active',
              plan: 'publisher',
            }),
          };
        }
        if (query.customDomain === 'sports.apexdaily.com') {
          return {
            lean: vi.fn().mockResolvedValue({
              _id: '607f1f77bcf86cd799439100',
              name: 'Apex Daily Sports',
              slug: 'apex-daily',
              customDomain: 'sports.apexdaily.com',
              status: 'active',
              plan: 'enterprise',
            }),
          };
        }
        return { lean: vi.fn().mockResolvedValue(null) };
      }),
      findById: vi.fn().mockImplementation((id) => {
        if (id === '607f1f77bcf86cd799439099') {
          return {
            lean: vi.fn().mockResolvedValue({
              _id: '607f1f77bcf86cd799439099',
              name: 'Arsenal Fan Club',
              slug: 'arsenal-fan-club',
              status: 'active',
            }),
          };
        }
        return { lean: vi.fn().mockResolvedValue(null) };
      }),
    },
  };
});

describe('Tenant Context Resolution Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should resolve to default GoalMills platform tenant when no headers or domain provided', async () => {
    const req = new NextRequest('http://localhost:3000/api/news');
    const context = await resolveTenantContext(req, null);

    expect(context.tenantId).toBe(DEFAULT_TENANT_ID);
    expect(context.tenantSlug).toBe(DEFAULT_TENANT_SLUG);
    expect(context.isDefaultTenant).toBe(true);
    expect(context.isSuperAdmin).toBe(false);
  });

  it('should resolve tenant from x-tenant-slug header', async () => {
    const req = new NextRequest('http://localhost:3000/api/news', {
      headers: { 'x-tenant-slug': 'arsenal-fan-club' },
    });
    const context = await resolveTenantContext(req, null);

    expect(context.tenantSlug).toBe('arsenal-fan-club');
    expect(context.tenantId).toBe('607f1f77bcf86cd799439099');
    expect(context.isDefaultTenant).toBe(false);
  });

  it('should resolve tenant from custom domain Host header', async () => {
    const req = new NextRequest('http://sports.apexdaily.com/api/news', {
      headers: { host: 'sports.apexdaily.com' },
    });
    const context = await resolveTenantContext(req, null);

    expect(context.tenantSlug).toBe('apex-daily');
    expect(context.isDefaultTenant).toBe(false);
    expect(context.tenant?.name).toBe('Apex Daily Sports');
  });

  it('should construct backward-compatible tenant filter query for default tenant', () => {
    const defaultContext = {
      tenantId: DEFAULT_TENANT_ID,
      tenantSlug: DEFAULT_TENANT_SLUG,
      isSuperAdmin: false,
      isDefaultTenant: true,
    };
    const filter = buildTenantFilter(defaultContext);

    expect(filter.$or).toBeDefined();
    expect(filter.$or).toEqual([
      { tenantId: 'default' },
      { tenantId: 'goalmills' },
      { tenantId: { $exists: false } },
      { tenantId: null },
    ]);
  });

  it('should construct strict tenant filter query for isolated tenant', () => {
    const isolatedContext = {
      tenantId: '607f1f77bcf86cd799439099',
      tenantSlug: 'arsenal-fan-club',
      isSuperAdmin: false,
      isDefaultTenant: false,
    };
    const filter = buildTenantFilter(isolatedContext);

    expect(filter.tenantId).toBe('607f1f77bcf86cd799439099');
  });
});
