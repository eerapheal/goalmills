import Link from 'next/link';
import Image from 'next/image';

// Since this is a server component in Next.js 15 (if applicable) or 13+, params are async in recent versions but standard props in others.
// Assuming Next.js 14/15 standard behavior for now.

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-12">
            <div className="relative h-[50vh] w-full">
                <Image
                    src={`https://picsum.photos/seed/news${id}/1920/1080`}
                    alt="News Cover"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-7xl mx-auto">
                    <Link href="/news" className="text-blue-400 hover:text-blue-300 mb-4 inline-block font-medium transition-colors">
                        &larr; Back to News
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                        Detailed Report for Story #{id}
                    </h1>
                    <p className="text-slate-300 text-lg md:text-xl max-w-2xl">
                        An in-depth look at the events unfolding in the football world. This is a dynamic page for news item {id}.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="prose prose-lg prose-invert max-w-none">
                    <p className="lead text-xl text-slate-300">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                    <p>
                        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                    </p>
                    <h2 className="text-white">Analysis</h2>
                    <p>
                        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </p>
                </div>
            </div>
        </div>
    );
}
