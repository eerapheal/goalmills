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
    const { platform } = body;

    if (!platform) {
      return NextResponse.json({ error: 'Platform identifier is required' }, { status: 400 });
    }

    const result = await socialEngineClient.testPlatform(platform);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to test platform connection',
      },
      { status: 500 }
    );
  }
}
