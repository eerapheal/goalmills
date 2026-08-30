import { NextRequest, NextResponse } from 'next/server';
import { contentDistributionService } from '@/lib/distribution/contentDistributionService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const tenantSlug = req.headers.get('x-tenant-slug') || 'goalmills';

    const xml = await contentDistributionService.getGoogleNewsSitemap(tenantSlug);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    });
  } catch (error: any) {
    return new NextResponse(
      `<error>${error?.message || 'Failed to generate Google News sitemap'}</error>`,
      {
        status: 500,
        headers: { 'Content-Type': 'application/xml' },
      }
    );
  }
}
