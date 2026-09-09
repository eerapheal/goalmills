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
  FiUsers,
} from 'react-icons/fi';
import { BlogPost } from '@goalmills/types';
import { LiveNewsFlashTicker } from '@/components/LiveNewsFlashTicker';
import { AllMajorCompetitionsSection } from '@/components/competitions/AllMajorCompetitionsSection';
import { AfricanFootballHeroSpotlight } from '@/components/football/AfricanFootballHeroSpotlight';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'GoalMills Africa | Live Scores, CAF Champions League, NPFL, PSL & 2026/2027 Superstars Market Values',
  description:
    'Africa’s premier football intelligence platform for the 2026/2027 season. Live CAF Champions League, NPFL, Betway Premiership PSL, Botola Pro scores, AFCON 2027 qualifiers, and authentic real-time market values for Victor Osimhen, Mo Salah, Ademola Lookman, and Achraf Hakimi.',
  keywords: [
    'African football live scores',
    'CAF Champions League 2026/2027',
    'CAF Confederation Cup',
    'NPFL live scores Nigeria',
    'Betway Premiership South Africa PSL',
    'Botola Pro Morocco live',
    'Egyptian Premier League Al Ahly',
    'AFCON 2027 qualifiers',
    'Victor Osimhen transfer value 2026/2027',
    'Mohamed Salah Liverpool stats',
    'Ademola Lookman Atalanta',
    'Achraf Hakimi PSG',
    'African superstars in Europe',
    'GoalMills Africa',
  ],
  openGraph: {
    title: 'GoalMills Africa | Live Scores, CAF Competitions & Superstars (2026/2027)',
    description:
      'Live CAF Champions League, NPFL, PSL, AFCON 2027 qualifiers, and real-time market valuations for African football superstars.',
    siteName: 'GoalMills Africa',
    type: 'website',
  },
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

  const topTransfers = EntityService.getTransfers().slice(0, 3);
  const africanClubs = EntityService.getAfricanClubs();
  const featuredClubs = [...africanClubs, ...Object.values(CLUBS_REGISTRY)].slice(0, 8);
  const africanPlayers = EntityService.getAfricanPlayers();

  return (
    <ContentHubLayout
      breadcrumbs={[{ name: 'Football Hub', url: '/football' }]}
      header={<LiveNewsFlashTicker sport="football" badgeText="AFRICA FOOTBALL WIRE" />}
      sidebar={
        <div className="space-y-6">
          {/* Trending Transfers Desk */}
          <div className="rounded-3xl border border-blue-500/20 bg-[#0A162B]/90 p-5 space-y-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiTrendingUp className="text-amber-400" />
                <span>Transfer News & Rumours</span>
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

          {/* Featured Club Hubs */}
          <div className="rounded-3xl border border-blue-500/20 bg-[#0A162B]/90 p-5 space-y-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiShield className="text-blue-400" />
                <span>Featured Club Hubs</span>
              </h3>
              <span className="text-[10px] text-blue-300 uppercase font-bold font-mono">
                Teams
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {featuredClubs.map((club) => (
                <Link
                  key={club.slug}
                  href={`/football/teams/${club.slug}`}
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

          {/* Superstars & Players Hub Quick Link */}
          <div className="rounded-3xl border border-blue-500/25 bg-gradient-to-br from-[#09152B] to-[#070F1E] p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiUsers className="text-amber-400" />
                <span>Superstars & Players</span>
              </h3>
              <Link
                href="/football/players"
                className="text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline"
              >
                Explore →
              </Link>
            </div>
            <p className="text-xs text-slate-300">
              Browse 2025/2026 performance ratings, season goals, assist metrics, and head-to-head comparison intel.
            </p>
            <Link
              href="/football/players"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-200 font-bold text-xs uppercase tracking-wider transition-all"
            >
              <span>Explore 26+ Superstars</span>
              <FiArrowRight size={13} />
            </Link>
          </div>

          {/* Match Officials & VAR Desk */}
          <div className="rounded-3xl border border-amber-500/25 bg-gradient-to-br from-[#09152B] to-[#070F1E] p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span className="text-amber-400">🚩</span>
                <span>Match Officials & VAR</span>
              </h3>
              <Link
                href="/football/officials"
                className="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline"
              >
                Explore →
              </Link>
            </div>
            <p className="text-xs text-slate-300">
              Foul tolerances, cards per game, penalty award ratios, and VAR overturn precision across 14+ elite referees.
            </p>
            <Link
              href="/football/officials"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold text-xs uppercase tracking-wider border border-amber-500/30 transition-all"
            >
              <span>Inspect Match Officials</span>
              <FiArrowRight size={13} />
            </Link>
          </div>

          {/* World-Class Managers & Tactics */}
          <div className="rounded-3xl border border-blue-500/25 bg-gradient-to-br from-[#09152B] to-[#070F1E] p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>🧑‍💼</span>
                <span>Tacticians & Managers</span>
              </h3>
              <Link
                href="/football/coaches"
                className="text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline"
              >
                Explore →
              </Link>
            </div>
            <p className="text-xs text-slate-300">
              Preferred systems, win percentages, pressing styles, and trophy cabinets for top European managers.
            </p>
            <Link
              href="/football/coaches"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-200 font-bold text-xs uppercase tracking-wider transition-all"
            >
              <span>Browse Elite Managers</span>
              <FiArrowRight size={13} />
            </Link>
          </div>

          {/* VIP Football Newsletter Box */}
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#0E1E38] to-[#081224] p-5 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
              <FiMail className="w-4 h-4" />
              <span>Football Daily Brief</span>
            </div>
            <h4 className="text-sm font-black text-white">
              Get Daily Morning Match Previews & Transfer Flashes
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
      {/* African Football Power & Superstars Hero Spotlight (2026/2027) */}
      <AfricanFootballHeroSpotlight initialPlayers={africanPlayers} />

      {/* Live Match Engine Section */}
      <section className="space-y-4">
        <FootballScreen />
      </section>

      {/* ─── All Major Competitions Interactive Section & Dropdown ─────────────────────────────── */}
      <AllMajorCompetitionsSection />

      {/* Featured Articles Grid */}
      {featuredArticles.length > 0 && (
        <div className="pt-6 border-t border-white/10">
          <RelatedArticlesMatrix
            title="Football Reports"
            subtitle="Curated breaking stories, tactical columns, and post-match analysis"
            articles={featuredArticles}
          />
        </div>
      )}

      {/* Tactical Analysis Section */}
      {tacticalArticles.length > 0 && (
        <div className="pt-6 border-t border-white/10 text-md">
          <RelatedArticlesMatrix
            title="Tactical Analysis & Match Previews"
            subtitle="In-depth match previews, pressing systems, and predicted lineups"
            articles={tacticalArticles}
          />
        </div>
      )}
    </ContentHubLayout>
  );
}
