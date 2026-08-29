import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Sponsorship from '@/models/Sponsorship';
import { isValidObjectId } from '@/lib/security';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('type') || 'impression';

    await dbConnect();
    const updateField = eventType === 'click' ? { $inc: { clicks: 1 } } : { $inc: { impressions: 1 } };

    await Sponsorship.findByIdAndUpdate(id, updateField);

    return NextResponse.json({ success: true, tracked: eventType });
  } catch (error: any) {
    console.error('[Web Sponsorship Track] Error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
