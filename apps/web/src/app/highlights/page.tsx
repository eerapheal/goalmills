import Link from 'next/link';
import dbConnect from '@/lib/db';
import Video from '@/models/Video';

export const dynamic = 'force-dynamic';

export default async function HighlightsPage() {
  await dbConnect();
  const rawHighlights = await Video.find({}).sort({ createdAt: -1 }).lean();

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
    <main className="min-h-screen bg-[#0B0F17] text-white">
      {/* Background Glow */}
      <div className="fixed top-0 left-1/4 h-[500px] w-[500px] bg-blue-600/5 blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 h-[600px] w-[600px] bg-indigo-600/5 blur-[120px] pointer-events-none -z-10" />

      <div className="mx-auto max-w-6xl px-4 pt-28 pb-20">
        <header className="mb-12 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4">
            <span className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse"></span>
            HD Match Replays
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Video <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Highlights</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Watch the most decisive goals, game-winning buzzer beaters, and dramatic finishes from around the world.
          </p>
        </header>

        {rawHighlights.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#141C2B] p-8 text-center">
            <span className="text-4xl">🎬</span>
            <h3 className="mt-3 text-base font-bold text-white">No Highlights Available</h3>
            <p className="mt-1 text-xs text-slate-400">Check back soon for new video uploads.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rawHighlights.map((item: any) => {
              const thumbnail = getThumbnail(item.video_url, item.video_thumbnail);
              return (
                <Link
                  href={`/highlights/${item._id}`}
                  key={item._id.toString()}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#141C2B] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-xl hover:shadow-blue-500/10"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                    <img
                      src={thumbnail}
                      alt={item.video_title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/20">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-blue-600/90 text-white shadow-xl backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-500">
                        <svg className="ml-0.5 h-5 w-5 fill-current" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>

                    {item.league && (
                      <div className="absolute top-3 left-3 rounded bg-black/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-400 backdrop-blur-sm border border-white/10">
                        {item.league}
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="line-clamp-2 text-base font-bold text-white transition-colors group-hover:text-blue-400 mb-2">
                      {item.video_title}
                    </h3>
                    {item.video_description && (
                      <p className="line-clamp-2 text-xs text-slate-400 mb-4 flex-1">
                        {item.video_description}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-3 text-xs text-slate-400">
                      <span>{item.views || 0} views</span>
                      <span className="font-semibold text-blue-400 group-hover:translate-x-0.5 transition-transform">
                        Watch Now →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
