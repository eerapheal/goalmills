import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import News from '@/models/News';

// Function to generate metadata
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await dbConnect();

    // Validate ID format (Mongodb ObjectId is 24 hex chars)
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return { title: 'News Not Found' };
    }

    const news = await News.findById(id).select('title excerpt').lean();
    if (!news) return { title: 'News Not Found' };

    return {
        title: `${news.title} | GoalMills`,
        description: news.excerpt,
    };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        notFound();
    }

    await dbConnect();
    const news = await News.findById(id).lean();

    if (!news) {
        notFound();
    }

    // Explicitly cast to any or a defined Interface to avoid "unknown" type errors
    // Since lean() returns a plain JS object, we can treat it as such or define an interface.
    // For now, using basic property access.
    const article = {
        ...news,
        _id: news._id.toString(),
        createdAt: news.createdAt ? new Date(news.createdAt as Date | string).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) : '',
    };

    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-12">
            <div className="relative h-[50vh] w-full">
                <Image
                    src={article.image || `https://picsum.photos/seed/news${id}/1920/1080`}
                    alt={article.title as string}
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
                        {article.title as string}
                    </h1>
                    {article.category && (
                        <span className="inline-block px-3 py-1 bg-blue-600/80 text-white text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                            {article.category as string}
                        </span>
                    )}
                    <p className="text-slate-300 text-lg md:text-xl max-w-2xl">
                        {article.excerpt as string}
                    </p>
                    <div className="mt-4 flex items-center gap-4 text-slate-400 text-sm">
                        <span>By {article.author as string}</span>
                        <span>•</span>
                        <span>{article.readTime as number} min read</span>
                        <span>•</span>
                        <span>{article.createdAt}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-12">
                <div
                    className="prose prose-lg prose-invert max-w-none text-slate-300 prose-headings:text-white prose-strong:text-white prose-a:text-blue-400"
                    dangerouslySetInnerHTML={{ __html: article.content as string }}
                />
            </div>
        </div>
    );
}
