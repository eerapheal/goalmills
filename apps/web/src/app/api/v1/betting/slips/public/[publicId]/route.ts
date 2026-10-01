import { NextRequest, NextResponse } from 'next/server';
import { getPublicBetSlip } from '@/lib/betting';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const { publicId } = await params;
    if (!publicId) {
      return NextResponse.json({ success: false, error: 'publicId is required' }, { status: 400 });
    }

    const slip = await getPublicBetSlip(publicId);
    if (!slip) {
      return NextResponse.json(
        { success: false, error: 'Public bet slip not found or private' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: slip });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
