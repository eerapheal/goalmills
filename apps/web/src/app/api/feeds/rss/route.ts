import { NextRequest, NextResponse } from 'next/server';
import { contentDistributionService } from '@/lib/distribution/contentDistributionService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sport = searchParams.get('sport') || undefined;
    const tenantSlug = req.headers.get('x-tenant-slug') || 'goalmills';

    const xml = await contentDistributionService.getPublicRssFeed(sport, tenantSlug);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    });
  } catch (error: any) {
    return new NextResponse(
      `<error>${error?.message || 'Failed to generate RSS feed'}</error>`,
      {
        status: 500,
        headers: { 'Content-Type': 'application/xml' },
      }
    );
  }
}
