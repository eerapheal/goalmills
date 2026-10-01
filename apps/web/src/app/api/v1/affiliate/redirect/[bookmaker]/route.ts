import { NextRequest } from 'next/server';
import { GET as handleAffiliateRedirect } from '@/app/api/affiliate/redirect/[bookmaker]/route';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ bookmaker: string }> }
) {
  return handleAffiliateRedirect(request, context);
}
