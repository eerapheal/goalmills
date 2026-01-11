import Link from 'next/link';
import dbConnect from '@/lib/db';
import Video from '@/models/Video';

export const dynamic = 'force-dynamic';

export default async function HighlightsPage() {
    await dbConnect();
    const highlights = await Video.find({}).sort({ createdAt: -1 });

    const getThumbnail = (url: string, thumbnail?: string) => {
        if (thumbnail) return thumbnail;
        // Extract YouTube video ID if generic URL is used
        try {
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop()?.split('?')[0];
                return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
            }
        } catch (e) {
            return `https://picsum.photos/seed/${url}/600/400`;
        }
        return `https://picsum.photos/seed/${url}/600/400`;
    };

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-12 mt-[90px]">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">
                    Match <span className="text-blue-500">Highlights</span>
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {highlights.map((item) => {
                        const thumbnail = getThumbnail(item.video_url, item.video_thumbnail);
                        return (
                            <Link
                                href={`/highlights/${item._id}`}
                                key={item._id.toString()}
                                className="group relative block aspect-video rounded-xl overflow-hidden border border-slate-800 hover:border-blue-500 transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
                            >
                                <img
                                    src={thumbnail}
                                    alt={item.video_title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1"></div>
                                    </div>
                                </div>
                                <div className="absolute bottom-3 right-3 bg-black/80 px-2 py-1 rounded text-xs font-bold text-white">
                                    HD
                                </div>
                                <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/90 to-transparent">
                                    <p className="text-white font-medium text-sm truncate">{item.video_title}</p>
                                </div>
                            </Link>
                        );
                    })}
                    {highlights.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-500">
                            No highlights found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
