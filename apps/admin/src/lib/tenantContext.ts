import { NextRequest } from 'next/server';
import Tenant from '@/models/Tenant';
import dbConnect from '@/lib/db';
import type { TenantContext, Tenant as TenantType } from '@goalmills/types';

export const DEFAULT_TENANT_ID = 'default';
export const DEFAULT_TENANT_SLUG = 'goalmills';

export const DEFAULT_TENANT: TenantType = {
  _id: DEFAULT_TENANT_ID,
  name: 'GoalMills Sports Network',
  slug: DEFAULT_TENANT_SLUG,
  status: 'active',
  plan: 'enterprise',
  settings: {
    brandName: 'GoalMills',
    primaryColor: '#3B82F6',
    accentColor: '#F59E0B',
    defaultSport: 'football',
    supportedSports: ['football', 'cricket', 'basketball'],
    contactEmail: 'contact@goalmills.com',
  },
  features: {
    newsletter: true,
    videoHighlights: true,
    advancedAds: true,
    customDomain: true,
    apiAccess: true,
    customThemes: true,
    sportsPredictions: true,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Resolve the current tenant context from request headers, subdomains, custom domains, or session
 */
export async function resolveTenantContext(
  req?: NextRequest | Request | null,
  session?: any
): Promise<TenantContext> {
  const isSuperAdmin = session?.user?.role === 'super-admin';
  let tenantId = session?.user?.tenantId;
  let tenantSlug = session?.user?.tenantSlug;

  // 1. Check request headers (e.g. from mobile or API gateway)
  if (req && 'headers' in req) {
    const headerTenantId = req.headers.get('x-tenant-id');
    const headerTenantSlug = req.headers.get('x-tenant-slug');
    const host = req.headers.get('host') || '';

    if (headerTenantId) tenantId = headerTenantId;
    if (headerTenantSlug) tenantSlug = headerTenantSlug.toLowerCase().trim();

    // 2. Custom Domain / Subdomain check if no explicit header
    if (!tenantSlug && host) {
      const cleanHost = host.split(':')[0].toLowerCase();
      if (cleanHost.endsWith('.goalmills.com')) {
        const sub = cleanHost.replace('.goalmills.com', '');
        if (sub && sub !== 'www' && sub !== 'admin' && sub !== 'api') {
          tenantSlug = sub;
        }
      } else if (cleanHost !== 'goalmills.com' && cleanHost !== 'localhost' && cleanHost !== '127.0.0.1') {
        // Custom domain lookup
        try {
          await dbConnect();
          const foundTenant = await Tenant.findOne({ customDomain: cleanHost, status: 'active' }).lean();
          if (foundTenant) {
            return {
              tenantId: foundTenant._id.toString(),
              tenantSlug: foundTenant.slug,
              tenant: foundTenant as TenantType,
              isSuperAdmin,
              isDefaultTenant: false,
            };
          }
        } catch {
          // Fallback to default
        }
      }
    }
  }

  // 3. If explicit tenantId or tenantSlug was identified, fetch from database
  if (tenantSlug && tenantSlug !== DEFAULT_TENANT_SLUG) {
    try {
      await dbConnect();
      const tenant = await Tenant.findOne({ slug: tenantSlug }).lean();
      if (tenant) {
        return {
          tenantId: tenant._id.toString(),
          tenantSlug: tenant.slug,
          tenant: tenant as TenantType,
          isSuperAdmin,
          isDefaultTenant: false,
        };
      }
    } catch {
      // Fallback on error
    }
  }

  if (tenantId && tenantId !== DEFAULT_TENANT_ID) {
    try {
      await dbConnect();
      const tenant = await Tenant.findById(tenantId).lean();
      if (tenant) {
        return {
          tenantId: tenant._id.toString(),
          tenantSlug: tenant.slug,
          tenant: tenant as TenantType,
          isSuperAdmin,
          isDefaultTenant: false,
        };
      }
    } catch {
      // Fallback on error
    }
  }

  // 4. Default single-tenant fallback
  return {
    tenantId: DEFAULT_TENANT_ID,
    tenantSlug: DEFAULT_TENANT_SLUG,
    tenant: DEFAULT_TENANT,
    isSuperAdmin,
    isDefaultTenant: true,
  };
}

/**
 * Helper to construct MongoDB filter query maintaining backward compatibility with legacy un-scoped records
 */
export function buildTenantFilter(context: TenantContext): Record<string, any> {
  if (context.isSuperAdmin && context.isDefaultTenant) {
    // Platform Super Admin without specific tenant filter can access all records
    return {};
  }

  if (context.isDefaultTenant) {
    // Default tenant query matches explicit default tenant or legacy records without tenantId
    return {
      $or: [
        { tenantId: DEFAULT_TENANT_ID },
        { tenantId: DEFAULT_TENANT_SLUG },
        { tenantId: { $exists: false } },
        { tenantId: null },
      ],
    };
  }

  return { tenantId: context.tenantId };
}
