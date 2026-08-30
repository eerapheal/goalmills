import { NextRequest, NextResponse } from 'next/server';
import { SearchService } from '@/lib/searchService';
import { resolveTenantContext } from '@/lib/tenantContext';
import type { SearchEntityType } from '@goalmills/types';

export async function GET(request: NextRequest) {
  try {
    const tenant = await resolveTenantContext(request);
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('q') || searchParams.get('query') || '';
    const sport = searchParams.get('sport') || undefined;
    const competition = searchParams.get('competition') || undefined;
    const team = searchParams.get('team') || undefined;
    const category = searchParams.get('category') || undefined;
    const dateRange = (searchParams.get('dateRange') as any) || 'all';
    const sortBy = (searchParams.get('sortBy') as any) || 'relevance';
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '12', 10), 1), 50);

    const typeParam = searchParams.get('type');
    const entityTypes: SearchEntityType[] = typeParam
      ? (typeParam.split(',').filter(Boolean) as SearchEntityType[])
      : ['article', 'video', 'newsletter'];

    const searchResponse = await SearchService.executeSearch({
      query,
      sport,
      competition,
      team,
      category,
      dateRange,
      entityTypes,
      sortBy,
      page,
      limit,
      tenantSlug: tenant.tenantSlug || 'goalmills',
    });

    return NextResponse.json(searchResponse);
  } catch (error: any) {
    console.error('[Search API Route] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Search Error' },
      { status: 500 }
    );
  }
}
