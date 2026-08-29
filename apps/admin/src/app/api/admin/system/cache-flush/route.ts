import { NextRequest, NextResponse } from 'next/server';
import { cacheInvalidatePattern } from '@/lib/redisCache';
import { requirePermission } from '@/lib/serverAuth';
import { logAdminAction } from '@/lib/auditLog';

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await requirePermission('system:settings');
    if (error) return error;

    await cacheInvalidatePattern('*');

    logAdminAction({
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: 'SYSTEM_CACHE_FLUSHED',
      resource: 'RedisCache',
      resourceId: 'all',
      status: 'SUCCESS',
    });

    return NextResponse.json({ success: true, message: 'All Redis and in-memory caches flushed' });
  } catch (err: any) {
    console.error('[Admin Cache Flush] Error:', err);
    return NextResponse.json({ error: 'Failed to flush cache' }, { status: 500 });
  }
}
