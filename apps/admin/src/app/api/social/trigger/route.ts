import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { workflow, leagueId, platforms } = body;

    if (!workflow) {
      return NextResponse.json(
        { success: false, error: 'workflow is required' },
        { status: 400 }
      );
    }

    const engineUrl = process.env.SOCIAL_ENGINE_URL || 'http://localhost:4000';

    try {
      const response = await fetch(`${engineUrl}/api/trigger/${workflow}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leagueId, platforms }),
      });

      const data = await response.json();
      return NextResponse.json(data);
    } catch (err: any) {
      return NextResponse.json(
        {
          success: false,
          error: `Social Engine service is unreachable at ${engineUrl}. Ensure the microservice is running.`,
          details: err.message,
        },
        { status: 503 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Trigger request failed' },
      { status: 500 }
    );
  }
}
