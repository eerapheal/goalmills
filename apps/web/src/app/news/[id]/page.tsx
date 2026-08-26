import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import News from '@/models/News';
import Category from '@/models/Category';
import { ShareButtons } from '@/components/ShareButtons';
import ArticleTrackerAndActions from '@/components/news/ArticleTrackerAndActions';
import RecentlyViewedSection from '@/components/news/RecentlyViewedSection';
import { Metadata } from 'next';
import { FiClock, FiEye, FiTag, FiArrowLeft, FiShield } from 'react-icons/fi';
import { FaFire } from 'react-icons/fa6';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  await dbConnect();

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return { title: 'News Not Found' };
  }

  const news = await News.findById(id)
    .select('title excerpt image author createdAt category tags')
    .lean();
  if (!news) return { title: 'News Not Found' };

  const title = `${news.title} | GoalMills`;
  const description = news.excerpt || `Read ${news.title} on GoalMills.`;
  let imageUrl = news.image || '';
  if (!imageUrl || !imageUrl.startsWith('http')) {
    imageUrl = `https://res.cloudinary.com/demo/image/upload/w_1200,h_630,c_fill,g_auto/sample.jpg`;
  }

  const url = `https://goalmills-web.vercel.app/news/${id}`;

  return {
    title,
    description,
    keywords: `${news.category || 'sports'}, football news, basketball news, ${
      Array.isArray(news.tags) ? news.tags.join(', ') : ''
    }, GoalMills`,
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

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    notFound();
  }

  await dbConnect();
  const news: any = await News.findById(id).lean();

  if (!news) {
    notFound();
  }

  // Fetch category info for color accent
  const categoryDoc: any = await Category.findOne({
    $or: [{ name: news.category }, { slug: news.categorySlug }],
  }).lean();

  // You May Also Like: fetch related articles from same category or tags
  const youMayAlsoLike = await News.find({
    _id: { $ne: id },
    $or: [
      { category: news.category },
      { categorySlug: news.categorySlug },
      { tags: { $in: news.tags || [] } },
      { relatedTeam: news.relatedTeam || '' },
    ],
  })
    .sort({ views: -1, createdAt: -1 })
    .limit(4)
    .lean();

  // Trending stories
  const trendingStories = await News.find({ _id: { $ne: id } })
    .sort({ views: -1, isBreaking: -1, createdAt: -1 })
    .limit(4)
    .lean();

  const formattedDate = news.createdAt
    ? new Date(news.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  const accentColor = categoryDoc?.color || '#3B82F6';

  return (
    <main className="min-h-screen bg-[#070B12] text-white selection:bg-blue-500/30 overflow-x-hidden">
      {/* Client view tracker & reading progress bar */}
      <ArticleTrackerAndActions
        article={{
          _id: news._id.toString(),
          title: news.title,
          excerpt: news.excerpt,
          image: news.image,
          category: news.category,
          views: news.views,
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-24 md:pb-20">
        {/* Navigation & Breadcrumbs */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            href="/news"
            className="group inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition-colors"
          >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span>All News & Pulse</span>
          </Link>

          <div className="flex items-center gap-2">
            {news.isBreaking && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-red-600/20 text-red-400 border border-red-500/30 animate-pulse">
                <FaFire />
                Breaking
              </span>
            )}
            {news.category && (
              <Link
                href={`/news?category=${encodeURIComponent(news.category)}`}
                style={{
                  backgroundColor: `${accentColor}20`,
                  borderColor: `${accentColor}40`,
                  color: accentColor,
                }}
                className="px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider border hover:opacity-80 transition-opacity"
              >
                {news.category}
              </Link>
            )}
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Main Article Content (8 cols on lg) */}
          <article className="lg:col-span-8 space-y-6 max-w-full overflow-hidden">
            {/* Headline Title - Mobile first fluid typography */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight sm:leading-snug break-words">
              {news.title}
            </h1>

            {/* Author & Publication Meta Card */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-3.5 px-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shadow-lg"
                  style={{ backgroundColor: accentColor }}
                >
                  {news.author ? news.author.charAt(0).toUpperCase() : 'G'}
                </div>
                <div>
                  <div className="text-sm font-bold text-white leading-none">
                    {news.author || 'GoalMills Staff'}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <span>{formattedDate}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <FiClock size={12} /> {news.readTime || 3} min read
                    </span>
                    {typeof news.views === 'number' && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <FiEye size={12} /> {news.views.toLocaleString()} reads
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Desktop Share Buttons */}
              <div className="hidden sm:block">
                <ShareButtons
                  url={`https://goalmills-web.vercel.app/news/${id}`}
                  title={news.title}
                />
              </div>
            </div>

            {/* Featured Cover Image */}
            {news.image && (
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0E1522] shadow-2xl aspect-[16/9] w-full max-w-full">
                <Image
                  src={news.image}
                  alt={news.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </div>
            )}

            {/* Lead Excerpt */}
            {news.excerpt && (
              <div className="rounded-xl border-l-4 border-blue-500 bg-blue-500/5 p-4 sm:p-5 text-base sm:text-lg font-medium italic text-slate-200 leading-relaxed break-words">
                {news.excerpt}
              </div>
            )}

            {/* Main Article Body - Clean, safe prose with overflow control */}
            {news.content && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-8 space-y-4 max-w-full overflow-hidden">
                <div
                  className="prose prose-invert max-w-full text-slate-300 leading-relaxed text-sm sm:text-base break-words [word-break:break-word]
                    [&_p]:mb-4 [&_p]:leading-relaxed
                    [&_h2]:text-xl sm:[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:break-words
                    [&_h3]:text-lg sm:[&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-white [&_h3]:mt-4 [&_h3]:mb-2
                    [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-300 [&_blockquote]:my-4
                    [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:my-3
                    [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_ol]:my-3
                    [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-xl [&_img]:my-4
                    [&_table]:w-full [&_table]:overflow-x-auto [&_table]:block [&_table]:my-4
                    [&_a]:text-blue-400 [&_a]:underline [&_a]:break-all
                    [&_pre]:overflow-x-auto [&_pre]:p-4 [&_pre]:bg-slate-900 [&_pre]:rounded-xl"
                  dangerouslySetInnerHTML={{ __html: news.content }}
                />
              </div>
            )}

            {/* Related Team & Tags Section */}
            {(news.relatedTeam || (Array.isArray(news.tags) && news.tags.length > 0)) && (
              <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-white/10">
                {news.relatedTeam && (
                  <Link
                    href={`/news?team=${encodeURIComponent(news.relatedTeam)}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 text-blue-300 border border-blue-500/30 text-xs font-bold hover:bg-blue-600/30 transition-colors"
                  >
                    <FiShield size={14} />
                    <span>Team: {news.relatedTeam}</span>
                  </Link>
                )}

                {Array.isArray(news.tags) &&
                  news.tags.map((tag: string) => (
                    <Link
                      key={tag}
                      href={`/news?search=${encodeURIComponent(tag)}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-colors"
                    >
                      <FiTag size={12} className="text-slate-400" />
                      <span>{tag}</span>
                    </Link>
                  ))}
              </div>
            )}

            {/* You May Also Like / Recommended Section */}
            {youMayAlsoLike.length > 0 && (
              <section className="pt-8 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>💡</span> You May Also Like
                  </h3>
                  <Link
                    href="/news"
                    className="text-xs font-bold text-blue-400 hover:text-blue-300"
                  >
                    View All →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {youMayAlsoLike.map((item: any) => (
                    <Link
                      key={item._id.toString()}
                      href={`/news/${item._id}`}
                      className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] p-4 transition-all hover:border-blue-500/40"
                    >
                      {item.image && (
                        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-900 mb-3">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 360px"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-black uppercase text-blue-400">
                            {item.category || 'News'}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            • {item.readTime || 3}m read
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-sm line-clamp-2 group-hover:text-blue-400 transition-colors">
                          {item.title}
                        </h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Recently Viewed History Strip */}
            <RecentlyViewedSection currentId={id} />
          </article>

          {/* Sidebar / Trending Headlines (4 cols on lg) */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* Trending Stories Widget */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FaFire className="text-red-500" />
                    <span>Trending Stories</span>
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Hot
                  </span>
                </div>

                <div className="space-y-3">
                  {trendingStories.map((item: any, idx: number) => (
                    <Link
                      key={item._id.toString()}
                      href={`/news/${item._id}`}
                      className="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <span className="text-lg font-black text-slate-600 group-hover:text-blue-400 transition-colors w-5">
                        0{idx + 1}
                      </span>
                      {item.image && (
                        <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-900">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="80px"
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-blue-400 uppercase">
                          {item.category || 'News'}
                        </span>
                        <h4 className="text-xs font-bold text-white line-clamp-2 group-hover:text-blue-400 transition-colors">
                          {item.title}
                        </h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Quick Category Browse */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Browse by Sport
                </h4>
                <div className="flex flex-wrap gap-2">
                  {['Premier League', 'Champions League', 'Transfers', 'Tactical Analysis', 'AFCON 2025', 'NBA', 'Cricket'].map(
                    (cat) => (
                      <Link
                        key={cat}
                        href={`/news?category=${encodeURIComponent(cat)}`}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                      >
                        {cat}
                      </Link>
                    )
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
