import { NextRequest, NextResponse } from 'next/server';
import { forwardProxyRequest } from '@/proxy';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { checkRateLimit } from '@/lib/rateLimit';

/**
 * Enterprise Route Proxy Endpoint
 * Forwards validated and authorized API requests across the system with security headers,
 * request correlation, and rate-limiting.
 */
export async function ALL(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const rateLimit = checkRateLimit(`proxy:${ip}`, { maxRequests: 120, windowSeconds: 60 });
  if (!rateLimit.success) {
    return NextResponse.json(
      { success: false, error: 'Rate limit exceeded on proxy gateway' },
      { status: 429 }
    );
  }

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized gateway access' }, { status: 401 });
  }

  return forwardProxyRequest(req);
}

export const GET = ALL;
export const POST = ALL;
export const PUT = ALL;
export const PATCH = ALL;
export const DELETE = ALL;
