import Link from 'next/link';
import Image from 'next/image';
import dbConnect from '@/lib/db';
import Video from '@/models/Video';

export const dynamic = 'force-dynamic';

export default async function HighlightsPage() {
    await dbConnect();
    const highlights = await Video.find({}).sort({ createdAt: -1 });

    const getThumbnail = (url: string, thumbnail?: string) => {
        if (thumbnail) return thumbnail;
        try {
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop()?.split('?')[0];
                return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            }
        } catch (e) {
            return `https://picsum.photos/seed/${url}/800/600`;
        }
        return `https://picsum.photos/seed/${url}/800/600`;
    };

    return (
        <main className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30 overflow-hidden">
            {/* Background Glow */}
            <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] pointer-events-none -z-10" />
            <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/5 blur-[120px] pointer-events-none -z-10" />

            <div className="container mx-auto px-4 pt-32 pb-20">
                <header className="mb-12 md:mb-16 text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                        Premium Access
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tighter italic uppercase">
                        Elite <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">Highlights</span>
                    </h1>
                    <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                        Catch the most decisive moments from the world&apos;s biggest stages.
                        Relive every goal, every save, and every dramatic finish in stunning HD.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {highlights.map((item) => {
                        const thumbnail = getThumbnail(item.video_url, item.video_thumbnail);
                        return (
                            <Link
                                href={`/highlights/${item._id}`}
                                key={item._id.toString()}
                                className="group relative flex flex-col bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10"
                            >
                                {/* Thumbnail Container */}
                                <div className="relative aspect-video overflow-hidden">
                                    <Image
                                        src={thumbnail}
                                        alt={item.video_title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        priority={false}
                                    />

                                    {/* Play Overlay */}
                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-500">
                                        <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
                                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <span className="bg-black/60 backdrop-blur-md text-white text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest border border-white/10">
                                            {item.category || 'Match'}
                                        </span>
                                    </div>

                                    <div className="absolute bottom-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                        <span className="bg-blue-600 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter shadow-xl">
                                            Watch Highlight
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 md:p-8">
                                    <h3 className="text-lg md:text-xl font-black text-white line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors duration-300 antialiased">
                                        {item.video_title}
                                    </h3>

                                    <div className="mt-4 flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center text-[10px] font-black text-blue-500 italic">G</div>
                                            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">GoalMills</span>
                                        </div>
                                        <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest">HD 4K</span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {highlights.length === 0 && (
                    <div className="py-32 text-center rounded-[3rem] bg-slate-900/20 border border-slate-900 border-dashed">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-700">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No highlights have been uploaded yet.</p>
                        <p className="text-slate-600 text-xs mt-2">Check back later for recent fixtures.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
