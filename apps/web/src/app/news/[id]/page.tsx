import Link from 'next/link';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import News from '@/models/News';
import { ShareButtons } from '@/components/ShareButtons';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  await dbConnect();

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return { title: 'News Not Found' };
  }

  const news = await News.findById(id).select('title excerpt image author createdAt category').lean();
  if (!news) return { title: 'News Not Found' };

  const title = `${news.title} | GoalMills`;
  const description = `${news.excerpt}` || `Read ${news.title} on GoalMills.`;
  let imageUrl = `${news.image}` || '';
  if (!imageUrl || !imageUrl.startsWith('http')) {
    imageUrl = `https://res.cloudinary.com/demo/image/upload/w_1200,h_630,c_fill,g_auto/sample.jpg`;
  }

  const url = `https://goalmills-web.vercel.app/news/${id}`;

  return {
    title,
    description,
    keywords: `${news.category || 'sports'}, football news, basketball news, sports updates, GoalMills`,
    authors: [{ name: news.author as string }],
    publisher: 'GoalMills',
    openGraph: {
      type: 'article',
      title,
      description,
      url,
      siteName: 'GoalMills',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: news.title as string,
        },
      ],
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    notFound();
  }

  await dbConnect();
  const news = await News.findById(id).lean();

  if (!news) {
    notFound();
  }

  const relatedNews = await News.find({ _id: { $ne: id } })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();

  const formattedDate = news.createdAt
    ? new Date(news.createdAt as Date | string).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <main className="min-h-screen bg-[#0B0F17] text-white selection:bg-blue-500/30">
      <div className="mx-auto max-w-5xl px-4 pt-24 pb-20">
        {/* Back Link */}
        <Link
          href="/"
          className="group mb-6 inline-flex items-center space-x-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <span>← Back to Feed</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Article Content */}
          <article className="lg:col-span-2 space-y-6">
            {/* Cover Image */}
            {news.image && (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#141C2B] shadow-2xl">
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full aspect-video object-cover"
                />
              </div>
            )}

            {/* Article Header Card */}
            <div className="rounded-2xl border border-white/10 bg-[#141C2B] p-6 shadow-xl space-y-4">
              <div className="flex items-center space-x-3">
                {news.category && (
                  <span className="rounded-md border border-white/10 bg-blue-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    {news.category}
                  </span>
                )}
                <span className="text-xs text-slate-400">⏱️ {news.readTime || 3} min read</span>
              </div>

              <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
                {news.title}
              </h1>

              {/* Author & Meta */}
              <div className="flex items-center justify-between border-t border-b border-white/5 py-3">
                <div className="flex items-center space-x-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow">
                    {news.author ? news.author.charAt(0).toUpperCase() : 'G'}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{news.author || 'GoalMills Staff'}</div>
                    <div className="text-[11px] text-slate-400">{formattedDate}</div>
                  </div>
                </div>

                <ShareButtons url={`https://goalmills-web.vercel.app/news/${id}`} title={news.title} />
              </div>

              {/* Excerpt */}
              {news.excerpt && (
                <p className="text-base font-medium italic text-slate-300 leading-relaxed border-l-2 border-blue-500 pl-4">
                  {news.excerpt}
                </p>
              )}

              {/* Article Content */}
              {news.content && (
                <div
                  className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-sm md:text-base pt-2 space-y-4"
                  dangerouslySetInnerHTML={{ __html: news.content }}
                />
              )}
            </div>
          </article>

          {/* Related Stories Sidebar */}
          <aside className="space-y-4">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Trending Stories
            </h2>

            {relatedNews.map((item: any) => (
              <Link
                key={item._id.toString()}
                href={`/news/${item._id}`}
                className="group flex space-x-3 rounded-xl border border-white/10 bg-[#141C2B] p-3 transition-all hover:border-white/20 hover:bg-[#1A2333]"
              >
                {item.image && (
                  <div className="relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-slate-900">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase text-blue-400">
                    {item.category || 'News'}
                  </span>
                  <h3 className="line-clamp-2 text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>
              </Link>
            ))}
          </aside>
        </div>
      </div>
    </main>
  );
}
