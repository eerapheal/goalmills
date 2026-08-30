import { NextRequest, NextResponse } from 'next/server';
import { sportsEventWorker } from '@/lib/events/eventWorker';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Dead letter event ID is required' }, { status: 400 });
    }

    const replayed = await sportsEventWorker.replayDeadLetter(
      id,
      session.user?.email || 'admin'
    );

    if (!replayed) {
      return NextResponse.json(
        { error: 'Failed to replay dead letter event' },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Event replayed successfully into sports stream pipeline',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to execute DLQ replay',
      },
      { status: 500 }
    );
  }
}
