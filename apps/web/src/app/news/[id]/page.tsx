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

import { getNewsUrl, slugify } from '@/lib/slugUtils';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  await dbConnect();

  const decoded = decodeURIComponent(id);
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(decoded);
  // Only serve published articles (or legacy docs without a status field)
  const statusFilter = { $or: [{ status: 'published' }, { status: { $exists: false } }] };
  const query = isObjectId
    ? { $and: [{ $or: [{ _id: decoded }, { slug: decoded }] }, statusFilter] }
    : { $and: [{ slug: decoded }, statusFilter] };

  let news: any = await News.findOne(query)
    .select('title slug excerpt image author createdAt category tags competition')
    .lean();

  if (!news && !isObjectId) {
    const slugClean = decoded.replace(/-/g, ' ');
    news = await News.findOne({
      $and: [
        {
          $or: [
            { slug: decoded },
            { title: { $regex: new RegExp(`^${decoded.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i') } },
            { title: { $regex: new RegExp(slugClean, 'i') } },
          ],
        },
        statusFilter,
      ],
    })
      .select('title slug excerpt image author createdAt category tags competition')
      .lean();
  }

  if (!news) return { title: 'News Not Found | GoalMills' };

  const title = `${news.title} | GoalMills`;
  const description = news.excerpt || `Read ${news.title} on GoalMills.`;
  let imageUrl = news.image || '';
  if (!imageUrl || !imageUrl.startsWith('http')) {
    imageUrl = `https://res.cloudinary.com/demo/image/upload/w_1200,h_630,c_fill,g_auto/sample.jpg`;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://goalmills.com';
  const canonicalSlug = news.slug || (news.title ? slugify(news.title) : '') || news._id.toString();
  const url = `${baseUrl}/news/${canonicalSlug}`;

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
  await dbConnect();

  const decoded = decodeURIComponent(id);
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(decoded);
  // Only serve published articles (or legacy docs without a status field)
  const statusFilter = { $or: [{ status: 'published' }, { status: { $exists: false } }] };
  const query = isObjectId
    ? { $and: [{ $or: [{ _id: decoded }, { slug: decoded }] }, statusFilter] }
    : { $and: [{ slug: decoded }, statusFilter] };

  let news: any = await News.findOne(query).lean();

  if (!news && !isObjectId) {
    const slugClean = decoded.replace(/-/g, ' ');
    news = await News.findOne({
      $and: [
        {
          $or: [
            { slug: decoded },
            { title: { $regex: new RegExp(`^${decoded.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i') } },
            { title: { $regex: new RegExp(slugClean, 'i') } },
          ],
        },
        statusFilter,
      ],
    }).lean();
  }

  if (!news) {
    notFound();
  }

  const currentDocId = news._id.toString();

  const categoryDoc: any = await Category.findOne({
    $or: [{ name: news.category }, { slug: news.categorySlug }],
  }).lean();

  // Multi-dimensional related content matching (Same Player + Same Team + Same Competition + Topic)
  const teamSlugs = Array.isArray(news.teams) ? news.teams.map((t: any) => t.slug) : [];
  const playerSlugs = Array.isArray(news.players) ? news.players.map((p: any) => p.slug) : [];

  let inContentRelated: any[] = await News.find({
    _id: { $ne: currentDocId },
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
    const existingIds = [currentDocId, ...inContentRelated.map((n: any) => n._id.toString())];
    const backfill = await News.find({
      _id: { $nin: existingIds },
    })
      .sort({ isBreaking: -1, views: -1, createdAt: -1 })
      .limit(3 - inContentRelated.length)
      .lean();
    inContentRelated = [...inContentRelated, ...backfill];
  }

  const excludedIds = [currentDocId, ...inContentRelated.map((n: any) => n._id.toString())];
  const moreStories = await News.find({
    _id: { $nin: excludedIds },
  })
    .sort({ views: -1, createdAt: -1 })
    .limit(4)
    .lean();

  const trendingStories = await News.find({ _id: { $ne: currentDocId } })
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
    url: getNewsUrl(news),
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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://goalmills.com';
  const canonicalSlug = news.slug || (news.title ? slugify(news.title) : '') || currentDocId;
  const articleUrl = `${baseUrl}/news/${canonicalSlug}`;

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
          slug: news.slug || slugify(news.title),
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
                <div className="relative h-10 w-10 overflow-hidden rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-sm font-bold text-amber-400">
                  {news.authorPhoto ? (
                    <Image
                      src={news.authorPhoto}
                      alt={news.author || 'Author'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span>{(news.author || 'G')[0]}</span>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                    {news.author || 'GoalMills Staff'}
                  </h4>
                  <p className="text-[10px] text-slate-400 capitalize">
                    {news.authorRole || 'Editorial Columnist'}
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <FiClock className="text-blue-400" />
                  <span>{formattedDate}</span>
                </span>
                <span className="flex items-center gap-1">
                  <FiEye className="text-emerald-400" />
                  <span>{(news.views || 0) + 1} reads</span>
                </span>
              </div>
            </div>

            {/* Featured Cover Image */}
            {news.image && (
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">
                <Image
                  src={news.image}
                  alt={news.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 800px"
                  className="object-cover"
                />
                {news.source && (
                  <div className="absolute bottom-3 right-3 rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] text-slate-300 border border-white/10">
                    Source: {news.source}
                  </div>
                )}
              </div>
            )}

            {/* Lead Excerpt */}
            {news.excerpt && (
              <p className="text-base sm:text-lg font-medium text-slate-200 leading-relaxed border-l-4 border-blue-500 pl-4 py-1 italic bg-blue-500/[0.03] rounded-r-xl">
                {news.excerpt}
              </p>
            )}

            {/* Mid-Article Share Bar */}
            <div className="py-2 border-y border-white/10 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Share Article
              </span>
              <ShareButtons url={articleUrl} title={news.title} />
            </div>

            {/* Main Article Body */}
            {news.content && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-8 space-y-4 max-w-full overflow-hidden">
                <div
                  className="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed space-y-4
                    prose-headings:text-white prose-headings:font-black prose-headings:tracking-tight
                    prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-blue-300
                    prose-h3:text-lg sm:prose-h3:text-xl prose-h3:text-amber-300
                    prose-p:text-slate-300 prose-p:text-sm sm:prose-p:text-base prose-p:leading-relaxed
                    prose-strong:text-white prose-strong:font-bold
                    prose-a:text-blue-400 prose-a:underline hover:prose-a:text-blue-300
                    prose-blockquote:border-l-amber-500 prose-blockquote:bg-amber-500/[0.05] prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-xl prose-blockquote:text-slate-200
                    prose-img:rounded-2xl prose-img:border prose-img:border-white/10"
                  dangerouslySetInnerHTML={{ __html: firstHalf }}
                />

                {/* In-Article "You May Also Like" */}
                {inContentRelated.length > 0 && (
                  <div className="my-8 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-950/40 via-slate-950/60 to-purple-950/30 p-4 sm:p-5 backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-xs">
                        ★
                      </span>
                      <h4 className="text-xs font-black uppercase tracking-wider text-blue-300">
                        Key Tactical & Related Intel
                      </h4>
                    </div>
                    <div className="space-y-2.5">
                      {inContentRelated.map((rel: any) => (
                        <Link
                          key={rel._id.toString()}
                          href={getNewsUrl(rel)}
                          className="group flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] hover:bg-blue-500/10 border border-white/5 hover:border-blue-500/30 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {rel.image && (
                              <div className="relative h-10 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-slate-900">
                                <Image
                                  src={rel.image}
                                  alt={rel.title}
                                  fill
                                  sizes="56px"
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <span className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                              {rel.title}
                            </span>
                          </div>
                          <FiArrowRight
                            size={14}
                            className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2"
                          />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {secondHalf && (
                  <div
                    className="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed space-y-4
                      prose-headings:text-white prose-headings:font-black prose-headings:tracking-tight
                      prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-blue-300
                      prose-h3:text-lg sm:prose-h3:text-xl prose-h3:text-amber-300
                      prose-p:text-slate-300 prose-p:text-sm sm:prose-p:text-base prose-p:leading-relaxed
                      prose-strong:text-white prose-strong:font-bold
                      prose-a:text-blue-400 prose-a:underline hover:prose-a:text-blue-300
                      prose-blockquote:border-l-amber-500 prose-blockquote:bg-amber-500/[0.05] prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-xl prose-blockquote:text-slate-200
                      prose-img:rounded-2xl prose-img:border prose-img:border-white/10"
                    dangerouslySetInnerHTML={{ __html: secondHalf }}
                  />
                )}
              </div>
            )}

            {/* Related Tags */}
            {Array.isArray(news.tags) && news.tags.length > 0 && (
              <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 font-bold mr-1">Tags:</span>
                {news.tags.map((tag: string) => (
                  <Link
                    key={tag}
                    href={`/news?search=${encodeURIComponent(tag)}`}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-white/[0.04] hover:bg-blue-500/15 border border-white/10 hover:border-blue-500/30 text-xs font-semibold text-slate-300 hover:text-white transition-all"
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
                      href={getNewsUrl(item)}
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
              currentId={currentDocId}
              sportSlug={news.sport}
              categorySlug={news.category}
              teamSlug={news.team}
              title="Recommended Tactical & Related Intel"
            />

            <RecentlyViewedSection currentId={currentDocId} />
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
                      href={getNewsUrl(item)}
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
