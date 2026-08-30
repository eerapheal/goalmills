import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Sponsorship from '@/models/Sponsorship';
import { requirePermission } from '@/lib/serverAuth';
import { sanitizeObject } from '@/lib/security';
import { logAdminAction } from '@/lib/auditLog';
import { resolveTenantContext, buildTenantFilter, DEFAULT_TENANT_ID, DEFAULT_TENANT_SLUG } from '@/lib/tenantContext';

export async function GET(request: NextRequest) {
  try {
    const { session, error } = await requirePermission('articles:draft');
    if (error) return error;

    await dbConnect();
    const tenantContext = await resolveTenantContext(request, session);
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const placement = searchParams.get('placement');
    const sportSlug = searchParams.get('sportSlug');
    const tenantFilterParam = searchParams.get('tenantId');
    const includeDeleted = searchParams.get('includeDeleted') === 'true';

    let baseFilter: Record<string, any> = {};

    if (tenantContext.isSuperAdmin && tenantFilterParam && tenantFilterParam !== 'all') {
      baseFilter.tenantId = tenantFilterParam;
    } else if (!tenantContext.isSuperAdmin) {
      baseFilter = buildTenantFilter(tenantContext);
    }

    if (!includeDeleted) {
      baseFilter.isDeleted = { $ne: true };
    }
    if (status && status !== 'all') {
      baseFilter.status = status;
    }
    if (placement && placement !== 'all') {
      baseFilter.placement = placement;
    }
    if (sportSlug && sportSlug !== 'all') {
      baseFilter.sportSlug = sportSlug;
    }

    const sponsorships = await Sponsorship.find(baseFilter)
      .sort({ priority: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      tenantSlug: tenantContext.tenantSlug,
      sponsorships,
    });
  } catch (error: any) {
    console.error('[Admin Sponsorships GET] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch sponsorships' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await requirePermission('articles:publish');
    if (error) return error;

    await dbConnect();
    const tenantContext = await resolveTenantContext(request, session);
    const rawBody = await request.json();
    const body = sanitizeObject(rawBody);

    if (!body.title || !body.sponsorName || !body.targetUrl) {
      return NextResponse.json(
        { error: 'Title, Sponsor Name, and Target URL are required' },
        { status: 400 }
      );
    }

    const assignedTenantId =
      tenantContext.isSuperAdmin && body.tenantId ? body.tenantId : tenantContext.tenantId || DEFAULT_TENANT_ID;
    const assignedTenantSlug =
      tenantContext.isSuperAdmin && body.tenantSlug ? body.tenantSlug : tenantContext.tenantSlug || DEFAULT_TENANT_SLUG;

    const newSponsorship = await Sponsorship.create({
      title: body.title,
      sponsorName: body.sponsorName,
      sponsorLogo: body.sponsorLogo || '',
      type: body.type || 'banner',
      placement: body.placement || 'homepage_hero',
      targetUrl: body.targetUrl,
      imageUrl: body.imageUrl || '',
      tagline: body.tagline || '',
      ctaText: body.ctaText || 'Learn More',
      sportSlug: body.sportSlug || 'all',
      badgeText: body.badgeText || 'SPONSORED',
      status: body.status || 'active',
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      priority: Number(body.priority) || 1,
      budget: body.budget ? Number(body.budget) : undefined,
      targeting: body.targeting || {},
      budgetControls: body.budgetControls || {},
      tenantId: assignedTenantId,
      tenantSlug: assignedTenantSlug,
      impressions: 0,
      clicks: 0,
      ctr: 0,
      spent: 0,
      isDeleted: false,
    });

    logAdminAction({
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: 'SPONSORSHIP_CREATED',
      resource: 'Sponsorship',
      resourceId: String(newSponsorship._id),
      status: 'SUCCESS',
      metadata: {
        title: newSponsorship.title,
        sponsor: newSponsorship.sponsorName,
        tenantId: assignedTenantId,
      },
    });

    return NextResponse.json({ success: true, sponsorship: newSponsorship }, { status: 201 });
  } catch (error: any) {
    console.error('[Admin Sponsorships POST] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create sponsorship' }, { status: 500 });
  }
}
