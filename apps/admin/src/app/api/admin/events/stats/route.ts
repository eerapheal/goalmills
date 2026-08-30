import { NextRequest, NextResponse } from 'next/server';
import { sportsEventWorker } from '@/lib/events/eventWorker';
import { resolveTenantContext } from '@/lib/tenantContext';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantContext = await resolveTenantContext(req);
    const stats = await sportsEventWorker.getPipelineDiagnostics(tenantContext.tenantSlug);

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch pipeline diagnostics',
      },
      { status: 500 }
    );
  }
}
