import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import News from '@/models/News';
import Category from '@/models/Category';
import { ShareButtons } from '@/components/ShareButtons';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import ArticleTrackerAndActions from '@/components/news/ArticleTrackerAndActions';
import RecentlyViewedSection from '@/components/news/RecentlyViewedSection';
import { SmartRelatedContent } from '@/components/SmartRelatedContent';
import { generateArticleSchema } from '@/lib/seo/schemaGenerator';
import { EntityBreadcrumbItem } from '@goalmills/types';
import { Metadata } from 'next';
import {
  FiClock,
  FiEye,
  FiTag,
  FiArrowLeft,
  FiShield,
  FiArrowRight,
  FiUser,
  FiAward,
} from 'react-icons/fi';
import { FaFire } from 'react-icons/fa6';

export const dynamic = 'force-dynamic';

// Helper to cleanly split rich HTML article content at ~50% word count
function splitContentAtMidpoint(content: string): { firstHalf: string; secondHalf: string } {
  if (!content) return { firstHalf: '', secondHalf: '' };

  const getWordCount = (html: string) => {
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
  };

  const totalWords = getWordCount(content);
  if (totalWords < 40) {
    return { firstHalf: content, secondHalf: '' };
  }

  const targetWords = totalWords * 0.5;
  const blockRegex = /(<\/(?:p|blockquote|figure|h2|h3|h4|div|section)>)/i;
  const parts = content.split(blockRegex);

  if (parts.length > 2) {
    let accumulatedWords = 0;
    let splitIndex = -1;

    for (let i = 0; i < parts.length; i += 2) {
      const segment = parts[i] + (parts[i + 1] || '');
      accumulatedWords += getWordCount(segment);

      if (accumulatedWords >= targetWords && i + 2 < parts.length) {
        splitIndex = i + 2;
        break;
      }
    }

    if (splitIndex !== -1) {
      return {
        firstHalf: parts.slice(0, splitIndex).join(''),
        secondHalf: parts.slice(splitIndex).join(''),
      };
    }
  }

  const newlineParts = content.split(/(\n\s*\n)/);
  if (newlineParts.length > 2) {
    let accumulatedWords = 0;
    let splitIndex = -1;
    for (let i = 0; i < newlineParts.length; i += 2) {
      const segment = newlineParts[i] + (newlineParts[i + 1] || '');
      accumulatedWords += getWordCount(segment);
      if (accumulatedWords >= targetWords && i + 2 < newlineParts.length) {
        splitIndex = i + 2;
        break;
      }
    }
    if (splitIndex !== -1) {
      return {
        firstHalf: newlineParts.slice(0, splitIndex).join(''),
        secondHalf: newlineParts.slice(splitIndex).join(''),
      };
    }
  }

  return { firstHalf: content, secondHalf: '' };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  await dbConnect();

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return { title: 'News Not Found | GoalMills' };
  }

  const news = await News.findById(id)
    .select('title excerpt image author createdAt category tags competition')
    .lean();
  if (!news) return { title: 'News Not Found | GoalMills' };

  const title = `${news.title} | GoalMills`;
  const description = news.excerpt || `Read ${news.title} on GoalMills.`;
  let imageUrl = news.image || '';
  if (!imageUrl || !imageUrl.startsWith('http')) {
    imageUrl = `https://res.cloudinary.com/demo/image/upload/w_1200,h_630,c_fill,g_auto/sample.jpg`;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://goalmills.com';
  const url = `${baseUrl}/news/${id}`;

  return {
    title,
    description,
    keywords: `${news.category || 'sports'}, football news, transfers, ${news.competition || ''}, ${
      Array.isArray(news.tags) ? news.tags.join(', ') : ''
    }, GoalMills`,
    authors: [{ name: news.author as string }],
    publisher: 'GoalMills',
    alternates: {
      canonical: url,
    },
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
  const news: any = await News.findById(id).lean();

  if (!news) {
    notFound();
  }

  const categoryDoc: any = await Category.findOne({
    $or: [{ name: news.category }, { slug: news.categorySlug }],
  }).lean();

  // Multi-dimensional related content matching (Same Player + Same Team + Same Competition + Topic)
  const teamSlugs = Array.isArray(news.teams) ? news.teams.map((t: any) => t.slug) : [];
  const playerSlugs = Array.isArray(news.players) ? news.players.map((p: any) => p.slug) : [];

  let inContentRelated: any[] = await News.find({
    _id: { $ne: id },
    $or: [
      { 'players.slug': { $in: playerSlugs } },
      { 'teams.slug': { $in: teamSlugs } },
      { competitionSlug: news.competitionSlug },
      { category: news.category },
      { tags: { $in: news.tags || [] } },
      { relatedTeam: news.relatedTeam || '' },
    ],
  })
    .sort({ views: -1, createdAt: -1 })
    .limit(3)
    .lean();

  if (inContentRelated.length < 3) {
    const existingIds = [id, ...inContentRelated.map((n: any) => n._id.toString())];
    const backfill = await News.find({
      _id: { $nin: existingIds },
    })
      .sort({ isBreaking: -1, views: -1, createdAt: -1 })
      .limit(3 - inContentRelated.length)
      .lean();
    inContentRelated = [...inContentRelated, ...backfill];
  }

  const excludedIds = [id, ...inContentRelated.map((n: any) => n._id.toString())];
  const moreStories = await News.find({
    _id: { $nin: excludedIds },
  })
    .sort({ views: -1, createdAt: -1 })
    .limit(4)
    .lean();

  const trendingStories = await News.find({ _id: { $ne: id } })
    .sort({ views: -1, isBreaking: -1, createdAt: -1 })
    .limit(4)
    .lean();

  const { firstHalf, secondHalf } = splitContentAtMidpoint(news.content || '');

  const formattedDate = news.createdAt
    ? new Date(news.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  const accentColor = categoryDoc?.color || '#3B82F6';

  // Dynamic 4-Level Breadcrumbs
  const breadcrumbItems: EntityBreadcrumbItem[] = [
    { name: news.sport || 'Football', url: `/${news.sportSlug || 'football'}` },
  ];

  if (news.competitionSlug && news.competition) {
    breadcrumbItems.push({
      name: news.competition,
      url: `/football/${news.competitionSlug}`,
    });
  }

  if (Array.isArray(news.teams) && news.teams.length > 0) {
    const primaryTeam = news.teams[0];
    const compSlug = news.competitionSlug || 'premier-league';
    breadcrumbItems.push({
      name: primaryTeam.name,
      url: `/football/${compSlug}/${primaryTeam.slug}`,
    });
  }

  breadcrumbItems.push({
    name: news.title,
    url: `/news/${id}`,
  });

  const articleJsonLd = generateArticleSchema({
    id: news._id.toString(),
    title: news.title,
    excerpt: news.excerpt,
    image: news.image,
    createdAt: news.createdAt,
    updatedAt: news.updatedAt,
    authorName: news.author,
    authorUrl: news.authorSlug ? `/authors/${news.authorSlug}` : undefined,
  });

  return (
    <main className="min-h-screen bg-[#070B12] text-white selection:bg-blue-500/30 overflow-x-hidden pt-24 pb-20">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

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

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Dynamic 4-Level Breadcrumb Bar */}
        <div className="mb-4">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Main Article Content */}
          <article className="lg:col-span-8 space-y-6 max-w-full overflow-hidden">
            {/* Entity Hub Navigation Links (Part 3 Requirement) */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {news.isBreaking && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-red-600/20 text-red-400 border border-red-500/30 animate-pulse">
                  <FaFire />
                  Breaking
                </span>
              )}
              {news.competition && news.competitionSlug && (
                <Link
                  href={`/football/${news.competitionSlug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 text-xs font-bold hover:bg-blue-500/25 transition-colors"
                >
                  <FiAward size={13} />
                  <span>{news.competition} Hub</span>
                </Link>
              )}
              {Array.isArray(news.teams) &&
                news.teams.map((t: any) => (
                  <Link
                    key={t.slug}
                    href={`/football/${news.competitionSlug || 'premier-league'}/${t.slug}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs font-bold hover:bg-purple-500/25 transition-colors"
                  >
                    <FiShield size={13} />
                    <span>{t.name}</span>
                  </Link>
                ))}
              {Array.isArray(news.players) &&
                news.players.map((p: any) => (
                  <Link
                    key={p.slug}
                    href={`/players/${p.slug}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/25 transition-colors"
                  >
                    <FiUser size={13} />
                    <span>{p.name} Profile</span>
                  </Link>
                ))}
            </div>

            {/* Headline Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight sm:leading-snug break-words">
              {news.title}
            </h1>

            {/* Author & Publication Meta Card */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-3.5 px-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <Link
                href={
                  news.authorSlug ? `/authors/${news.authorSlug}` : `/authors/goalmills-editorial`
                }
                className="group flex items-center gap-3"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shadow-lg flex-shrink-0"
                  style={{ backgroundColor: accentColor }}
                >
                  {news.author ? news.author.charAt(0).toUpperCase() : 'G'}
                </div>
                <div>
                  <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                    <span>{news.author || 'GoalMills Staff'}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">
                      Author
                    </span>
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
              </Link>

              <div className="hidden sm:block">
                <ShareButtons
                  url={`https://goalmills-web.vercel.app/news/${id}`}
                  title={news.title}
                />
              </div>
            </div>

            {/* Featured Cover Image */}
            {news.image && (
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0E1522] shadow-2xl aspect-[16/9] sm:aspect-[21/9] max-h-[240px] sm:max-h-[460px] w-full max-w-full">
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

            {/* Main Article Body */}
            {news.content && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-8 space-y-4 max-w-full overflow-hidden">
                <div
                  className="prose prose-invert max-w-full text-slate-100 leading-relaxed text-sm sm:text-base break-words [word-break:break-word]"
                  dangerouslySetInnerHTML={{ __html: firstHalf || news.content }}
                />

                {/* In-Article "You May Also Like" */}
                {inContentRelated.length > 0 && (
                  <div className="my-5 sm:my-8 rounded-2xl border border-blue-500/20 bg-gradient-to-b from-[#0c162d]/90 via-[#0a1122]/90 to-[#070c18]/95 p-3 sm:p-5 shadow-2xl backdrop-blur-md">
                    <div className="flex items-center justify-between gap-2 pb-2.5 sm:pb-3.5 mb-3 sm:mb-4 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg sm:rounded-xl bg-blue-600/30 text-blue-400 text-xs sm:text-sm shadow-inner">
                          ⚡
                        </span>
                        <div>
                          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                            Related Sports Intelligence
                          </h3>
                          <p className="text-[10px] sm:text-[11px] text-slate-400">
                            Contextual stories linked to this match & entity
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                      {inContentRelated.map((item: any) => (
                        <Link
                          key={item._id.toString()}
                          href={`/news/${item._id}`}
                          className="group flex flex-col justify-between rounded-xl border border-white/10 bg-slate-900/80 hover:bg-slate-800/90 p-2 sm:p-3 transition-all duration-300 hover:border-blue-500/50"
                        >
                          <div>
                            {item.image && (
                              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-950 mb-2">
                                <Image
                                  src={item.image}
                                  alt={item.title}
                                  fill
                                  sizes="250px"
                                  className="object-cover group-hover:scale-105 transition-transform"
                                />
                              </div>
                            )}
                            <span className="text-[9px] font-black uppercase text-blue-400 block mb-1">
                              {item.category || item.competition || 'News'}
                            </span>
                            <h4 className="text-xs font-bold text-white line-clamp-2 group-hover:text-blue-400 transition-colors">
                              {item.title}
                            </h4>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {secondHalf && (
                  <div
                    className="prose prose-invert max-w-full text-slate-100 leading-relaxed text-sm sm:text-base break-words [word-break:break-word]"
                    dangerouslySetInnerHTML={{ __html: secondHalf }}
                  />
                )}
              </div>
            )}

            {/* Related Tags */}
            {Array.isArray(news.tags) && news.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-white/10">
                {news.tags.map((tag: string) => (
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

            {/* Bottom More Stories Section */}
            {moreStories.length > 0 && (
              <section className="pt-8 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>💡</span> More Related Stories
                  </h3>
                  <Link
                    href="/news"
                    className="text-xs font-bold text-blue-400 hover:text-blue-300"
                  >
                    View All →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {moreStories.map((item: any) => (
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
                            sizes="360px"
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-black uppercase text-blue-400">
                            {item.category || item.competition || 'News'}
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

            <SmartRelatedContent
              currentId={id}
              sportSlug={news.sport}
              categorySlug={news.category}
              teamSlug={news.team}
              title="Recommended Tactical & Related Intel"
            />

            <RecentlyViewedSection currentId={id} />
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* Trending Stories */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FaFire className="text-red-500" />
                    <span>Trending Headlines</span>
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
                          {item.category || item.competition || 'News'}
                        </span>
                        <h4 className="text-xs font-bold text-white line-clamp-2 group-hover:text-blue-400 transition-colors">
                          {item.title}
                        </h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
