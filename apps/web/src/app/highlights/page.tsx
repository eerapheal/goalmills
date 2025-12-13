import Link from 'next/link';

const MOCK_HIGHLIGHTS = Array.from({ length: 8 }).map((_, i) => ({
    id: i + 1,
    title: `Match Day Highlights: Game ${i + 1}`,
    duration: '10:24',
    thumbnail: `https://picsum.photos/seed/highlight${i + 1}/600/400`,
}));

export default function HighlightsPage() {
    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-12 pt-24">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">
                    Match <span className="text-blue-500">Highlights</span>
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {MOCK_HIGHLIGHTS.map((item) => (
                        <Link
                            href={`/highlights/${item.id}`}
                            key={item.id}
                            className="group relative block aspect-video rounded-xl overflow-hidden border border-slate-800 hover:border-blue-500 transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
                        >
                            <img
                                src={item.thumbnail}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1"></div>
                                </div>
                            </div>
                            <div className="absolute bottom-3 right-3 bg-black/80 px-2 py-1 rounded text-xs font-bold text-white">
                                {item.duration}
                            </div>
                            <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/90 to-transparent">
                                <p className="text-white font-medium text-sm truncate">{item.title}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
