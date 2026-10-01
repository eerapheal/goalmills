import { NextRequest, NextResponse } from 'next/server';
import { getBetSlipById, updateBetSlip, deleteBetSlip } from '@/lib/betting';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;

    const slip = await getBetSlipById(id, userId);
    if (!slip) {
      return NextResponse.json({ success: false, error: 'Bet slip not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: slip });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { userId, ...updates } = body;

    const updated = await updateBetSlip(id, userId, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Bet slip not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;

    const deleted = await deleteBetSlip(id, userId);
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
