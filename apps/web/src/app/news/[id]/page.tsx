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
        <div className="min-h-screen bg-slate-950 pt-[80px] md:pt-[90px] pb-12">
            <div className="relative min-h-[50vh] md:h-[65vh] w-full flex flex-col justify-end">
                <Image
                    src={article.image || `https://picsum.photos/seed/news${id}/1920/1080`}
                    alt={article.title as string}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute inset-0 bg-slate-950/20" />

                <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-12 md:pb-20">
                    <Link href="/news" className="text-blue-400 hover:text-blue-300 mb-6 inline-flex items-center gap-2 font-medium transition-colors">
                        <span>&larr;</span> Back to News
                    </Link>

                    <div className="max-w-4xl">
                        {article.category && (
                            <span className="inline-block px-3 py-1 bg-blue-600/80 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest rounded-lg mb-4">
                                {article.category as string}
                            </span>
                        )}
                        <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tighter uppercase italic">
                            {article.title as string}
                        </h1>
                        <p className="text-slate-300 text-lg md:text-2xl font-medium max-w-3xl leading-relaxed mb-8 opacity-90">
                            {article.excerpt as string}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 md:gap-6 text-slate-400 text-xs md:text-sm font-bold uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-[10px]">
                                    {String(article.author).charAt(0)}
                                </div>
                                <span>{article.author as string}</span>
                            </div>
                            <span className="hidden md:inline opacity-30">•</span>
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span>{article.readTime as number} min read</span>
                            </div>
                            <span className="hidden md:inline opacity-30">•</span>
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <span>{article.createdAt}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-16">
                <div
                    className="prose prose-lg md:prose-xl prose-invert max-w-none text-slate-300 prose-headings:text-white prose-headings:font-black prose-headings:uppercase prose-headings:italic prose-headings:tracking-tighter prose-strong:text-white prose-a:text-blue-400 hover:prose-a:text-blue-300 transition-colors"
                    dangerouslySetInnerHTML={{ __html: article.content as string }}
                />

                <div className="mt-16 pt-8 border-t border-white/10 flex justify-between items-center">
                    <Link href="/news" className="group flex items-center gap-3 text-white font-black uppercase italic tracking-tighter">
                        <span className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                            &larr;
                        </span>
                        Back to all news
                    </Link>
                </div>
            </div>
        </div>
    );
}
