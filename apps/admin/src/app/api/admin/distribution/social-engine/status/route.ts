import { NextRequest, NextResponse } from 'next/server';
import { socialEngineClient } from '@/lib/distribution/socialEngineClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [status, platformsData] = await Promise.all([
      socialEngineClient.getStatus(),
      socialEngineClient.getPlatforms(),
    ]);

    return NextResponse.json({
      success: true,
      status,
      platforms: platformsData.platforms || [],
      baseUrl: socialEngineClient.getBaseUrl(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch social engine status',
      },
      { status: 500 }
    );
  }
}
