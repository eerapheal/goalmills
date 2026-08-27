import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import dbConnect from '@/lib/db';
import News from '@/models/News';
import { EntityService, COMPETITIONS_REGISTRY, CLUBS_REGISTRY } from '@/lib/entityService';
import { ContentHubLayout } from '@/components/ContentHubLayout';
import { RelatedArticlesMatrix } from '@/components/RelatedArticlesMatrix';
import { TransferCenterCard } from '@/components/TransferCenterCard';
import { FootballScreen } from '@/components/FootballScreen';
import { FiArrowRight, FiShield, FiTrendingUp, FiZap, FiAward } from 'react-icons/fi';
import { BlogPost } from '@goalmills/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Football World Hub: Competitions, Clubs, Live Matches & Intelligence | GoalMills',
  description:
    'Complete football intelligence network: Premier League, Champions League, La Liga, Serie A, African Football, live scores, confirmed transfers, and tactical breakdowns.',
};

export default async function FootballHubPage() {
  let featuredArticles: BlogPost[] = [];
  let transferArticles: BlogPost[] = [];
  let tacticalArticles: BlogPost[] = [];

  try {
    await dbConnect();
    const [allDocs, transferDocs, tacticalDocs] = await Promise.all([
      News.find({
        $or: [
          { sportSlug: 'football' },
          { category: { $regex: /football|premier|champions|liga|serie|bundesliga/i } },
        ],
      })
        .sort({ isBreaking: -1, views: -1, createdAt: -1 })
        .limit(6)
        .lean(),
      News.find({
        $or: [
          { articleType: 'transfer' },
          { category: { $regex: /transfer/i } },
          { tags: { $in: ['Transfers', 'Transfer Window'] } },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(3)
        .lean(),
      News.find({
        $or: [
          { articleType: 'tactical_analysis' },
          { category: { $regex: /analysis|tactics/i } },
        ],
      })
        .sort({ views: -1, createdAt: -1 })
        .limit(3)
        .lean(),
    ]);

    featuredArticles = JSON.parse(JSON.stringify(allDocs));
    transferArticles = JSON.parse(JSON.stringify(transferDocs));
    tacticalArticles = JSON.parse(JSON.stringify(tacticalDocs));
  } catch (err) {
    console.error('Error loading football hub data:', err);
  }

  const competitions = EntityService.getAllCompetitions();
  const topTransfers = EntityService.getTransfers().slice(0, 2);
  const featuredClubs = Object.values(CLUBS_REGISTRY).slice(0, 6);

  return (
    <ContentHubLayout
      breadcrumbs={[{ name: 'Football Hub', url: '/football' }]}
      header={
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#0a1633] via-[#081226] to-[#040813] p-6 sm:p-10 shadow-2xl">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-black uppercase tracking-widest">
              <span>⚽</span> LEVEL 1 SPORT ECOSYSTEM
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Global Football Intelligence Network
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Explore European elite leagues, CAF championships, live scores, club hubs, player
              profiles, confirmed transfer intel, and tactical analysis.
            </p>

            {/* Quick Competitions Ribbon */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {competitions.map((comp) => (
                <Link
                  key={comp.slug}
                  href={`/football/${comp.slug}`}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/40 text-xs font-bold text-slate-200 hover:text-white transition-all shadow-md"
                >
                  {comp.logo && (
                    <Image
                      src={comp.logo}
                      alt={comp.name}
                      width={18}
                      height={18}
                      className="object-contain"
                    />
                  )}
                  <span>{comp.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      }
      sidebar={
        <div className="space-y-6">
          {/* Competitions Quick Navigator */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiAward className="text-blue-400" />
                <span>Major Competitions</span>
              </h3>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Level 2 Hubs</span>
            </div>
            <div className="space-y-2">
              {competitions.map((comp) => (
                <Link
                  key={comp.slug}
                  href={`/football/${comp.slug}`}
                  className="group flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] hover:bg-blue-600/20 border border-white/5 hover:border-blue-500/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-8 w-8 rounded-lg bg-slate-900 p-1 flex items-center justify-center">
                      <Image
                        src={comp.logo}
                        alt={comp.name}
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                        {comp.name}
                      </h4>
                      <p className="text-[10px] text-slate-400">{comp.country}</p>
                    </div>
                  </div>
                  <FiArrowRight
                    size={14}
                    className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Featured Club Hubs */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiShield className="text-amber-400" />
                <span>Featured Club Hubs</span>
              </h3>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Level 3</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {featuredClubs.map((club) => (
                <Link
                  key={club.slug}
                  href={`/football/${club.competitionSlug}/${club.slug}`}
                  className="group flex flex-col items-center text-center p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-blue-500/30 transition-all"
                >
                  <div className="relative h-10 w-10 rounded-xl bg-slate-900 p-1.5 mb-2 flex items-center justify-center">
                    <Image
                      src={club.logo}
                      alt={club.name}
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-white truncate max-w-full">
                    {club.shortName}
                  </span>
                  <span className="text-[9px] text-slate-500 font-semibold">{club.manager}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Trending Transfers Snippet */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiTrendingUp className="text-emerald-400" />
                <span>Transfer Desk</span>
              </h3>
              <Link href="/transfers" className="text-xs font-bold text-blue-400 hover:underline">
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {topTransfers.map((t) => (
                <TransferCenterCard key={t.id} transfer={t} />
              ))}
            </div>
          </div>
        </div>
      }
    >
      {/* Live Match Engine Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-600/30 text-emerald-400 text-sm">
              ⚡
            </span>
            <span>Live Match Center & Fixtures</span>
          </h2>
        </div>
        <FootballScreen />
      </section>

      {/* Featured Intelligence Grid */}
      {featuredArticles.length > 0 && (
        <RelatedArticlesMatrix
          title="Top Football Intelligence & Reports"
          subtitle="Curated breaking stories, tactical columns, and exclusive reports"
          articles={featuredArticles}
        />
      )}

      {/* Tactical Analysis Section */}
      {tacticalArticles.length > 0 && (
        <RelatedArticlesMatrix
          title="Tactical Breakdowns & Team Philosophy"
          subtitle="Masterclass match analysis, pressing frameworks, and player roles"
          articles={tacticalArticles}
        />
      )}
    </ContentHubLayout>
  );
}
