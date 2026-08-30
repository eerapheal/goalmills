import { NextRequest, NextResponse } from 'next/server';
import { sportsEventProducer } from '@/lib/events/eventProducer';
import { sportsEventWorker } from '@/lib/events/eventWorker';
import { resolveTenantContext } from '@/lib/tenantContext';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import type { LiveMatchStreamEvent } from '@goalmills/types';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantContext = await resolveTenantContext(req);
    const body = await req.json();

    const liveEvent: LiveMatchStreamEvent = {
      matchId: body.matchId || `match_${Date.now()}`,
      sport: body.sport || 'football',
      league: body.league || 'Premier League',
      homeTeam: body.homeTeam || 'Arsenal',
      awayTeam: body.awayTeam || 'Chelsea',
      score: body.score || '1 - 0',
      minute: body.minute || "44'",
      eventType: body.eventType || 'goal',
      headline: body.headline || 'GOAL! Tactical Breakthrough',
      detail: body.detail || 'Brilliant finish inside the box to take the lead.',
      timestamp: new Date().toISOString(),
    };

    // 1. Dispatch into stream producer
    const envelope = await sportsEventProducer.publishLiveMatchMoment(
      liveEvent,
      tenantContext.tenantSlug
    );

    // 2. Process through worker
    await sportsEventWorker.processEvent(envelope);

    return NextResponse.json({
      success: true,
      message: `Simulated ${liveEvent.eventType.toUpperCase()} event broadcasted to stream`,
      envelope,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to simulate sports stream event',
      },
      { status: 500 }
    );
  }
}
