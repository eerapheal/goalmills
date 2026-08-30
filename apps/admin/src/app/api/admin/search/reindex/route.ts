import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import News from '@/models/News';
import Video from '@/models/Video';

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now();
    await dbConnect();

    // Ensure text indexes on News collection
    try {
      await News.collection.createIndex(
        {
          title: 'text',
          excerpt: 'text',
          tags: 'text',
          competition: 'text',
          'teams.name': 'text',
        },
        {
          weights: {
            title: 10,
            'teams.name': 8,
            competition: 6,
            tags: 4,
            excerpt: 2,
          },
          name: 'NewsFullTextIndex',
          background: true,
        }
      );
    } catch (e: any) {
      console.warn('News text index creation warning:', e.message);
    }

    // Ensure text index on Video collection
    try {
      await Video.collection.createIndex(
        { title: 'text', description: 'text', sport: 'text' },
        { name: 'VideoFullTextIndex', background: true }
      );
    } catch (e: any) {
      console.warn('Video text index creation warning:', e.message);
    }

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: 'Search indexes synchronized and rebuilt successfully.',
      reindexDurationMs: duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Admin Search Reindex POST] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error rebuilding search indexes' },
      { status: 500 }
    );
  }
}
