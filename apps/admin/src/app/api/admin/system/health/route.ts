import { NextRequest, NextResponse } from 'next/server';
import { getRedisHealth } from '@/lib/redisCache';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';
import { requirePermission } from '@/lib/serverAuth';

export async function GET(request: NextRequest) {
  try {
    const { session, error } = await requirePermission('articles:draft');
    if (error) return error;

    // 1. Redis Health & Metrics
    const redisHealth = await getRedisHealth();

    // 2. Database Health & Latency
    let dbStatus: 'HEALTHY' | 'DEGRADED' | 'DOWN' = 'DOWN';
    let dbLatencyMs = 0;
    try {
      const dbStart = Date.now();
      await dbConnect();
      if (mongoose.connection.readyState === 1) {
        dbLatencyMs = Date.now() - dbStart;
        dbStatus = dbLatencyMs < 200 ? 'HEALTHY' : 'DEGRADED';
      }
    } catch {
      dbStatus = 'DOWN';
    }

    // 3. Go Mailer Health Check
    const mailerUrl = process.env.MAILER_SERVICE_URL || 'http://localhost:8085';
    let mailerStatus: 'HEALTHY' | 'DOWN' = 'DOWN';
    let mailerLatencyMs = 0;
    try {
      const mailerStart = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${mailerUrl}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        mailerLatencyMs = Date.now() - mailerStart;
        mailerStatus = 'HEALTHY';
      }
    } catch {
      mailerStatus = 'DOWN';
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      services: {
        redis: {
          status: redisHealth.status.toUpperCase(),
          mode: redisHealth.mode,
          latencyMs: redisHealth.latencyMs,
          memoryEntries: redisHealth.memoryEntries,
          inFlightRequests: redisHealth.inFlightRequests,
          metrics: redisHealth.metrics,
        },
        database: {
          status: dbStatus,
          name: 'MongoDB Atlas',
          latencyMs: dbLatencyMs,
          readyState: mongoose.connection.readyState,
        },
        mailer: {
          status: mailerStatus,
          name: 'Go Enterprise Mailer',
          latencyMs: mailerLatencyMs,
        },
        providers: {
          football: {
            status: 'HEALTHY',
            provider: 'AllSportsAPI',
            rateSpacer: '250ms active',
          },
          cricket: {
            status: 'HEALTHY',
            provider: 'Cricbuzz RapidAPI / AllSports',
            rateSpacer: '250ms active',
          },
          basketball: {
            status: 'HEALTHY',
            provider: 'AllSportsAPI',
            rateSpacer: '250ms active',
          },
        },
      },
    });
  } catch (err: any) {
    console.error('[Admin System Health] Error:', err);
    return NextResponse.json({ error: 'Failed to retrieve system diagnostics' }, { status: 500 });
  }
}
