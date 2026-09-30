import { NextRequest, NextResponse } from 'next/server';
import { getCanonicalBookmaker } from '@/lib/betting';
import dbConnect from '@/lib/db';
import BookmakerModel from '@/models/Bookmaker';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const canonical = getCanonicalBookmaker(id);

    if (!canonical) {
      return NextResponse.json(
        { success: false, error: 'Bookmaker not found' },
        { status: 404 }
      );
    }

    let bookmaker = canonical;

    try {
      await dbConnect();
      const dbDoc = await BookmakerModel.findOne({
        $or: [{ id: canonical.id }, { slug: canonical.slug }],
      }).lean();

      if (dbDoc) {
        bookmaker = {
          ...canonical,
          ...dbDoc,
          id: dbDoc.id,
          slug: dbDoc.slug,
          displayName: dbDoc.displayName,
          websiteUrl: dbDoc.websiteUrl,
        };
      }
    } catch {
      // Fallback to canonical in-memory record
    }

    return NextResponse.json({
      success: true,
      data: bookmaker,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve bookmaker' },
      { status: 500 }
    );
  }
}
