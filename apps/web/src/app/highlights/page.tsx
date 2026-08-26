import { Metadata } from 'next';
import dbConnect from '@/lib/db';
import Video from '@/models/Video';
import HighlightsFeedClient from '@/components/highlights/HighlightsFeedClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sports Video Highlights & Match Replays | GoalMills',
  description:
    'Watch the latest football, basketball, and cricket match highlights, top goals, buzzer beaters, and tactical breakdowns in HD on GoalMills.',
  openGraph: {
    title: 'Sports Video Highlights & Match Replays | GoalMills',
    description:
      'Watch the latest football, basketball, and cricket match highlights, top goals, and HD replays.',
    siteName: 'GoalMills',
    type: 'website',
  },
};

export default async function HighlightsPage() {
  await dbConnect();
  const rawHighlights = await Video.find({}).sort({ createdAt: -1 }).lean();

  const formattedHighlights = rawHighlights.map((item: any) => ({
    _id: item._id.toString(),
    video_title: item.video_title,
    video_url: item.video_url,
    video_thumbnail: item.video_thumbnail,
    video_description: item.video_description,
    category: item.category || 'Highlights',
    league: item.league,
    duration: item.duration,
    views: item.views || 0,
    isFeatured: Boolean(item.isFeatured),
    createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : undefined,
  }));

  return (
    <main className="min-h-screen bg-[#0B0F17] text-white selection:bg-blue-500/30">
      {/* Dynamic Ambient Background Glows */}
      <div className="fixed top-0 left-1/4 h-[500px] w-[500px] bg-blue-600/5 blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 h-[600px] w-[600px] bg-red-600/5 blur-[140px] pointer-events-none -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <HighlightsFeedClient initialHighlights={formattedHighlights} />
      </div>
    </main>
  );
}
