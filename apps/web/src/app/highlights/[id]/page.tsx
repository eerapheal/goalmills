import Link from 'next/link';

export default async function HighlightDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <div className="min-h-screen bg-slate-950 pt-24 p-6 flex flex-col items-center">
            <div className="w-full max-w-5xl">
                <Link href="/highlights" className="text-blue-400 hover:text-blue-300 mb-6 inline-block font-medium">
                    &larr; Back to Highlights
                </Link>

                <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 relative group">
                    {/* Placeholder for Video Player */}
                    <img
                        src={`https://picsum.photos/seed/highlight${id}/1280/720`}
                        alt="Video Placeholder"
                        className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <button className="bg-blue-600 hover:bg-blue-500 text-white rounded-full p-6 transition-transform hover:scale-110">
                            <svg className="w-12 h-12 fill-current" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </button>
                    </div>
                    <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded animate-pulse">
                        LIVE
                    </div>
                </div>

                <div className="mt-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Match Highlights #{id} with Amazing Plays</h1>
                    <p className="text-slate-400">Published on Dec 12, 2025 • 2.4M Views</p>
                </div>
            </div>
        </div>
    );
}
