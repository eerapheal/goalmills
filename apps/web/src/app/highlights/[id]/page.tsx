import Link from 'next/link';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Video from '@/models/Video';
import VideoPlayer from '@/components/VideoPlayer';
import { ShareButtons } from '@/components/ShareButtons';
import { Metadata } from 'next';

// Function to generate metadata
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
    const publishedTime = video.createdAt ? new Date(video.createdAt as Date | string).toISOString() : new Date().toISOString();

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

    // Fetch related videos (excluding current)
    const relatedVideos = await Video.find({ _id: { $ne: id } })
        .sort({ createdAt: -1 })
        .limit(4)
        .lean();

    const videoData = {
        ...video,
        _id: video._id.toString(),
        formattedDate: video.createdAt ? new Date(video.createdAt as Date | string).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) : '',
    };

    return (
        <main className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
            {/* Background Glow */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-blue-600/10 blur-[120px] pointer-events-none -z-10" />

            <div className="max-w-[1600px] mx-auto px-4 pt-24 pb-20">
                {/* Navigation */}
                <Link
                    href="/highlights"
                    className="group mb-8 inline-flex items-center gap-2 text-slate-400 hover:text-white transition-all duration-300"
                >
                    <div className="w-8 h-8 rounded-full border border-slate-800 flex items-center justify-center group-hover:border-blue-500 group-hover:text-blue-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </div>
                    <span className="font-medium">Back to highlights</span>
                </Link>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 xl:gap-12">
                    {/* Main Content */}
                    <div className="xl:col-span-3 space-y-6 md:space-y-8">
                        {/* Video Player Section */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                            <div className="relative">
                                <VideoPlayer
                                    url={videoData.video_url}
                                    thumbnail={videoData.video_thumbnail}
                                    autoPlay={true}
                                    className="rounded-[1.5rem] overflow-hidden shadow-2xl saturate-[1.1] border border-white/10"
                                />
                            </div>
                        </div>

                        {/* Video Info Card */}
                        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-blue-900/20">
                                    {videoData.category || 'High Definition'}
                                </span>
                                <span className="text-slate-500 text-xs flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {videoData.formattedDate}
                                </span>
                                {videoData.views && (
                                    <span className="text-slate-500 text-xs flex items-center gap-1.5 ml-auto">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        {videoData.views.toLocaleString()} views
                                    </span>
                                )}
                            </div>

                            <h1 className="text-2xl md:text-4xl font-black text-white mb-4 leading-[1.1] tracking-tight">
                                {videoData.video_title}
                            </h1>

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6 border-t border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-xl font-black italic shadow-lg shadow-blue-900/20 antialiased">
                                        G
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm leading-none">GoalMills Official</p>
                                        <p className="text-slate-500 text-xs mt-1">Verified Sports Network</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <p className="hidden md:block text-slate-400 text-xs font-bold uppercase tracking-widest">Share this Match</p>
                                    <ShareButtons
                                        url={`https://goalmills-web.vercel.app/highlights/${id}`}
                                        title={videoData.video_title}
                                    />
                                </div>
                            </div>

                            {videoData.source && (
                                <div className="mt-8 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                                    <p className="text-blue-200/60 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Source Partner</p>
                                    <p className="text-slate-300 font-medium text-sm">{videoData.source}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar - Up Next */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                Up Next
                            </h2>
                            <Link href="/highlights" className="text-blue-500 text-xs font-bold hover:underline">View All</Link>
                        </div>

                        <div className="space-y-4">
                            {relatedVideos.map((v: any) => (
                                <Link
                                    key={v._id.toString()}
                                    href={`/highlights/${v._id.toString()}`}
                                    className="group flex gap-4 p-2 rounded-2xl hover:bg-white/5 transition-all duration-300"
                                >
                                    <div className="relative w-32 h-20 shrink-0 rounded-xl overflow-hidden shadow-lg aspect-video">
                                        {v.video_thumbnail ? (
                                            <img
                                                src={v.video_thumbnail}
                                                alt={v.video_title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-slate-800" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                                    </div>
                                    <div className="flex flex-col justify-center gap-1">
                                        <h3 className="text-sm font-bold text-slate-200 line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
                                            {v.video_title}
                                        </h3>
                                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                                            {v.category || 'Highlights'}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Premium Ad Space / Call to Action */}
                        <div className="mt-8 p-6 rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-700 relative overflow-hidden group shadow-2xl shadow-blue-900/20">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2L1 21h22L12 2zm0 3.45l8.27 14.3H3.73L12 5.45z" />
                                </svg>
                            </div>
                            <h4 className="text-xl font-black text-white mb-2 leading-tight italic uppercase tracking-tighter">Stay Updated</h4>
                            <p className="text-blue-100/80 text-xs mb-4">Get real-time scores and news directly in our app.</p>
                            <button className="w-full py-2.5 bg-white text-blue-700 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-100 transition-colors">
                                Download App
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
