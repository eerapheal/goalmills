import { NextRequest, NextResponse } from 'next/server';
import { GET as getBettingOdds } from '@/app/api/v1/betting/odds/[eventId]/route';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ eventId: string }> }
) {
  return getBettingOdds(request, context);
}
