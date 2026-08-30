import { NextRequest, NextResponse } from 'next/server';
import { resolveTenantContext } from '@/lib/tenantContext';

export async function GET(req: NextRequest) {
  try {
    const context = await resolveTenantContext(req);
    return NextResponse.json({
      success: true,
      tenantId: context.tenantId,
      tenantSlug: context.tenantSlug,
      isDefaultTenant: context.isDefaultTenant,
      settings: context.tenant?.settings || {
        brandName: 'GoalMills',
        primaryColor: '#3B82F6',
        accentColor: '#F59E0B',
        defaultSport: 'football',
        supportedSports: ['football', 'cricket', 'basketball'],
      },
      features: context.tenant?.features || {},
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch tenant configuration' },
      { status: 500 }
    );
  }
}
