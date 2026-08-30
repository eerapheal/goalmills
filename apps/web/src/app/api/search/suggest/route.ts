import { NextRequest, NextResponse } from 'next/server';
import { SearchService } from '@/lib/searchService';
import { resolveTenantContext } from '@/lib/tenantContext';

export async function GET(request: NextRequest) {
  try {
    const tenant = await resolveTenantContext(request);
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query') || '';

    const suggestionsResponse = await SearchService.getSearchSuggestions(
      query,
      tenant.tenantSlug || 'goalmills'
    );

    return NextResponse.json(suggestionsResponse);
  } catch (error: any) {
    console.error('[Search Suggest API Route] Error:', error);
    return NextResponse.json(
      { success: false, suggestions: [], message: error.message },
      { status: 500 }
    );
  }
}
