import Link from 'next/link';
import Image from 'next/image';

const MOCK_NEWS = Array.from({ length: 10 }).map((_, i) => ({
    id: i + 1,
    title: `Latest Football News Impact - Story ${i + 1}`,
    summary: 'Breaking news from the world of football. Read more to find out what happened today.',
    date: '2 hours ago',
    image: `https://picsum.photos/seed/news${i + 1}/800/600`, // Placeholder
}));

export default function NewsPage() {
    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-12 mt-[90px]">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">
                    Latest <span className="text-blue-500">News</span>
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_NEWS.map((item) => (
                        <Link
                            href={`/news/${item.id}`}
                            key={item.id}
                            className="group bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/20"
                        >
                            <div className="relative h-48 w-full overflow-hidden">
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60" />
                            </div>
                            <div className="p-6">
                                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">{item.date}</span>
                                <h2 className="mt-2 text-xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                                    {item.title}
                                </h2>
                                <p className="mt-3 text-slate-400 text-sm line-clamp-3">
                                    {item.summary}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
