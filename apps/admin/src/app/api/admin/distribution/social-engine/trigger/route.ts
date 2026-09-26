import { NextRequest, NextResponse } from 'next/server';
import { socialEngineClient } from '@/lib/distribution/socialEngineClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { workflow, leagueId, platforms } = body;

    const validWorkflows = ['weekly-fixtures', 'pre-match', 'live-poll', 'post-match'];
    if (!workflow || !validWorkflows.includes(workflow)) {
      return NextResponse.json(
        {
          error: `Invalid workflow '${workflow}'. Valid choices: ${validWorkflows.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const result = await socialEngineClient.triggerWorkflow(workflow, {
      leagueId: leagueId ? Number(leagueId) : undefined,
      platforms: platforms || 'all',
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to trigger workflow',
      },
      { status: 500 }
    );
  }
}
