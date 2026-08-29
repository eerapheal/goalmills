import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import dbConnect from '@/lib/db';
import News from '@/models/News';
import { EntityService, CLUBS_REGISTRY } from '@/lib/entityService';
import { ContentHubLayout } from '@/components/ContentHubLayout';
import { RelatedArticlesMatrix } from '@/components/RelatedArticlesMatrix';
import { TransferCenterCard } from '@/components/TransferCenterCard';
import { FootballScreen } from '@/components/FootballScreen';
import {
  FiArrowRight,
  FiShield,
  FiTrendingUp,
  FiZap,
  FiAward,
  FiActivity,
  FiMail,
} from 'react-icons/fi';
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
        $or: [{ articleType: 'tactical_analysis' }, { category: { $regex: /analysis|tactics/i } }],
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
  const topTransfers = EntityService.getTransfers().slice(0, 3);
  const featuredClubs = Object.values(CLUBS_REGISTRY).slice(0, 8);

  return (
    <ContentHubLayout
      breadcrumbs={[{ name: 'Football Hub', url: '/football' }]}
      header={
        <div className="space-y-4">
          {/* Live Football Ticker Marquee */}
          <div className="w-full rounded-2xl bg-[#09162C] border border-blue-500/25 px-4 py-2 overflow-hidden shadow-lg flex items-center gap-3">
            <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              LIVE WIRE
            </span>
            <div className="overflow-hidden whitespace-nowrap w-full">
              <p className="text-xs text-slate-300 font-medium inline-block animate-marquee">
                ⚽ UEFA Champions League Knockouts • Premier League Title Race • Real Madrid & Barcelona El Clásico Intel • CAF AFCON Qualifiers • Real-Time LiveScores & Video Analysis
              </p>
            </div>
          </div>

          {/* Hero Banner Card */}
          <div className="relative overflow-hidden rounded-3xl border border-blue-500/25 bg-gradient-to-br from-[#08142A] via-[#0B1E3E] to-[#060D18] p-6 sm:p-10 shadow-2xl shadow-blue-950/50">
            <div className="absolute top-0 right-0 w-96 h-64 bg-blue-600/15 blur-3xl pointer-events-none -z-0" />
            <div className="absolute bottom-0 left-1/3 w-80 h-48 bg-amber-500/10 blur-3xl pointer-events-none -z-0" />

            <div className="relative z-10 max-w-4xl space-y-4">
              {/* Level 1 Sport Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-black uppercase tracking-wider shadow-sm">
                <span className="text-amber-400">⚽</span>
                <span>LEVEL 1 SPORT INTELLIGENCE NETWORK</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                Global Football <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300">Live Hub</span>
              </h1>

              {/* Subtitle description */}
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
                Real-time live scores, European and African championships, deep tactical frameworks, confirmed transfer desk intelligence, and comprehensive club ecosystem networks.
              </p>

              {/* Quick Intelligence KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="p-3 rounded-2xl bg-[#091529]/80 border border-blue-500/20 backdrop-blur-md">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Competitions</span>
                  <span className="text-lg sm:text-xl font-black text-white">30+ Leagues</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#091529]/80 border border-blue-500/20 backdrop-blur-md">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Match Telemetry</span>
                  <span className="text-lg sm:text-xl font-black text-amber-400">Real-Time</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#091529]/80 border border-blue-500/20 backdrop-blur-md">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Transfer Intel</span>
                  <span className="text-lg sm:text-xl font-black text-emerald-400">Verified</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#091529]/80 border border-blue-500/20 backdrop-blur-md">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Tactical Matrix</span>
                  <span className="text-lg sm:text-xl font-black text-sky-400">Masterclass</span>
                </div>
              </div>

              {/* Quick Competitions Ribbon */}
              <div className="pt-3 border-t border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <FiAward className="text-amber-400 text-xs" />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Popular Leagues & Cups:
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {competitions.map((comp) => (
                    <Link
                      key={comp.slug}
                      href={`/football/${comp.slug}`}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#091529]/80 hover:bg-blue-600/30 border border-blue-500/20 hover:border-amber-400/40 text-xs font-bold text-slate-200 hover:text-white transition-all shadow-md group"
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
                      <span className="group-hover:text-amber-300 transition-colors">{comp.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      }
      sidebar={
        <div className="space-y-6">
          {/* Major Competitions Quick Navigator */}
          <div className="rounded-3xl border border-blue-500/20 bg-[#0A162B]/90 p-5 space-y-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiAward className="text-amber-400" />
                <span>Major Competitions</span>
              </h3>
              <span className="text-[10px] text-amber-400 uppercase font-bold font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                Tier 1
              </span>
            </div>
            <div className="space-y-2">
              {competitions.map((comp) => (
                <Link
                  key={comp.slug}
                  href={`/football/${comp.slug}`}
                  className="group flex items-center justify-between p-3 rounded-2xl bg-[#070F1E] hover:bg-blue-600/20 border border-blue-500/15 hover:border-amber-400/40 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-9 w-9 rounded-xl bg-slate-900 border border-white/10 p-1.5 flex items-center justify-center group-hover:border-blue-400 transition-colors">
                      <Image
                        src={comp.logo}
                        alt={comp.name}
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                        {comp.name}
                      </h4>
                      <p className="text-[10px] text-slate-400">{comp.country}</p>
                    </div>
                  </div>
                  <FiArrowRight
                    size={14}
                    className="text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Featured Club Hubs */}
          <div className="rounded-3xl border border-blue-500/20 bg-[#0A162B]/90 p-5 space-y-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiShield className="text-blue-400" />
                <span>Featured Club Hubs</span>
              </h3>
              <span className="text-[10px] text-blue-300 uppercase font-bold font-mono">
                Level 3
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {featuredClubs.map((club) => (
                <Link
                  key={club.slug}
                  href={`/football/${club.competitionSlug}/${club.slug}`}
                  className="group flex flex-col items-center text-center p-3 rounded-2xl bg-[#070F1E] hover:bg-blue-600/20 border border-blue-500/15 hover:border-blue-400/40 transition-all"
                >
                  <div className="relative h-10 w-10 rounded-xl bg-slate-900 border border-white/10 p-1.5 mb-2 flex items-center justify-center group-hover:scale-105 transition-transform">
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
                  <span className="text-[9px] text-slate-400 font-semibold truncate max-w-full">
                    {club.manager}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Trending Transfers Desk */}
          <div className="rounded-3xl border border-blue-500/20 bg-[#0A162B]/90 p-5 space-y-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiTrendingUp className="text-amber-400" />
                <span>Transfer Desk</span>
              </h3>
              <Link
                href="/transfers"
                className="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {topTransfers.map((t) => (
                <TransferCenterCard key={t.id} transfer={t} />
              ))}
            </div>
          </div>

          {/* VIP Football Newsletter Box */}
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#0E1E38] to-[#081224] p-5 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
              <FiMail className="w-4 h-4" />
              <span>Football Wire VIP</span>
            </div>
            <h4 className="text-sm font-black text-white">
              Get Daily Morning Match Briefs & Transfer Flashes
            </h4>
            <p className="text-xs text-slate-300">
              Delivered directly to your inbox before kickoff. Free forever.
            </p>
            <Link
              href="/newsletter"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:from-amber-400 hover:to-orange-400 transition-all"
            >
              <span>Subscribe Now</span>
              <FiArrowRight size={13} />
            </Link>
          </div>
        </div>
      }
    >
      {/* Live Match Engine Section */}
      <section className="space-y-4">
        <FootballScreen />
      </section>

      {/* Featured Intelligence Grid */}
      {featuredArticles.length > 0 && (
        <div className="pt-6 border-t border-white/10">
          <RelatedArticlesMatrix
            title="Top Football Intelligence & Reports"
            subtitle="Curated breaking stories, tactical columns, and exclusive reports"
            articles={featuredArticles}
          />
        </div>
      )}

      {/* Tactical Analysis Section */}
      {tacticalArticles.length > 0 && (
        <div className="pt-6 border-t border-white/10">
          <RelatedArticlesMatrix
            title="Tactical Breakdowns & Team Philosophy"
            subtitle="Masterclass match analysis, pressing frameworks, and player roles"
            articles={tacticalArticles}
          />
        </div>
      )}
    </ContentHubLayout>
  );
}
