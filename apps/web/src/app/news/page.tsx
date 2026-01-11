import Link from 'next/link';
import Image from 'next/image';
import dbConnect from '@/lib/db';
import News from '@/models/News';

export const dynamic = 'force-dynamic';

export default async function NewsPage() {
    await dbConnect();
    const news = await News.find({}).sort({ createdAt: -1 });

    return (
        <div className="min-h-screen bg-slate-950 px-6 py-12 md:px-12 pt-[115px]">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">
                    Latest <span className="text-blue-500">News</span>
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {news.map((item) => (
                        <Link
                            href={`/news/${item._id}`}
                            key={item._id.toString()}
                            className="group bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/20"
                        >
                            <div className="relative h-48 w-full overflow-hidden">
                                <Image
                                    src={item.image || `https://picsum.photos/seed/${item._id}/800/600`}
                                    alt={item.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60" />
                            </div>
                            <div className="p-6">
                                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </span>
                                <h2 className="mt-2 text-xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                                    {item.title}
                                </h2>
                                <p className="mt-3 text-slate-400 text-sm line-clamp-3">
                                    {item.excerpt}
                                </p>
                            </div>
                        </Link>
                    ))}
                    {news.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-500">
                            No news articles found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
