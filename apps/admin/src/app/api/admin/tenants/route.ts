import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Tenant from '@/models/Tenant';
import { requirePermission } from '@/lib/serverAuth';
import { DEFAULT_TENANT, DEFAULT_TENANT_ID } from '@/lib/tenantContext';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { session, error } = await requirePermission('system:settings');
  if (error) return error;

  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const plan = searchParams.get('plan');

    const query: any = {};
    if (status && status !== 'all') query.status = status;
    if (plan && plan !== 'all') query.plan = plan;
    if (search) {
      const sRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: { $regex: sRegex } }, { slug: { $regex: sRegex } }, { customDomain: { $regex: sRegex } }];
    }

    const tenants = await Tenant.find(query).sort({ createdAt: -1 }).lean();

    // Include the virtual default platform tenant if not found in DB
    const hasDefault = tenants.some((t: any) => t.slug === 'goalmills');
    const results = hasDefault ? tenants : [DEFAULT_TENANT, ...tenants];

    return NextResponse.json({
      success: true,
      count: results.length,
      tenants: results,
    });
  } catch (err: any) {
    console.error('Error fetching tenants:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to fetch tenants' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { session, error } = await requirePermission('system:settings');
  if (error) return error;

  await dbConnect();
  try {
    const body = await request.json();
    const { name, slug, plan = 'free', customDomain, settings, features } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: 'Tenant name and unique slug are required' },
        { status: 400 }
      );
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
    if (!cleanSlug) {
      return NextResponse.json(
        { success: false, error: 'Invalid tenant slug format' },
        { status: 400 }
      );
    }

    const existingSlug = await Tenant.findOne({ slug: cleanSlug });
    if (existingSlug || cleanSlug === 'goalmills') {
      return NextResponse.json(
        { success: false, error: `Tenant slug "${cleanSlug}" is already registered` },
        { status: 409 }
      );
    }

    if (customDomain) {
      const cleanDomain = customDomain.toLowerCase().trim();
      const existingDomain = await Tenant.findOne({ customDomain: cleanDomain });
      if (existingDomain) {
        return NextResponse.json(
          { success: false, error: `Custom domain "${cleanDomain}" is already in use` },
          { status: 409 }
        );
      }
    }

    const newTenant = await Tenant.create({
      name: name.trim(),
      slug: cleanSlug,
      plan,
      customDomain: customDomain ? customDomain.toLowerCase().trim() : undefined,
      status: 'active',
      settings: settings || {},
      features: features || {
        newsletter: true,
        videoHighlights: true,
        advancedAds: plan === 'enterprise' || plan === 'publisher',
        customDomain: Boolean(customDomain),
        apiAccess: plan === 'enterprise',
        customThemes: plan === 'enterprise' || plan === 'publisher',
        sportsPredictions: true,
      },
      ownerId: session?.user?.id || undefined,
    });

    return NextResponse.json({
      success: true,
      message: `Tenant "${newTenant.name}" provisioned successfully`,
      tenant: newTenant,
    }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating tenant:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to create tenant' }, { status: 500 });
  }
}
