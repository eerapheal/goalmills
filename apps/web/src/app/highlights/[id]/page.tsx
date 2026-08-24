import Link from 'next/link';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Video from '@/models/Video';
import VideoPlayer from '@/components/VideoPlayer';
import { ShareButtons } from '@/components/ShareButtons';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  await dbConnect();

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return { title: 'Video Not Found' };
  }

  const video = await Video.findById(id).select('video_title video_url video_thumbnail category createdAt source').lean();
  if (!video) return { title: 'Video Not Found' };

  const title = `${video.video_title} | GoalMills Highlights`;
  const description = `Watch ${video.video_title} highlights on GoalMills. Catch all the action and key moments from this exciting match.`;
  const thumbnailUrl = video.video_thumbnail || `https://picsum.photos/seed/video${id}/1200/630`;
  const url = `https://goalmills-web.vercel.app/highlights/${id}`;

  return {
    title,
    description,
    keywords: `${video.category || 'football'}, ${video.video_title}, match highlights, sports videos, GoalMills`,
    publisher: 'GoalMills',
    openGraph: {
      type: 'video.other',
      title,
      description,
      url,
      siteName: 'GoalMills',
      images: [{ url: thumbnailUrl, width: 1200, height: 630, alt: video.video_title as string }],
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [thumbnailUrl],
    },
  };
}

export default async function HighlightDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    notFound();
  }

  await dbConnect();
  const video = await Video.findById(id).lean();

  if (!video) {
    notFound();
  }

  const relatedVideos = await Video.find({ _id: { $ne: id } })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();

  const videoData = {
    ...video,
    _id: video._id.toString(),
    formattedDate: video.createdAt
      ? new Date(video.createdAt as Date | string).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '',
  };

  const getThumbnail = (url: string, thumbnail?: string) => {
    if (thumbnail) return thumbnail;
    try {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId =
          url.split('v=')[1]?.split('&')[0] ||
          url.split('/').pop()?.split('?')[0];
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    } catch (e) {
      return `https://picsum.photos/seed/${encodeURIComponent(url)}/800/450`;
    }
    return `https://picsum.photos/seed/${encodeURIComponent(url)}/800/450`;
  };

  return (
    <main className="min-h-screen bg-[#0B0F17] text-white selection:bg-blue-500/30">
      <div className="mx-auto max-w-6xl px-4 pt-24 pb-20">
        {/* Navigation */}
        <Link
          href="/highlights"
          className="group mb-6 inline-flex items-center space-x-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <span>← Back to Highlights</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Player & Metadata */}
          <div className="lg:col-span-2 space-y-6">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#141C2B] shadow-2xl">
              <VideoPlayer
                url={videoData.video_url}
                thumbnail={videoData.video_thumbnail}
                autoPlay={true}
                className="w-full aspect-video"
              />
            </div>

            {/* Meta Card */}
            <div className="rounded-2xl border border-white/10 bg-[#141C2B] p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-white/10 bg-blue-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  {videoData.category || 'HD Highlight'}
                </span>
                {videoData.formattedDate && (
                  <span className="text-xs text-slate-400">📅 {videoData.formattedDate}</span>
                )}
                {videoData.views !== undefined && (
                  <span className="text-xs text-slate-400">👁️ {videoData.views} views</span>
                )}
              </div>

              <h1 className="text-xl md:text-2xl font-black text-white leading-snug">
                {videoData.video_title}
              </h1>

              {videoData.video_description && (
                <p className="text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-4">
                  {videoData.video_description}
                </p>
              )}

              <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                <span className="text-xs text-slate-400">Share highlight:</span>
                <ShareButtons url={`https://goalmills-web.vercel.app/highlights/${videoData._id}`} title={videoData.video_title} />
              </div>
            </div>
          </div>

          {/* Related Highlights Sidebar */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              More Highlights
            </h2>

            {relatedVideos.map((item: any) => {
              const thumbnail = getThumbnail(item.video_url, item.video_thumbnail);
              return (
                <Link
                  key={item._id.toString()}
                  href={`/highlights/${item._id}`}
                  className="group flex space-x-3 rounded-xl border border-white/10 bg-[#141C2B] p-3 transition-all hover:border-white/20 hover:bg-[#1A2333]"
                >
                  <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-slate-900">
                    <img
                      src={thumbnail}
                      alt={item.video_title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <h3 className="line-clamp-2 text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                      {item.video_title}
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      {item.category || 'Replay'} • {item.views || 0} views
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
