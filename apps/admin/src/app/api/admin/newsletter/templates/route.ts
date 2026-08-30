import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import NewsletterTemplate from '@/models/NewsletterTemplate';
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

    const templates = await NewsletterTemplate.find(query)
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      templates,
      tenantContext: {
        tenantId: tenant.tenantId,
        tenantSlug: tenant.tenantSlug,
      },
    });
  } catch (error: any) {
    console.error('[Admin Newsletter Templates GET] Error:', error);
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
        { success: false, message: 'Template name is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const slug = cleanData.slug || cleanData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const tenantSlug = tenant.tenantSlug || 'goalmills';

    const newTemplate = await NewsletterTemplate.create({
      ...cleanData,
      slug,
      tenantId: tenant.tenantId,
      tenantSlug,
    });

    return NextResponse.json({ success: true, template: newTemplate }, { status: 201 });
  } catch (error: any) {
    console.error('[Admin Newsletter Templates POST] Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
