import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import News from '@/models/News';
import { ShareButtons } from '@/components/ShareButtons';

// Function to generate metadata
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await dbConnect();

    // Validate ID format (Mongodb ObjectId is 24 hex chars)
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return { title: 'News Not Found' };
    }

    const news = await News.findById(id).select('title excerpt image author createdAt category').lean();
    if (!news) return { title: 'News Not Found' };

    const title = `${news.title} | GoalMills`;
    const description = `${news.excerpt}` || `Read ${news.title} on GoalMills - Your source for sports news and live scores.`;

    // Ensure absolute URL for OG image - OG validators require full URLs
    let imageUrl = `${news.image}` || '';

    // If no image or relative path, use a default OG-compliant image
    if (!imageUrl || !imageUrl.startsWith('http')) {
        // Use a reliable Cloudinary demo image as fallback
        imageUrl = `https://res.cloudinary.com/demo/image/upload/w_1200,h_630,c_fill,g_auto/sample.jpg`;
    }

    // Log for debugging OG issues (appears in server logs)
    console.log('[OG Debug] News ID:', id, '| Image URL:', imageUrl);

    const url = `https://goalmills-web.vercel.app/news/${id}`;
    const publishedTime = news.createdAt ? new Date(news.createdAt as Date | string).toISOString() : new Date().toISOString();

    return {
        title,
        description,
        keywords: `${news.category || 'sports'}, football news, sports updates, live score, highlight video, cricket, tennis, basketball ${news.author}, GoalMills`,
        authors: [{ name: news.author as string }],
        creator: news.author as string,
        publisher: 'GoalMills',

        // Open Graph
        openGraph: {
            type: 'article',
            title,
            description,
            url,
            siteName: 'GoalMills',
            images: [
                {
                    url: imageUrl,
                    secureUrl: imageUrl, // Explicitly set secure URL for HTTPS
                    width: 1200,
                    height: 630,
                    alt: news.title as string,
                    type: 'image/jpeg', // Explicitly specify image type for OG validators
                },
            ],
            locale: 'en_US',
            publishedTime,
            authors: [news.author as string],
            section: news.category as string || 'Sports',
        },

        // Twitter Card
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
            creator: '@goalmills',
            site: '@goalmills',
        },

        // Additional metadata
        alternates: {
            canonical: url,
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
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
        <div className="min-h-screen bg-slate-950 pb-12 overflow-x-hidden">
            {/* Hero Section */}
            <div className="relative w-full flex flex-col justify-end overflow-hidden">
                <Image
                    src={article.image || `https://picsum.photos/seed/news${id}/1920/1080`}
                    alt={article.title as string}
                    fill
                    className="object-cover scale-105 animate-pulse-slow"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                <div className="absolute inset-0 bg-slate-950/20" />

                <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-10 pb-12 md:pt-48 md:pb-32">
                    <Link href="/news" className="text-blue-400 hover:text-blue-300 mb-8 inline-flex items-center gap-2 font-black uppercase tracking-widest text-xs transition-all hover:-translate-x-1">
                        <span className="text-lg">←</span> Back to News
                    </Link>

                    <div className="max-w-5xl">
                        {article.category && (
                            <span className="inline-block px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-6 shadow-xl shadow-blue-600/20">
                                {article.category as string}
                            </span>
                        )}
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-8 leading-tight tracking-tighter uppercase italic break-words">
                            {article.title as string}
                        </h1>
                        <p className="text-slate-300 text-xl md:text-3xl font-medium max-w-4xl leading-relaxed mb-10 opacity-90 border-l-4 border-blue-500 pl-6 italic break-words">
                            {article.excerpt as string}
                        </p>

                        <div className="flex flex-wrap items-center gap-6 md:gap-8 text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 p-[2px]">
                                    <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-white font-black">
                                        {String(article.author).charAt(0)}
                                    </div>
                                </div>
                                <span className="text-white">{article.author as string}</span>
                            </div>

                            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full backdrop-blur-md">
                                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span>{article.readTime as number} min read</span>
                            </div>

                            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full backdrop-blur-md">
                                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <span>{article.createdAt}</span>
                            </div>

                            {article.source && (
                                <div className="flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full backdrop-blur-md border border-blue-500/20">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.1-1.1" /></svg>
                                    <span>Source: {article.source as string}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-4xl mx-auto px-6 py-20">
                <div
                    className="prose prose-invert prose-blue prose-xl max-w-none text-slate-300 
                    prose-headings:text-white prose-headings:font-black prose-headings:uppercase prose-headings:italic prose-headings:tracking-tighter 
                    prose-p:leading-[1.8] prose-p:mb-8
                    prose-strong:text-white prose-strong:font-black
                    prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-a:no-underline prose-a:border-b prose-a:border-blue-500/30 hover:prose-a:border-blue-500 transition-all
                    prose-img:rounded-3xl prose-img:shadow-2xl prose-img:my-12
                    prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-500/5 prose-blockquote:py-2 prose-blockquote:px-8 prose-blockquote:rounded-r-2xl prose-blockquote:italic prose-blockquote:text-slate-200
                    break-words overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: article.content as string }}
                />

                <div className="mt-24 pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <Link href="/news" className="group flex items-center gap-4 text-white font-black uppercase italic tracking-tighter text-2xl transition-all hover:scale-105">
                        <span className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-600/30 group-hover:bg-blue-500 group-hover:rotate-12 transition-all">
                            ←
                        </span>
                        Back to all news
                    </Link>

                    <ShareButtons
                        url={`https://goalmills-web.vercel.app/news/${id}`}
                        title={article.title as string}
                    />
                </div>
            </div>
        </div>
    );
}
