import { NextRequest, NextResponse } from 'next/server';
import { cancelOddsAlert } from '@/lib/betting';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;

    const cancelled = await cancelOddsAlert(id, userId);
    return NextResponse.json({ success: cancelled });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
