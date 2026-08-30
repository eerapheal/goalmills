import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const { mockTenants } = vi.hoisted(() => ({
  mockTenants: [
    {
      _id: '607f1f77bcf86cd799439001',
      name: 'Apex Sports Media',
      slug: 'apex-sports',
      status: 'active',
      plan: 'publisher',
      createdAt: new Date(),
    },
  ],
}));

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/serverAuth', () => ({
  requirePermission: vi.fn().mockImplementation((permission) => {
    return Promise.resolve({
      session: {
        user: { id: 'admin-user-id', name: 'Super Admin', role: 'super-admin' },
      },
      error: null,
    });
  }),
}));

vi.mock('@/models/Tenant', () => {
  return {
    default: {
      find: vi.fn().mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue(mockTenants),
        }),
      }),
      findOne: vi.fn().mockImplementation((query) => {
        if (query.slug === 'existing-slug') {
          return Promise.resolve({ _id: 'existing-id', slug: 'existing-slug' });
        }
        return Promise.resolve(null);
      }),
      create: vi.fn().mockImplementation((data) => {
        return Promise.resolve({
          _id: '607f1f77bcf86cd799439999',
          ...data,
          status: 'active',
        });
      }),
    },
  };
});

import { GET, POST } from '../route';

describe('Admin Tenants API Route (/api/admin/tenants)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should list all tenant organizations for Super Admin', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/tenants');
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.tenants).toBeDefined();
    expect(json.tenants.length).toBeGreaterThan(0);
  });

  it('should provision a new tenant organization on valid POST', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/tenants', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Madridista Club Hub',
        slug: 'madridista-hub',
        plan: 'publisher',
        customDomain: 'news.madridistahub.com',
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.tenant.name).toBe('Madridista Club Hub');
    expect(json.tenant.slug).toBe('madridista-hub');
  });

  it('should reject tenant creation if slug already exists', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/tenants', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Duplicate Tenant',
        slug: 'existing-slug',
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.success).toBe(false);
    expect(json.error).toContain('already registered');
  });

  it('should reject tenant creation with missing required fields', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/tenants', {
      method: 'POST',
      body: JSON.stringify({
        name: 'No Slug Corp',
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });
});
