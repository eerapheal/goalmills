import Link from 'next/link';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Video from '@/models/Video';
import VideoPlayer from '@/components/VideoPlayer';
import HighlightViewTracker from '@/components/highlights/HighlightViewTracker';
import { getHighlightThumbnail } from '@/lib/videoUtils';
import { Metadata } from 'next';
import { FiArrowLeft, FiClock, FiEye, FiPlay, FiShield, FiTag } from 'react-icons/fi';
import { FaFire } from 'react-icons/fa6';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  await dbConnect();

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return { title: 'Highlight Not Found | GoalMills' };
  }

  const video = await Video.findById(id)
    .select('video_title video_url video_thumbnail video_description category league createdAt')
    .lean();

  if (!video) return { title: 'Highlight Not Found | GoalMills' };

  const title = `${video.video_title} | GoalMills HD Highlights`;
  const description =
    video.video_description ||
    `Watch ${video.video_title} match replay and video highlights in HD on GoalMills.`;
  const thumbnailUrl = getHighlightThumbnail(video.video_url, video.video_thumbnail);
  const url = `https://goalmills-web.vercel.app/highlights/${id}`;

  return {
    title,
    description,
    keywords: `${video.category || 'football'}, ${video.league || 'sports'}, ${video.video_title}, match highlights, sports replay, GoalMills`,
    publisher: 'GoalMills',
    openGraph: {
      type: 'video.other',
      title,
      description,
      url,
      siteName: 'GoalMills',
      images: [
        {
          url: thumbnailUrl,
          width: 1200,
          height: 630,
          alt: video.video_title,
        },
      ],
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

export default async function HighlightDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    notFound();
  }

  await dbConnect();
  const video = await Video.findById(id).lean();

  if (!video) {
    notFound();
  }

  // Fetch related highlights
  const relatedVideos = await Video.find({ _id: { $ne: id } })
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();

  const formattedDate = video.createdAt
    ? new Date(video.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const shareUrl = `https://goalmills-web.vercel.app/highlights/${id}`;

  return (
    <main className="min-h-screen bg-[#0B0F17] text-white selection:bg-blue-500/30">
      {/* Background ambient lighting */}
      <div className="fixed top-0 left-1/3 h-[500px] w-[500px] bg-blue-600/5 blur-[140px] pointer-events-none -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/highlights"
            className="group inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition-colors"
          >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to All Highlights</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-wider text-red-400">
              HD Replay
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Video Section (8 cols on lg) */}
          <div className="lg:col-span-8 space-y-6">
            {/* The Ultra-Reliable Video Player with Instant Autoplay */}
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl">
              <VideoPlayer
                url={video.video_url}
                thumbnail={video.video_thumbnail}
                autoPlay={true}
                title={video.video_title}
                className="w-full aspect-video"
              />
            </div>

            {/* Video Metadata Card */}
            <div className="rounded-3xl border border-white/10 bg-[#141C2B] p-6 sm:p-8 shadow-xl space-y-5">
              {/* Category, League, Duration badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-blue-600 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-md shadow-blue-600/30">
                  {video.category || 'Match Replay'}
                </span>

                {video.league && (
                  <span className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-300">
                    {video.league}
                  </span>
                )}

                {video.duration && (
                  <span className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <FiClock size={12} /> {video.duration}
                  </span>
                )}

                {formattedDate && (
                  <span className="text-xs text-slate-400 ml-auto">
                    📅 {formattedDate}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {video.video_title}
              </h1>

              {/* Stats Bar */}
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                  <FiEye className="text-blue-400" /> {video.views || 0} views
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <FiShield className="text-emerald-400" /> Verified Replay
                </span>
              </div>

              {/* Description */}
              {video.video_description && (
                <div className="border-t border-white/5 pt-4">
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {video.video_description}
                  </p>
                </div>
              )}

              {/* Action Bar (View Tracker, Share, Bookmark) */}
              <HighlightViewTracker
                id={id}
                title={video.video_title}
                url={shareUrl}
              />
            </div>
          </div>

          {/* Sidebar / More Highlights (4 cols on lg) */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="sticky top-24 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FaFire className="text-red-500" />
                  <span>Up Next & Related</span>
                </h2>
                <Link
                  href="/highlights"
                  className="text-xs font-bold text-blue-400 hover:text-blue-300"
                >
                  View All →
                </Link>
              </div>

              <div className="space-y-3">
                {relatedVideos.map((item: any) => {
                  const thumb = getHighlightThumbnail(item.video_url, item.video_thumbnail);
                  return (
                    <Link
                      key={item._id.toString()}
                      href={`/highlights/${item._id}`}
                      className="group flex gap-3 rounded-2xl border border-white/10 bg-[#141C2B] p-2.5 hover:border-blue-500/30 hover:bg-[#1A2436] transition-all"
                    >
                      <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-xl bg-black">
                        <img
                          src={thumb}
                          alt={item.video_title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">
                            <FiPlay className="ml-0.5" />
                          </div>
                        </div>
                        {item.duration && (
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-bold text-white">
                            {item.duration}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col justify-between py-0.5">
                        <h3 className="line-clamp-2 text-xs font-bold text-white group-hover:text-blue-400 transition-colors leading-tight">
                          {item.video_title}
                        </h3>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>{item.league || item.category || 'Highlight'}</span>
                          <span>{item.views || 0} views</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
