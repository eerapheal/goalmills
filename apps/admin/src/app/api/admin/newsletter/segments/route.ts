import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import NewsletterSegment from '@/models/NewsletterSegment';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import { resolveTenantContext } from '@/lib/tenantContext';
import { sanitizeObject } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    const tenant = await resolveTenantContext(request);
    await dbConnect();

    const query: Record<string, any> = {};
    if (tenant.tenantSlug && tenant.tenantSlug !== 'all') {
      query.tenantSlug = tenant.tenantSlug;
    }

    const segments = await NewsletterSegment.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      segments,
      tenantContext: {
        tenantId: tenant.tenantId,
        tenantSlug: tenant.tenantSlug,
      },
    });
  } catch (error: any) {
    console.error('[Admin Newsletter Segments GET] Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenant = await resolveTenantContext(request);
    const body = await request.json();
    const cleanData = sanitizeObject(body);

    if (!cleanData.name) {
      return NextResponse.json(
        { success: false, message: 'Segment name is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const slug = cleanData.slug || cleanData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const tenantSlug = tenant.tenantSlug || 'goalmills';

    // Calculate estimated subscriber match count
    const subscriberQuery: Record<string, any> = {
      tenantSlug,
      status: { $in: ['CONFIRMED', 'ACTIVE', 'ENGAGED', 'active'] },
    };

    const count = await NewsletterSubscriber.countDocuments(subscriberQuery);

    const newSegment = await NewsletterSegment.create({
      ...cleanData,
      slug,
      estimatedSubscribers: count,
      tenantId: tenant.tenantId,
      tenantSlug,
    });

    return NextResponse.json({ success: true, segment: newSegment }, { status: 201 });
  } catch (error: any) {
    console.error('[Admin Newsletter Segments POST] Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
